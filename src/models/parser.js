import {parse} from './../services/lexyn/parser'

export function parser(method) {
    let parsed = parse('src/assets/grammar1.txt', method)
    return parse('src/assets/grammar1.txt', method)
}

export default parser;
