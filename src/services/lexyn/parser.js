/*
 *  The MIT License
 *
 *  Copyright 2011 Greg.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import fs from 'fs'

const grammer = require('./grammer')
const LRClosureTable = require('./lrclosuretable').LRClosureTable
const LRTable = require('./lrtable').LRTable
const CliTable = require('cli-table')
const LL1 = require('./ll1')

const colors = require('colors');

const {
    extend,
    resize,
    assertEquals,
    assertEquality,
    $,
    indexOfUsingEquals,
    addUniqueUsingEquals,
    isElementUsingEquals,
    addUnique,
    isElement,
    trimElements,
    getOrCreateArray,
    includeEachOtherUsingEquals,
    includesUsingEquals,
    includeEachOther,
    includes,
    newObject,
    EPSILON
} = require('./tools')

const Tree = require('./tree')
const chooseActionElement = require('./lrtable').chooseActionElement

/**
 * Use formatInitialParseView() to create a parse view before calling this function.
 */
function parseInput(lrTable, inputStr, maximumStepCount) {
    var stack = [0];

    function stateIndex() {
        return stack[2 * ((stack.length - 1) >> 1)];
    }

    inputStr = inputStr.trim().replace(/ /g, '')

    var tokens = (inputStr + '$').split('');
    var tokenIndex = 0;
    var token = tokens[tokenIndex];
    var state = lrTable.states[stateIndex()];
    var action = state[token];
    var actionElement = chooseActionElement(state, token);

    var rows = [
        [(1 + ''), formatStack(stack), formatInput(tokens, tokenIndex), formatAction(state, token, true)]
    ]
    var i = 2;

    while (i <= maximumStepCount && action !== undefined && actionElement !== 'r0') {
        if (actionElement.actionType === 's') {
            stack.push(tokens[tokenIndex++]);
            stack.push(parseInt(actionElement.actionValue));
        } else if (actionElement.actionType === 'r') {
            var ruleIndex = actionElement.actionValue;
            var rule = lrTable.grammar.rules[ruleIndex];
            var removeCount = isElement(EPSILON, rule.development) ? 0 : rule.development.length * 2;
            var removedElements = stack.splice(stack.length - removeCount, removeCount);
            var node = new Tree(rule.nonterminal, []);

            for (var j = 0; j < removedElements.length; j += 2) {
                node.children.push(removedElements[j]);
            }

            stack.push(node);
        } else {
            stack.push(parseInt(actionElement));
        }

        var state = lrTable.states[stateIndex()];
        var token = stack.length % 2 == 0 ? stack[stack.length - 1] : tokens[tokenIndex];
        action = state[token];
        actionElement = chooseActionElement(state, token);

        rows.push([(i + ''), formatStack(stack), formatInput(tokens, tokenIndex), formatAction(state, token, true)]);
        ++i;
    }

    const table = new CliTable({
        head: ['step', 'STACK', 'INPUT', 'ACTION']
    });
    table.push(...rows)

    let tableStr = table.toString()

    if (tableStr.search('acc') === -1)
        console.log('string not accepted!'.red)
    else {
        console.log('Parsing Steps:'.cyan)
        console.log(tableStr)
        console.log('string accepted!'.green)
    }

    // console.log(table.toString())

    // return [...['step', 'STACK', 'INPUT', 'ACTION'],rows]
    return {
        header: ['step', 'STACK', 'INPUT', 'ACTION'],
        rows,
        accepted: tableStr.search('acc') !== -1
    }
}

function formatStack(stack) {
    var result = stack.slice(0);

    for (var i = 0; i < result.length; i += 2) {
        result[i] = (result[i] + '');
    }

    return result.join(' ');
}

function formatInput(tokens, tokenIndex) {
    return tokens.slice(tokenIndex).join(' ')
}


function cleanGrammerText(grammer) {
    try {
        var lines = grammer.split('\n')
        var result = ''
        var rules = []
        for (var line of lines) {
            var parts = line.split('->')
            if (parts.length !== 2)
                continue

            var left = parts[0].trim()
            var right = parts[1].trim().replace(/ /g, '')

            if (left === "S'" && right === 'S$')
                right = 'S'

            var rule = left + ' -> ' + right.split('').join(' ')
            rules.push(rule)
        }
        result = rules.join('\n').replace(/#/g, "''")
        return result
    } catch (e) {
        process.exit('Unable to read grammer')
    }
}

function formatLrTable(lr) {
    const g = lr.grammar
    const terms = g.terminals.concat(['$'].concat(g.nonterminals))

    const tableHead = ['#']
    for (var t of terms)
        tableHead.push(t)


    var rows = []
    for (var state of lr.states) {
        var row = [state.index]

        for (var t of terms) {
            row.push(formatAction(state, t))
        }

        rows.push(row)
    }

    const table = new CliTable({
        head: tableHead
    });

    table.push(...rows)

    console.log(table.toString())

    // return [...terms, rows]
    return {
        header: terms,
        rows
    }
}

function formatAction(state, token, forceSingleAction) {
    var action = state[token]
    if (action === undefined)
        return ''

    if (forceSingleAction === undefined)
        forceSingleAction = false

    var result = ''
    if (action.length > 1 && !forceSingleAction) {
        let actions = []
        for (var a of action)
            actions.push(a.toString())
        result = actions.join('/')
    } else {
        result = action[0].toString()
        if (result === 'r0')
            result = 'acc'

        if (forceSingleAction && action[0].actionType === '')
            result = 'goto ' + result
    }

    return result
}

function renderParsingSteps(lr, input) {
    return parseInput(lr, input, 100)
}

function handleParsing(data, method, input) {
    var txt = cleanGrammerText(data)

    if (method === 'lr1')
        var Item = require('./lr1item')
    else if (method === 'slr1')
        var Item = require('./slritem')
    else if (method === 'lalr1')
        var Item = require('./lalr1item')
    else if (method === 'll1') {
        // LL1.handleLl1(txt, input)
        let ll1Res = LL1.handleLl1(txt, input)
        return {
            'grammar': txt,
            'states': ll1Res.states,
            'parse-table': ll1Res['parse-table']
        }
        process.exit(0)
    } else
        process.exit(0)

    var g = new grammer.Grammar(txt)
    var lrClosureTable = new LRClosureTable(g, Item);
    var lr = new LRTable(lrClosureTable);

    console.log('')
    console.log((Item.prototype.grammarType + ' Parse Table:').cyan)
    // console.log(formatLrTable(lr))

    var outPut = {
        'grammar': txt,
        'states': formatLrTable(lr)
    }

    if (input) {
        outPut['parse-table'] = renderParsingSteps(lr, input)
    }

    return outPut

}

function parse(src, method, input) {
    fs.readFile(src, 'ascii', function (err, data) {
        if (err) {
            return console.log(err);
        }

        return handleParsing(data, method, input)
    });
}

module.exports = {
    parse: parse,
    handleParsing: handleParsing
}
