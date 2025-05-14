//IMPORTING CONTROLLER FUNCTIONS AND EXPRESS ROUTER

const express= require('express');
const router= express.Router();
const {registerUser, loginUser,
     updateUser, logoutUser, deleteUser,
    getAllUsers, getUserById}
     = require('../controllers/userController');
const authenticateUsers= require('../auth/authenticateUsers');
const multer = require('multer');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Set up multer filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
  }
};

// Set up multer middleware
const upload = multer({
  dest: 'uploads/',
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: fileFilter,
});

//Routes
//ROUTER FUNCTIONS
//Gets
router.get("/", authenticateUsers, getAllUsers);
router.get('/:userId', authenticateUsers, getUserById);

//Posts
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.post('/logout/:userId', authenticateUsers, logoutUser);

//Updates
router.put('/updateprofile/:userId', authenticateUsers, upload.single('profilePicture'), updateUser);

//Deletes
router.delete('/deleteprofile/:userId', authenticateUsers, deleteUser)

//EXPORTING THE ROUTER FUNCTIONS
module.exports= router;
