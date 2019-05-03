'use strict';
const app = require('./app');
const { NODE_ENV, PORT } = require('./config');

app.listen(PORT, () => {
  if (NODE_ENV !== 'production') {
    console.log(`Server listening at http://localhost:${PORT}`);
  }
});