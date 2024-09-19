//DECLARE SERVER VARIABLES

//Backbone variables
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');

//Importing  Routes

const userRoutes = require('./routes/userRoutes');



//MIDDLEWARES

//Backbone middlewares
app.use(express.json());

//Routes middlewares
app.use('/api/users',userRoutes);


/* CONNECT TO MONGO DB */

mongoose.connect(process.env.MONGO_URI);
const db= mongoose.connection;
db.once('open', ()=>{
console.log('connected to mongodb')
 })
 db.on('error', ()=>{
    console.log('failed to connect to databasE')
})

//SERVER LISTENER

app.listen(PORT, () => {
  console.log("server started on port ", PORT);
});
