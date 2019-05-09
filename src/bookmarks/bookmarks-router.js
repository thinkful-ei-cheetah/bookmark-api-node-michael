'use strict';
const express = require('express');
const bookmarksRouter = express.Router();
const bodyParser = express.json();
const xss = require('xss');

const BookmarksService = require('./bookmarks-service');

const ensureFields = (fields) => (req, res, next) => {
  fields.forEach(field => {
    if (!req.body[field]) {
      return next({message: `${field} is required`, status: 400});
    }
  });
  return next();
};

const validateUrl = (req, res, next) => {
  const regex = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi;
  const {url} = req.body;

  if (url && !regex.test(url)) {
    return next({message: 'invalid url format', status: 400});
  }
  return next();
};

const validateRating = (req, res, next) => {
  const {rating} = req.body;
  if (rating && (rating < 1 || rating > 5)) {
    return next({message: 'rating must be between 1-5', status: 400});
  }
  return next();
};

const ensureBookmark = async (req, res, next) => {
  const {bookmarkId} = req.params;
  const db = req.app.get('db');
  if (isNaN(Number(bookmarkId))) {
    return next({message: 'invalid bookmark id', status: 400});
  }

  try {
    const bookmark = await BookmarksService.findById(db, bookmarkId);
    
    if (!bookmark) {
      return next({message: `unable to find bookmark with id ${bookmarkId}`, status: 404});
    }

    return next();
  } catch(err) {
    return next(err);
  }
};

bookmarksRouter
  .route('/bookmarks')
  .get(async (req, res, next) => {
    const db = req.app.get('db');
    try {
      const bookmarks = await BookmarksService.list(db);
      res.json(bookmarks);
    } catch(err) {
      next(err);
    }
  })
  .post(
    bodyParser,
    ensureFields(['title', 'url']),
    validateUrl,
    validateRating,
    async (req, res, next) => {
      const db = req.app.get('db');
      const bookmark = {};
      const allowed = ['title', 'url', 'desc', 'rating'];
      Object.keys(req.body).forEach(key => {
        if (allowed.includes(key)) {
          bookmark[key] = xss(req.body[key]);
        }
      });
      
      try {
        const savedBookmark = await BookmarksService.insert(db, bookmark);
        return res
          .status(201)
          .location(`/bookmarks/${savedBookmark.id}`)
          .json(savedBookmark);
      } catch(err) {
        next(err);
      }
    });

bookmarksRouter
  .route('/bookmarks/:bookmarkId')
  .get(
    ensureBookmark,
    async (req, res, next) => {
      const db = req.app.get('db');
      const {bookmarkId} = req.params;
      try {
        const bookmark = await BookmarksService.findById(db, bookmarkId);
        res.json(bookmark); 
      } catch(err) {
        next(err);
      }
    })
  .delete(
    ensureBookmark,
    async (req, res, next) => {
      const db = req.app.get('db');
      const {bookmarkId} = req.params;
      
      try {
        await BookmarksService.delete(db, bookmarkId);
        res.json({});
      } catch(err) {
        next(err);
      }
    })
  .patch(
    bodyParser,
    ensureBookmark,
    validateUrl,
    validateRating,
    async (req, res, next) => {
      const db = req.app.get('db');
      const {bookmarkId} = req.params;
      const {title} = req.body;
      const fields = {};

      if (title && !title.length) {
        return next({message: 'title must be at least 1 character long', status: 400});
      }

      const allowed = ['title', 'url', 'desc', 'rating'];
      Object.keys(req.body).forEach(key => {
        if (allowed.includes(key)) {
          fields[key] = xss(req.body[key]);
        }
      });

      try {
        await BookmarksService.update(db, bookmarkId, fields);
        return res.json({});
      } catch(err) {
        next(err);
      }
      
    });

module.exports = bookmarksRouter;
