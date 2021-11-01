const axios = require("axios");
const HttpError = require("../models/http-error");

function getCoordsForAddress(address) {
  return {
    lat: 40.7484474,
    lng: -73.9871516,
  };
}

const API_KEY = "CREDIT CARD NI HAI ABHI";

/*async function getCoordsFromGoogle(address) {
  // (encodeURIComponent) removes the special character and white spaces
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = response.data;
  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError("Could Not find location", 422);
    throw error;
  }
  const coordinates = data.results[0].geometry.location;
  return coordinates;
}*/

//module.exports = getCoordsFromGoogle;

module.exports = getCoordsForAddress;
