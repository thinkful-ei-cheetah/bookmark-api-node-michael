'use strict';
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEV_BOOKMARKS_DB_URL: process.env.DEV_BOOKMARKS_DB_URL || 
                        'postgres://postgres@localhost/bookmarks',
  TEST_BOOKMARKS_DB_URL: process.env.TEST_BOOKMARKS_DB_URL ||
                        'postgres://postgres@localhost/bookmarks-test',
  
};