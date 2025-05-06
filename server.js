import express from 'express';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();



async function callInitEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/api/init');
    const data = await response.json();
    console.log('Init endpoint response:', data);
  } catch (error) {
    console.error('Error calling init endpoint:', error);
  }
}

app.prepare().then(() => {
  const server = express();

  // Basic middleware
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // Error handling middleware
  server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    // Call init endpoint after 3 seconds
    setTimeout(callInitEndpoint, 3000);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
}); 