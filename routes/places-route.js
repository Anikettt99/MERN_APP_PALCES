const express = require("express");
const { check } = require("express-validator");

const placesController = require("../controllers/places-controller");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/auth");
const router = express.Router();

/* router.get("/", (req, res, next) => {
  console.log("request aa rhi hai");

  /*  .json method of express set content type 
  to applicatio/json in headers
  res.json({ message: "AA RHA HAI REQUEST" });   
}); */

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByuserId);

router.use(checkAuth);  

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesController.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesController.updatePlace
);

router.delete("/:pid", placesController.deletePlace);

module.exports = router;
