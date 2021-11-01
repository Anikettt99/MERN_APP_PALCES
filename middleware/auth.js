const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if(req.method === 'OPTIONS')
  {
      return next();   // for browser behaviour
  }
  
    /*
    its js object with key value pairs and is case insensitive
    Authorization: 'Bearer TOKEN'
    */
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
       
      const error = new HttpError("Authentication failed!", 401);
      return next(error);
    }
    const decodedToken = jwt.verify(token , process.env.JWT_KEY);
    req.userData = {userId: decodedToken.userId};
    next();
  } catch (err) {
   // console.log(err);
    const error = new HttpError("Authentication failed!", 401);
    return next(error);
  }
};
