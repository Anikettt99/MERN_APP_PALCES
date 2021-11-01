const fs = require("fs");

const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  /* find by id doesnot return promise use .exec() if
     you want real promise but still we can use async and await*/
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Something Went Wrong, please try again", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError("NO PLACES FOUND", 404);
    return next(error);
  }

  /*
  converting mongoose document to javascript
  toObject and adding "id" property
  */

  res.json({ place: place.toObject({ getters: true }) }); // => {place}=>{place:place}
};

const getPlacesByuserId = async (req, res, next) => {
  const uid = req.params.uid;
  let userWithPlaces;

  try {
    //  userWithPlaces = await Place.find({ creator: uid });
    userWithPlaces = await User.findById(uid).populate("places");
    // console.log(userWithPlaces);
  } catch (err) {
    const error = new HttpError("Fetching Place failed, please try again", 500);
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError("NO PLACES FOUND", 404));
  }

  // we are using map here because find return array of document not a single document
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    /* if we are working with async code then throw
       did not work we have to use next
    */
    return next(new HttpError("INVALID INPUT", 422));
  }

  const { title, description, address } = req.body;
  /*  let coordinates;
  try{
     coordinates = await getCoordsFromGoogle(address);
  }catch(error){
    return next(error)
  } */

  const coordinates = getCoordsForAddress(address);
  const createdPlace = new Place({
    title, // title : title
    description,
    address,
    location: coordinates,
    image: req.file.path, // .path will be added by multer;
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("No user Found, please try again", 404);
    return next(error);
  }

  try {
    /*
    here we are doing two asynchronous task which are not dependent to 
    each other...so we want if anyone of the task fails then we will able
    to undo the changes..thats why we are using sessions here
    */
    /*
   and this session method didnot create the database
   automatically so we have to manually create it 
   in our database
   */
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("INVALID INPUT", 422));
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  /*   it will store the all key value pair
    of old object in new object(updatedPlace)
  
  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
   we are able to change constants here because
     updatedPlace contains the address not the 
     object itself
  
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace; */

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something Went Wrong, could not update place",
      500
    );
    return next(error);
  }

  /* console.log(place.creator.toString());
  console.log(place.creator);
  console.log(req.userData.userId);*/
  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this Place", 500);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something Went Wrong, could not update place",
      401
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  /* if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("COULD NOT FIND PLACE", 404);
  }
   if any object return false it will 
  then drop from array 
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);*/
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something Went Wrong, could not delete place",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could Not Found Place", 500);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this Place",
      500
    );
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something Went Wrong, could not delete place",
      500
    );
    return next(error);
  }
  fs.unlink(imagePath, (err) => {
    // console.log(err);
  });
  res.status(200).json({ message: "Deleted successfully" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByuserId = getPlacesByuserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
