import http from 'http';

const PORT = process.env.PORT || 8080;

export function startServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200);
      res.end('OK');
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  return new Promise((resolve, reject) => {
    server.listen(PORT, () => {
      console.log(`[DEBUG] Server listening on port ${PORT}`);
      resolve(server);
    });

    server.on('error', (error) => {
      console.error('[DEBUG] Server error:', error);
      reject(error);
    });
  });
}