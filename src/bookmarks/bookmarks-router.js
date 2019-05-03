'use strict';
const express = require('express');
const uuid = require('uuid/v4');
const bookmarksRouter = express.Router();
const bodyParser = express.json();

const store = [];

const ensureFields = (fields) => (req, res, next) => {
  return fields.forEach(field => {
    if (!req.body[field]) {
      return next({message: `${field} is required`, status: 400});
    } 
    return next();
  });
};

const validateUrl = (req, res, next) => {
  const regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
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

const ensureBookmark = (req, res, next) => {
  const {id} = req.params;
  const bookmark = store.find(bookmark => bookmark.id === id);

  if (!bookmark) {
    return next({message: `unable to find bookmark with id ${id}`, status: 400});
  }
  return next();
};

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => res.json(store))
  .post(
    bodyParser,
    ensureFields(['title', 'url']),
    validateUrl,
    validateRating,
    (req, res) => {
      const bookmark = {};
      const allowed = ['title', 'url', 'desc', 'rating'];
      Object.keys(req.body).forEach(key => {
        if (allowed.includes(key)) {
          bookmark[key] = req.body[key];
        }
      });
      
      bookmark.id = uuid();

      store.push(bookmark);
      res
        .status(201)
        .location(`/bookmarks/${bookmark.id}`)
        .json(bookmark);
    });

bookmarksRouter
  .route('/bookmarks/:id')
  .get(
    bodyParser,
    ensureBookmark,
    (req, res) => {
      const {id} = req.params;
      const bookmark = store.find(bookmark => bookmark.id === id);

      res.status(200).json(bookmark);
    })
  .delete(
    ensureBookmark,
    (req, res) => {
      const {id} = req.params;
      const bookmarkIdx = store.findIndex(bookmark => bookmark.id === id);

      store.splice(bookmarkIdx, 1);
      res.status(200).json({});
    })
  .patch(
    bodyParser,
    ensureBookmark,
    validateUrl,
    validateRating,
    (req, res, next) => {
      const {id} = req.params;
      const {title, url, desc, rating} = req.body;
      const bookmark = store.find(bookmark => bookmark.id === id);

      if (title && !title.length) {
        return next({message: 'title must be at least 1 character long', status: 400});
      }

      bookmark.title = title || bookmark.title;
      bookmark.url = url || bookmark.url;
      bookmark.desc = desc || bookmark.desc;
      bookmark.rating = rating || bookmark.rating;

      res.status(200).json({});
    });

module.exports = bookmarksRouter;
