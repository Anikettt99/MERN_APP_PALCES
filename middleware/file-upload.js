const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  
  limits: 5000000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
     // console.log("disk");
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
    /*  console.log("filename");
      console.log(Date.now().toString());
      console.log(file.fieldname);*/
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, Date.now().toString() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
   // console.log("filter");
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; // "!! is use convert undefine to false"
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
