import http from 'http';

const PORT = process.env.PORT || 8080;
let isHealthy = false;

export function startServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      const status = isHealthy ? 200 : 503;
      res.writeHead(status, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  return new Promise((resolve, reject) => {
    server.listen(PORT, () => {
      console.log(`[DEBUG] Server listening on port ${PORT}`);
      isHealthy = true;
      resolve(server);
    });

    server.on('error', (error) => {
      console.error('[DEBUG] Server error:', error);
      isHealthy = false;
      reject(error);
    });
  });
}