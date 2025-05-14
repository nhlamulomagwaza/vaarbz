//IMPORT USER CONTROLLER VARIABLES

const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Token= require('../models/tokenModel');
const RefreshToken= require('../models/refreshTokenModel');
const fs = require('fs');
const mongoose=require('mongoose');
const cloudinary = require('cloudinary').v2;



//Cloudinary configuration
 cloudinary.config({
  cloud_name: 'dofj0x1ml',
  api_key: '299521161191728',
  api_secret: process.env.CLOUDINARY_SECRET,
}); 



//CONTROLLER FUNCTIONS


//The following function is for generating an access token
const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id, username: user.username}, process.env.JWT_SECRET );
  };


  //The following function is for generating a refresh token

  const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id, username: user.username}, process.env.JWT_SECRET);
  };



//The following function is for registering a user to the vaarbz database

const registerUser   = async (req, res) => {
  let accessToken; // initializing access token variable
  let refreshToken; // declare refreshToken here
  try {
      const { username, age, gender, city, password } = req.body.trim();
      const profilePicture = req.file; // This may be undefined if no file is uploaded

      console.log('req.file:', req.file); // Debugging statement

      if (!username || !age || !gender || !city || !password) {
          return res.status(400).json({ message: "All fields are required" }); 
      }

      const userExists = await Users.findOne({ username });
      if (userExists) {
          return res.status(400).json({ message: "A user with that username already exists" });
      }

      // Encrypt password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Assign a random profile picture based on gender if no file is provided
      let profileUrl;
      if (profilePicture) {
          // Upload the profile picture to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(profilePicture.path, {
              folder: 'vaarbs/profilepics',
              public_id: `vaarbs/profilepics/${username}`,
          });
          profileUrl = uploadResult.secure_url;
      } else {
          // Assign default profile picture based on gender
          if (gender === 'male') {
              profileUrl = `https://avatar.iran.liara.run/public/boy`;
          } else if (gender === 'female') {
              profileUrl = `https://avatar.iran.liara.run/public/girl`;
          } else {
              return res.status(400).json({ msg: 'Invalid gender. Gender can only be male or female.' });
          }
      }

      // Create a new user in the database
      const newUser   = await Users.create({
          username,
          age,
          gender,
          city,
          profilePicture: profileUrl, // Use the uploaded or default profile picture URL
          password: hashedPassword,
      });

      // Generate access and refresh tokens for the new user
      if (newUser  ) {
          accessToken = generateAccessToken(newUser );
          refreshToken = generateRefreshToken(newUser ); // Generate refreshToken

          await Token.create({ token: accessToken, userId: newUser ._id });
          await RefreshToken.create({ refreshToken: refreshToken, userId: newUser ._id });
      } else {
          return res.status(500).json({ message: "Failed to create access token" });
      }

      // Return the user object as a JSON response
      res.status(201).json({
          message: "User  registered successfully",
          newUser ,
          accessToken,
          refreshToken // Now this will be defined
      });

      // Clean up the uploaded file if it exists
           // Clean up the uploaded file if it exists
      /* if (profilePicture && fs.existsSync(profilePicture.path)) {
          try {
              fs.unlinkSync(profilePicture.path); // Delete the file only if it exists
          } catch (err) {
              console.error('Error deleting file:', err); // Log any errors during deletion
          }
      } */ // Close the if block

  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
  } // Close the try-catch block
}; // Close the registerUser function
//The following function is for signing in a user to the vaarbz application


const loginUser= async(req, res)=>{

  try{

const {username, password}= req.body;
 console.log(req.body)

  if(!username || !password){

    return res.status(400).json({ message: "All fields are required" }); 
  }


  const user = await Users.findOne({ username });

  if(user && user._id){

    const isPasswordValid = await bcrypt.compare(password.trim(), user.password);


    if(isPasswordValid){
        

      //If the password is valid we will generate the tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);


       // But we need to check if the user already has a token in the database
       const existingToken = await Token.findOne({ userId: user._id });
       if (existingToken) {
         // Update the existing token
         existingToken.token = accessToken;
         await existingToken.save();
       } else {
         // Create a new token
         await Token.create({ token: accessToken, userId: user._id });
       }
       

       //We repeat the same process, we check for an existing refresh token


       const existingRefreshToken = await RefreshToken.findOne({ userId: user._id });
       if (existingRefreshToken) {
         // Update the existing refresh token
         existingRefreshToken.refreshToken = refreshToken;
         await existingRefreshToken.save();
       } else {
         // Create a new refresh token
         await RefreshToken.create({ refreshToken: refreshToken, userId: user._id });
       }

       //If all the validations pass, the user object will be returned
       return res.json({

         message:'logged in successfully',
         user,
         accessToken,
         refreshToken
       }) 


    } else{

      return res.status(401).json({ message: "Username or password is incorrect" });

    }
  }else {
    return res.status(401).json({ message: "Username or password is incorrect" });
  }

  }catch(err){
            res.status(500).json({message:err.message})
  }

};

//The following function is for updating a user account



const updateUser = async (req, res) => {
  try {
      const {username, status, city, age}= req.body;
      const profilePicture= req.file;
      const userId= req.params.userId;

      if(!username && !status && !city && !age && !profilePicture){
          return res.status(400).json({ message: "Please provide at least one field to update" });
      }

      console.log(req);

      const user = await Users.findOne({_id: userId});

      if(!user){
          return res.status(404).json({ message: "User not found" });
      }

      // Checking if the user is updating their own account
      if (req.user.id !== userId) {
          return res.status(403).json({ message: 'Unauthorized' });
      }

      let profileUrl = user.profilePicture; // Initialize with the existing profile picture

      // If a new profile picture is provided, upload it to Cloudinary
      if (profilePicture) {
          const uploadResult = await cloudinary.uploader.upload(profilePicture.path, {
              folder: 'vaarbs/profilepics',
              public_id: `vaarbs/profilepics/${username}`,
          });
          profileUrl = uploadResult.secure_url;

          // Delete the temporary file saved on your server
          fs.unlinkSync(profilePicture.path);
      }

      // Updating the user's information
      user.username = username || user.username;
      user.status = status || user.status;
      user.city = city || user.city;
      user.age = age || user.age;
      user.profilePicture = profileUrl;

      await user.save();

      res.json({
          message: 'User updated successfully',
          user
      });
  } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
  }
}


//The following function is for logging out a user from the vaarbz application
//It is used to invalidate the user's session and remove the user's token from the database

const logoutUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Checking if the user is logged in
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Checking if the user is logging out their own account
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Removing the user's token from the database
    await Token.findOneAndDelete({ userId });

    res.json({
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};


// The following function is for deleting a user from the vaarbz application
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Checking if the user is logged in
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Checking if the user is deleting their own account
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Removing the user's information from the database
    await Users.findByIdAndDelete(userId);

    res.json({
      message: 'User deleted successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};


// The following function is for getting all users from the vaarbz application
const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({});

    res.json({
      message: 'All users retrieved successfully',
      users,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

// The following function is for getting one user by their ID from the vaarbz application
const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};



//EXPORTING ALL THE CONTROLLER FUNCTIONS
module.exports= {registerUser, loginUser, updateUser,
   logoutUser, deleteUser, getAllUsers,
   getUserById}; 
