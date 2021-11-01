const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    /*
        this will create an index for the email ,
        which will speeds up the querying process, if you request email
        */
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  image: {
    type: String,
    required: true,
  },
  places: [{
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Place",
  }],
});

/* we are using third party packeage here bcoz unique only
create internal index in database..but not validate it
so 'mongoose-unique-validator' will validate it
*/
//userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
