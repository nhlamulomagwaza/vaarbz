//IMPORTING CONTROLLER FUNCTIONS AND EXPRESS ROUTER

const express= require('express');
const router= express.Router();
const {registerUser, loginUser, updateUser, logoutUser}= require('../controllers/userController');
const authenticateUsers= require('../auth/authenticateUsers');



//ROUTER FUNCTIONS
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout/:userId', authenticateUsers, logoutUser);
router.put('/updateprofile/:userId', authenticateUsers, updateUser);



//EXPORTING THE ROUTER FUNCTIONS
module.exports= router;
