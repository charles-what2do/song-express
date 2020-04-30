const express = require("express");
const Joi = require("@hapi/joi");
const Movie = require("../models/movie.model");

const movieSchema = Joi.object({
  name: Joi.string().min(3).required(),
});

const createOne = async (req, res, next) => {
  const result = movieSchema.validate(req.body);

  if (result.error) {
    const error = new Error(result.error.details[0].message);
    error.statusCode = 400;
    next(error);
  } else {
    try {
      const lastestMovie = await Movie.find().sort({ id: -1 }).limit(1);
      const newId = lastestMovie[0].id + 1;
      const newMovie = new Movie({
        id: newId,
        name: req.body.name,
      });
      await newMovie.save();
      res.status(201).json(newMovie);
    } catch (err) {
      next(err);
    }
  }
};

const findOne = async (req, res, next) => {
  try {
    const foundMovie = await Movie.findOne({ id: req.params.id }, "-_id -__v");
    if (!!foundMovie) {
      res.status(200).send(foundMovie);
    } else {
      const error = new Error("Movie not found");
      error.statusCode = 404;
      next(error);
    }
  } catch (err) {
    next(err);
  }
};

const findAll = async (req, res, next) => {
  try {
    const foundMovies = await Movie.find(null, "-_id -__v");
    return foundMovies;
  } catch (err) {
    next(err);
  }
};

const findOneAndUpdate = async (req, res, next) => {
  try {
    const foundMovie = await Movie.findOneAndUpdate(
      { id: req.params.id },
      { name: req.body.name },
      { projection: "-_id -__v", new: true }
    );
    if (!!foundMovie) {
      res.status(200).send(foundMovie);
    } else {
      const error = new Error("Movie not found");
      error.statusCode = 404;
      next(error);
    }
  } catch (err) {
    next(err);
  }
};

const findOneAndDelete = async (req, res, next) => {
  try {
    const foundMovie = await Movie.findOneAndDelete(
      { id: req.params.id },
      { projection: "-_id -__v" }
    );
    if (!!foundMovie) {
      res.status(200).send(foundMovie);
    } else {
      const error = new Error("Movie not found");
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
