const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { initSocket } = require("./socket");
const path = require("path");
const fs = require("fs");


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);

      // ✅ Serve files from public/uploads/
      if (req.url.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, 'public', req.url);
        
        console.log('📂 Requested:', req.url);
        console.log('📍 Looking for file at:', filePath);
        console.log('✅ File exists:', fs.existsSync(filePath));
        
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          const ext = path.extname(filePath).toLowerCase();
          
          // MIME types
          const mimeTypes = {
            '.webm': 'audio/webm',
            '.mp3': 'audio/mpeg',
            '.ogg': 'audio/ogg',
            '.wav': 'audio/wav',
            '.m4a': 'audio/mp4'
          };
          
          const contentType = mimeTypes[ext] || 'application/octet-stream';
          
          // Set headers
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Cache-Control', 'public, max-age=0'); // Production mein caching disable for testing
          
          // CORS headers (ngrok ke liye)
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          
          console.log('✅ Sending file:', filePath);
          
          // Stream the file
          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(res);
          
          fileStream.on('error', (error) => {
            console.error('❌ File streaming error:', error);
            res.statusCode = 500;
            res.end('Error reading file');
          });
          
          return;
        } else {
          console.error('❌ File not found:', filePath);
          res.statusCode = 404;
          res.end('File not found');
          return;
        }
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  initSocket(httpServer);

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log(`🔌 Socket.IO server running`);
    });
});
