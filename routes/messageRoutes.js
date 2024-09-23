//IMPORTING CONTROLLER FUNCTIONS AND EXPRESS ROUTER

const express= require('express');
const router= express.Router();

const {sendMessage, getMessage} = require('../controllers/conversationController');

//ROUTER FUNCTIONS

//Gets
router.get('/getmessage/:userToChatId', getMessage);
//Posts
router.post('/sendmessage/:receiverId', sendMessage);


//EXPORTING THE ROUTER FUNCTIONS
module.exports= router;
