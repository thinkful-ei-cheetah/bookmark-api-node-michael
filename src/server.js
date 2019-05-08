'use strict';
const app = require('./app');
const knex = require('knex');
const { NODE_ENV, PORT, DEV_BOOKMARKS_DB_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DEV_BOOKMARKS_DB_URL
});

app.set('db', db);

app.listen(PORT, () => {
  if (NODE_ENV !== 'production') {
    console.log(`Server listening at http://localhost:${PORT}`);
  }
});