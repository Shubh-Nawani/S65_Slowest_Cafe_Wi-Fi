const express = require('express');
const app = express();
const PORT = 3000;

// Define /ping route
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).send('Sorry, we could not find that!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
