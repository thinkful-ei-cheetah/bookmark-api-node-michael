'use strict';

const BookmarksService = {
  list(knex){
    return knex('bookmarks').select('*');
  },

  findById(knex, id) {
    return knex('bookmarks').where({id}).first('*');
  },

  insert(knex, bookmark) {
    return knex('bookmarks')
      .insert(bookmark)
      .returning('*')
      .then(rows => rows[0]);
  },

  update(knex, id, fields) {
    return knex('bookmarks')
      .where({id})
      .update(fields)
      .returning('*')
      .then(rows => rows[0]);
  },

  delete(knex, id){
    return knex('bookmarks').where({id}).delete();
  },
  
  last(knex) {
    return knex('bookmarks').orderBy('created_at', 'desc').limit(1).first('*');
  }
};

module.exports = BookmarksService;