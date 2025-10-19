const fs = require('fs');
const http = require('http');
const commander = require('commander');

const program = commander.program;
program
    .requiredOption('-i, --input <path>', 'шлях до файлу')
    .requiredOption('-h, --host <string>', 'адреса сервера')
    .requiredOption('-p, --port <number>', 'порт сервера');

program.parse(process.argv);
const options = program.opts();

if (!fs.existsSync(options.input)) {
    console.error('Cannot find input file');
    process.exit(1); 
}
const server = http.Server(function(request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Сервер запущено test 2 ');
});

server.listen(options.port, options.host, function() {
    console.log(`Сервер успішно запущено на http://${options.host}:${options.port}`);
});