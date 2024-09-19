//THIS MIDDLEWARE IS FOR PROTECTING USER ROUTES

const jwt = require('jsonwebtoken');
const Users = require('../models/userModel'); 
const Tokens = require('../models/tokenModel'); 

//This function is a middleware for protecting user routes

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    const user = await Users.findById(decoded.userId);
    

    
   
    if (!user) {
  
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userToken = await Tokens.findOne({ token: token.split(' ')[1] });
   
    if (!userToken || userToken.token !== token.split(' ')[1]) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};


//Exporting the authentication middleware
module.exports = authMiddleware;