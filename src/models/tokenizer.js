import {tokenize} from './../services/lexyn/tokenizer'
import fs from 'fs'

require.extensions['.txt'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

export function main() {
    let path = tokenize('src/assets/py_lex_test.txt', 'src/assets/tmp.txt')
    path = path.replace('src', './..')
    let data = require(path);
    return data
}

const tokenizeModel = main();
export default tokenizeModel;
