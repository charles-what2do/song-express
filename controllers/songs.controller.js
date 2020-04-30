const express = require("express");
const Joi = require("@hapi/joi");
const Song = require("../models/song.model");

const songSchema = Joi.object({
  name: Joi.string().min(3).required(),
  artist: Joi.string().min(3).required(),
});

const createOne = async (req, res, next) => {
  const result = songSchema.validate(req.body);

  if (result.error) {
    const error = new Error(result.error.details[0].message);
    error.statusCode = 400;
    next(error);
  } else {
    try {
      const lastestSong = await Song.find().sort({ id: -1 }).limit(1);
      const newId = lastestSong[0].id + 1;
      const newSong = new Song({
        id: newId,
        name: req.body.name,
        artist: req.body.artist,
      });
      await newSong.save();
      res.status(201).json(newSong);
    } catch (err) {
      next(err);
    }
  }
};

const findOne = async (req, res, next) => {
  try {
    const foundSong = await Song.findOne({ id: req.params.id }, "-_id -__v");
    if (!!foundSong) {
      res.status(200).send(foundSong);
    } else {
      const error = new Error("Song not found");
      error.statusCode = 404;
      next(error);
    }
  } catch (err) {
    next(err);
  }
};

const findAll = async (req, res, next) => {
  try {
    const foundSongs = await Song.find(null, "-_id -__v");
    res.status(200).send(foundSongs);
  } catch (err) {
    next(err);
  }
};

const findOneAndUpdate = async (req, res, next) => {
  try {
    const foundSong = await Song.findOneAndUpdate(
      { id: req.params.id },
      { name: req.body.name, artist: req.body.artist },
      { projection: "-_id -__v", new: true }
    );
    if (!!foundSong) {
      res.status(200).send(foundSong);
    } else {
      const error = new Error("Song not found");
      error.statusCode = 404;
      next(error);
    }
  } catch (err) {
    next(err);
  }
};

const findOneAndDelete = async (req, res, next) => {
  try {
    const foundSong = await Song.findOneAndDelete(
      { id: req.params.id },
      { projection: "-_id -__v" }
    );
    if (!!foundSong) {
      res.status(200).send(foundSong);
    } else {
      const error = new Error("Song not found");
      error.statusCode = 404;
      next(error);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOne,
  findOne,
  findAll,
  findOneAndUpdate,
  findOneAndDelete,
};
