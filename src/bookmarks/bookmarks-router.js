'use strict';
const express = require('express');
const uuid = require('uuid/v4');
const bookmarksRouter = express.Router();
const logger = require('../logger');
const bodyParser = express.json();

const store = [];

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(store);
  })
  .post(bodyParser, (req, res) => {
    const {title, url, desc, rating} = req.body;
    const error = {};

    if (!title) {
      error.message = 'title is required';
      return res.status(400).json({error});
    }

    if (!url) {
      error.message = 'url is required';
      return res.status(400).json({error});
    }

    if (!title.length) {
      error.message = 'title must be at least 1 character long';
      return res.status(400).json({error});
    }

    const regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    if (!regex.test(url)) {
      error.message = 'invalid url format';
      return res.status(400).json({error});
    }

    if (rating && (rating < 1 || rating > 5)) {
      error.message = 'rating must be between 1-5';
      return res.status(400).json({error});
    }

    const id = uuid();
    const bookmark = {
      id,
      title,
      url,
      desc,
      rating
    };

    store.push(bookmark);
    logger.info(`bookmark created: id=${id}`);
    res
      .status(201)
      .location(`/bookmarks/${id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .get(bodyParser, (req, res) => {
    const {id} = req.params;
    const bookmark = store.find(bookmark => bookmark.id === id);
    const error = {};

    if (!bookmark) {
      error.message = `unable to find bookmark with id ${id}`;
      logger.error(error.message);
      res.status(404).json({error});
    }

    res.status(200).json(bookmark);
  })
  .delete((req, res) => {
    const {id} = req.params;
    const bookmarkIdx = store.findIndex(bookmark => bookmark.id === id);
    const error = {};

    if (bookmarkIdx === -1) {
      error.message = `unable to find bookmark with ${id}`;
      return res.status(400).json({error});
    }

    store.splice(bookmarkIdx, 1);
    res.status(200).json({});
  })
  .patch(bodyParser, (req, res) => {
    const {id} = req.params;
    const {title, url, desc, rating} = req.body;
    const bookmark = store.find(bookmark => bookmark.id === id);
    const error = {};

    if (!bookmark) {
      error.message = `unable to find bookmark with ${id}`;
      return res.status(400).json({error});
    }

    if (title && !title.length) {
      error.message = 'title must be at least 1 character long';
      return res.status(400).json({error});
    }

    const regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    if (url && !regex.test(url)) {
      error.message = 'invalid url format';
      return res.status(400).json({error});
    }

    if (rating && (rating < 1 || rating > 5)) {
      error.message = 'rating must be between 1-5';
      return res.status(400).json({error});
    }

    bookmark.title = title || bookmark.title;
    bookmark.url = url || bookmark.url;
    bookmark.desc = desc || bookmark.desc;
    bookmark.rating = rating || bookmark.rating;

    res.status(200).json({});
  });

module.exports = bookmarksRouter;
