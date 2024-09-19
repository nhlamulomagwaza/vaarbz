//IMPORT USER CONTROLLER VARIABLES

const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Token= require('../models/tokenModel');
const RefreshToken= require('../models/refreshTokenModel');

//CONTROLLER FUNCTIONS


//The following function is for generating an access token
const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id, username: user.username}, process.env.JWT_SECRET, {expiresIn: '2d'});
  };


  //The following function is for generating a refresh token

  const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id, username: user.username}, process.env.JWT_SECRET , {expiresIn: '7d'});
  };



//The following function is for registering a user to the vaarbz database

const registerUser = async (req, res) => {

   let accessToken; // initializing access token variable
    try{

   
  const { username, age, gender, city, password } = req.body;
  if (!username || !age || !gender || !city || !password) {
    return res.status(400).json({ message: "All fields are required" }); 
  }

  const userExists= await Users.findOne({ username });
  if (userExists) {
    return res.status(400).json({ message: "A user with that username already exists" });
  }

  //Encrypt password

  const hashedPassword = await bcrypt.hash(password, 10);

  //The if checks below are for assigning a random profile picture to the user based on their gender
  if (gender === 'male') {
    profileUrl = `https://avatar.iran.liara.run/public/boy`;
  } else if (gender === 'female') {
    profileUrl = `https://avatar.iran.liara.run/public/girl`;
  } else {
    return res.status(400).json({ msg: 'Invalid gender. Gender can only be male or female.' });
  }


  //After all the checks, we create a new user in the database
  const newUser = await Users.create({
    username,
    age,
    gender,
    city,
    profilePicture: profileUrl,
    password: hashedPassword,
  });

  //If the user is created successfully, we generate an access and refresh token for that particular user
  if(newUser){

     accessToken = generateAccessToken(newUser);
    await Token.create({ token: accessToken, userId: newUser._id });

    refreshToken= generateRefreshToken(newUser);
    await RefreshToken.create({refreshToken: refreshToken, userId:newUser._id});
  
  } else{

    return res.status(500).json({ message: "Failed to create access token" });
  }


  //Return the user object as a json response
  res.status(201).json({
    message: "User registered successfully",
    newUser,
    accessToken,
    refreshToken
  }) } catch(err){
    console.log(err)
    return res.status(500).json({ message: err.message });
  }
};



//The following function is for signing in a user to the vaarbz application


const loginUser= async(req, res)=>{

  try{

const {username, password}= req.body;


  if(!username || !password){

    return res.status(400).json({ message: "All fields are required" }); 
  }


  const user = await Users.findOne({ username });

  if(user && user._id){

    const isPasswordValid = await bcrypt.compare(password, user.password);


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



const updateUser= async(req, res)=>{


  try{
      const {username, status, city, age}= req.body;
      const userId= req.params.userId;


  if(!username && !status && !city && !age){


    return res.status(400).json({ message: "Please provide at least one field to update" });
  }

  const user= await Users.findOne({_id:userId});
   
  if(!user){

    return res.status(404).json({ message: "User not found" });
  }


  //Checking if the user is updating their own account
  if (req.user.id !== userId) {
   
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
   //Updating the user's information
   user.username= username || user.username;
   user.status= status || user.status;
   user.city= city || user.city;
   user.age= age || user.age;

   await user.save();


   res.json({

    message: 'User updated successfully',
    user
   })

  }catch(err){
    console.log(err)
    return res.status(500).json({ message: err.message });


  }

}


//EXPORTING ALL THE CONTROLLER FUNCTIONS
module.exports= {registerUser, loginUser, updateUser}; 
