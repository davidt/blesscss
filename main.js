require.paths.unshift('./node_modules');
var express    = require('express'),
    formidable = require('formidable'),
    less       = require('less');

function compile(req, res, cssOptions) {
    var fields = {},
        files = {},
        filenames = [];

    function error(err) {
        console.log('Failed:', err);
        res.writeHead(400, {'content-type': 'text/plain'});
        res.end(err);
    }

    new formidable.IncomingForm().on('field', function(field, value) {
        files[field] = value;
        filenames.push(field);
    }).on('error', function(err) {
        error(err);
    }).on('end', function() {
        if (filenames.length == 0) {
            error('No files present in POST data\n');
            return;
        }
        console.log('Servicing request for ' + filenames.length + ' files');
        if (cssOptions && cssOptions['compress']) {
            console.log('Minifying output');
        }
        console.log(filenames);

        // For now we assume that the first file present in the POST data is the
        // "master" file (which imports everything else). This is probably a
        // poor choice.
        var index = filenames[0];

        // Override less's importer so that we can pull them out of the form
        // multipart data instead of trying to hit the filesystem.
        less.Parser.importer = function(path, paths, callback) {
            if (files[path] == undefined) {
                error('Attempted to import "' + path + '" but no such file included in form data.\n')
                return;
            }

            new(less.Parser)({ filename: path, }).parse(files[path], function(err, tree) {
                if (err) {
                    error(err);
                    return;
                }
                callback(tree);
            });
        }
        new(less.Parser)({ filename: index, }).parse(files[index], function(err, tree) {
            if (err) {
                error(err);
            } else {
                res.writeHead(200, {'content-type': 'text/plain'});
                res.end(tree.toCSS(cssOptions));
            }
        });
    }).parse(req);
}

server = express.createServer();
server.post('/', function(req, res) { compile(req, res); });
server.post('/min', function(req, res) { compile(req, res, { compress: true }); });
server.listen(process.env.VMC_APP_PORT || 3000);
