'use strict';
/* globals supertest */
process.env.TZ = 'UTC';
const knex = require('knex');
const app = require('../../src/app');
const BookmarkFixture = require('../fixtures/bookmark-fixture');
const BookmarksService = require('../../src/bookmarks/bookmarks-service');

describe('Bookmarks Controller', () => {
  let db;
  before('establish db', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_BOOKMARKS_DB_URL
    });
  });

  before('wipe all table data', () => db('bookmarks').truncate());
  after('close db connection', () => db.destroy());

  beforeEach('make db available to request', () => app.set('db', db));
  afterEach('wipe all data from table', () => db('bookmarks').truncate());

  describe('GET /bookmarks', () => {
    context('when bookmarks exist', () => {
      const testBookmarks = BookmarkFixture.createBookmarks();
      beforeEach('seed test bookmarks', () => db('bookmarks').insert(testBookmarks));
  
      it('returns an array of bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .expect(200)
          .then(res => {
            const expected = testBookmarks.map(bookmark => bookmark.title);
            const actual = res.body.map(bookmark => bookmark.title);
            expect(actual).to.eql(expected);
          });
      });
    });

    context('when no bookmarks exist', () => {
      it('returns an empty array', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .expect(200, []);
      });
    });
  });

  describe('GET /bookmarks/:bookmarkId', () => {
    context('when bookmark exist', () => {
      const testBookmarks = BookmarkFixture.createBookmarks();
      beforeEach('seed test bookmarks', () => db('bookmarks').insert(testBookmarks));

      it('returns the bookmark obj', async () => {
        const bookmark = await BookmarksService.last(db);
        return supertest(app)
          .get(`/bookmarks/${bookmark.id}`)
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .expect(200)
          .then(res => {
            expect(res.body.id).to.eql(bookmark.id);
          });
      });
    });

    context('when bookmark doesn\'t exist', () => {
      it('returns a 404', () => {
        return supertest(app)
          .get('/bookmarks/4000000')
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .expect(404);
      });
    });

    context('when non integer id given', () => {
      it('returns a 400', () => {
        return supertest(app)
          .get('/bookmarks/abc123')
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .expect(400);
      });
    });
  });

  describe('POST /bookmarks', () => {
    context('when all fields are correctly provided', () => {
      it('creates a new bookmark', () => {
        const bookmark = {title: 'New Bookmark', url: 'test.com', rating: '5'};
        return supertest(app)
          .post('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .send(bookmark)
          .expect(201)
          .then(res => {
            expect(res.body.title).to.eql(bookmark.title);
            expect(res.headers.location).to.equal(`/bookmarks/${res.body.id}`);
          });
      });
    });

    context('when a field is improperly submitted', () => {
      it('returns a 400 with no url given', () => {
        const bookmark = {title: 'New Bookmark', rating: '5'};
        return supertest(app)
          .post('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .send(bookmark)
          .expect(400);
      });
    });
  });

  describe('PATCH /bookmarks/:bookmarkId', () => {
    const testBookmarks = BookmarkFixture.createBookmarks();
    beforeEach('seed test bookmarks', () => db('bookmarks').insert(testBookmarks));

    context('when all required fields are met', () => {
      it('updates a bookmark and returns it', async () => {
        const bookmark = await BookmarksService.last(db);
        
        return supertest(app)
          .patch(`/bookmarks/${bookmark.id}`)
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .send({title: 'Updated Title!'})
          .expect(200, {});
      });
    });

    context('when invalid fields present', () => {
      it('returns a 400 with invalid url', async () => {
        const bookmark = await BookmarksService.last(db);
        
        return supertest(app)
          .patch(`/bookmarks/${bookmark.id}`)
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .send({title: 'Updated Title!', url: 'invalid'})
          .expect(400);
      });
    });
  });

  describe('DELETE /bookmarks/:bookmarkId', () => {
    context('when bookmark is found', () => {
      const testBookmarks = BookmarkFixture.createBookmarks();
      beforeEach('seed test bookmarks', () => db('bookmarks').insert(testBookmarks));

      it('deletes the bookmark', async () => {
        const bookmark = await BookmarksService.last(db);
        
        return supertest(app)
          .delete(`/bookmarks/${bookmark.id}`)
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .expect(200)
          .then(() => {
            return supertest(app)
              .get(`/articles/${bookmark.id}`)
              .set('Authorization', `Bearer ${process.env.API_KEY}`)
              .expect(404);
          });
      });
    });

    context('when no bookmark exist', () => {
      it('returns a 404', () => {
        return supertest(app)
          .delete('/bookmarks/400000')
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .expect(404);
      });
    });
  });
  
  

});

