const  {Server} = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["*"],
		methods: ["GET", "POST"],
	},
});


const userSocketMap = {}; // {userId: socketId}

const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};
io.on("connection", (socket) => {
	const userId = socket.handshake.query.userId;
	console.log(`User connected - Socket: ${socket.id}, User: ${userId || 'unknown'}`);
	// Handle "typing" event
	socket.on("typing", ({ senderId, receiverId }) => {
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
		  io.to(receiverSocketId).emit("typing", { senderId });
		  console.log(`User ${senderId} is typing to ${receiverId}`);
		  
		}
	  });
	
	  // Handle "stop_typing" event
	  socket.on("stop_typing", ({ senderId, receiverId }) => {
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
		  io.to(receiverSocketId).emit("stop_typing", { senderId });
		}
	  });
	
	if (userId && userId != "undefined") {
		userSocketMap[userId] = socket.id;
		console.log(`User ${userId} mapped to socket ${socket.id}`);
	} else {
		console.warn('Connection attempt without valid userId');
	}

	// io.emit() is used to send events to all the connected clients
	io.emit("getOnlineUsers", Object.keys(userSocketMap).map(userId => ({ userId })));

	// socket.on() is used to listen to the events. can be used both on client and server side
	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		delete userSocketMap[userId];
		io.emit("getOnlineUsers", Object.keys(userSocketMap).map(userId => ({ userId })));
	});
});

module.exports= { app, io, server , getReceiverSocketId, express};