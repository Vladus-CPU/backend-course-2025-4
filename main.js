const fs = require('fs');
const http = require('http');
const commander = require('commander');
const url = require('url');
const { XMLBuilder } = require('fast-xml-parser');

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
    const parsedUrl = url.parse(request.url, true);
    const query = parsedUrl.query;
    const mfo = query.mfo === 'true';
    const normal = query.normal === 'true';
    fs.readFile(options.input, 'utf8', function(err, data) {
        if (err) {
            response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Помилка читання файлу');
            return;
        }
            let banks = JSON.parse(data);
            if (normal) {
                const FilterNormal = [];
                for (const bank of banks) {
                    if (bank.COD_STATE === 1) {
                        FilterNormal.push(bank);
                    }
                }
                banks = FilterNormal;
            }
            const results = [];
            for (const bank of banks) {
                let result = {};
                if (mfo) {
                    result.mfo = bank.MFO;
                }
                result.name = bank.FULLNAME || bank.SHORTNAME || undefined;
                result.namestate = bank.NAME_STATE;
                result.stetecode = bank.COD_STATE;
                result.firstname = bank.FIRST_NAME || undefined;
                result.posada = bank.NAME_DOLGN || undefined;
                results.push(result);
            }
            const builder = new XMLBuilder();
            const XMLObj = {
                banks: {
                    bank: results
                }
            };
            const XMlresult = builder.build(XMLObj);
            fs.writeFile('output.xml', XMlresult, function(err) {
                if (err) {
                    console.error('Помилка запису файлу');
                }
            });
            response.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
            response.end(XMlresult);
    });
});

server.listen(options.port, options.host, function() {
    console.log(`Сервер успішно запущено на http://${options.host}:${options.port}`);
});