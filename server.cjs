const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
// Set the root to the 'docs' directory
const projectRoot = path.join(__dirname, 'docs'); 

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const csp = "script-src 'self' https://kit.fontawesome.com https://embed.twitch.tv; object-src 'none';";

http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);

    // Sanitize the requested URL to prevent directory traversal
    const sanitizedUrl = path.normalize(req.url).replace(/^(\.\.?[\/\\])+/, '');
    let filePath = path.join(projectRoot, sanitizedUrl);

    // If the request is for a directory, serve the index.html file
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                // Page not found
                res.writeHead(404, { 'Content-Type': 'text/html', 'Content-Security-Policy': csp });
                res.end(`<h1>404 Not Found</h1><p>The server could not find the file at: ${filePath}</p>`);
            } else {
                // Some other server error
                res.writeHead(500, {'Content-Security-Policy': csp});
                res.end('Sorry, check with the site admin for error: '+err.code+' ..\n');
            }
        } else {
            // Success
            const extname = path.extname(filePath);
            const contentType = mimeTypes[extname] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType, 'Content-Security-Policy': csp });
            res.end(content, 'utf-8');
        }
    });

}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
