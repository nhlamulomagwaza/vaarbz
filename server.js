//DECLARE SERVER VARIABLES

//Backbone variables
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3050;
const mongoose = require('mongoose');
const authenticateUsers= require('./auth/authenticateUsers');
const cors= require('cors');
const corsOptions= require('./config/corsOptions');

//Importing  Routes

const userRoutes = require('./routes/userRoutes');
const messageRoutes= require('./routes/messageRoutes');

//MIDDLEWARES
//Backbone middlewares
app.use(express.json());
app.use(cors(corsOptions));



//Routes middlewares
app.use('/api/users',userRoutes);
app.use('/api/chats', authenticateUsers, messageRoutes);




//SOCKET IO


const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    console.log(data)
    //socket.to(data.room).emit("receive_message", data);
    socket.broadcast.emit("receive_message", data);
  });
});



/* CONNECT TO MONGO DB */

mongoose.connect(process.env.MONGO_URI);
const db= mongoose.connection;
db.once('open', ()=>{
console.log('connected to mongodb')
 })
 db.on('error', ()=>{
    console.log('failed to connect to database')
})

//SERVER LISTENER

server.listen(PORT, () => {
  console.log("server started on port ", PORT);
});
