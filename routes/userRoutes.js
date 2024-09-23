//IMPORTING CONTROLLER FUNCTIONS AND EXPRESS ROUTER

const express= require('express');
const router= express.Router();
const {registerUser, loginUser,
     updateUser, logoutUser, deleteUser,
    getAllUsers, getUserById}
     = require('../controllers/userController');
const authenticateUsers= require('../auth/authenticateUsers');



//ROUTER FUNCTIONS
//Gets
router.get("/", authenticateUsers, getAllUsers);
router.get('/:userId', authenticateUsers, getUserById);

//Posts
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout/:userId', authenticateUsers, logoutUser);

//Updates
router.put('/updateprofile/:userId', authenticateUsers, updateUser);

//Deletes
router.delete('/deleteprofile/:userId', authenticateUsers, deleteUser)

//EXPORTING THE ROUTER FUNCTIONS
module.exports= router;
