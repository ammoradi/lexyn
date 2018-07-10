const execFile = require('child_process').execFile

function tokenize(src, dst) {
    let finalDest = ''
    const child = execFile('python3', ['src/services/lexyn/python_lexer.py', src, dst], (error, stdout, stderr) => {
        if (error) {
            console.error('stderr', stderr)
            process.exit(0)
        }
        if (stdout.lenght > 0)
            console.log(stdout)

        finalDest = dst
    })
    return dst
}

module.exports = {
    tokenize: tokenize
}
