//DECLARE MODEL VARIABLES

const mongoose = require("mongoose");


//SETTING UP SCHEMA
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      required: true,

      enum: ["male", "female"],
    },
    city: {
      type: String,
      required: true,
    },

    profilePicture: {
      type: String,
      required: false,
      default: `https://avatar.iran.liara.run/public/`,
    },

    status:{

      type: String,
      required: false,
      default: "No Calls, Vaarbz Only✌️",
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },

    password: { type: "String", required: true },
  },
  { timestamps: true }
);

//EXPORT SCHEMA
module.exports = mongoose.model("Users", userSchema);
