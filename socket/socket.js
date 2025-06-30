const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://vaarbzapp.onrender.com", "exp://192.168.0.104:8081"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// userSocketMap to store arrays of socket IDs
const userSocketMap = {}; // { userId: [socketId1, socketId2, ...] }

// Keep the name, and it returns an ARRAY of socket IDs
const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId] || []; // Returns an array, or empty array if none
};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`User connected - Socket: ${socket.id}, User: ${userId || 'unknown'}`);

    // On Connection: Add the new socket ID to the user's list
    if (userId && userId !== "undefined") {
        if (!userSocketMap[userId]) {
            userSocketMap[userId] = []; // Initialize array if it doesn't exist
        }
        userSocketMap[userId].push(socket.id); // Add the new socket ID
        console.log(`User ${userId} added socket ${socket.id}. Current sockets: ${userSocketMap[userId].length}`);
    } else {
        console.warn('Connection attempt without valid userId for socket:', socket.id);
    }

    // --- IMPORTANT: Emit online users in the OLD FORMAT ---
    // This maps the user IDs back to the [{ userId: 'id' }] format
    io.emit("getOnlineUsers", Object.keys(userSocketMap).map(userId => ({ userId })));
    // --- End IMPORTANT Change ---

    // --- Typing & Stop Typing events (already fine, sending to all sockets per user) ---
    socket.on("typing", ({ senderId, receiverId }) => {
        const receiverSocketIds = getReceiverSocketId(receiverId);
        if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach(socketId => {
                io.to(socketId).emit("typing", { senderId });
            });
            console.log(`User ${senderId} is typing to ${receiverId} on ${receiverSocketIds.length} devices.`);
        }
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
        const receiverSocketIds = getReceiverSocketId(receiverId);
        if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach(socketId => {
                io.to(socketId).emit("stop_typing", { senderId });
            });
            console.log(`User ${senderId} stopped typing to ${receiverId}.`);
        }
    });
    // --- End Typing Logic ---

    socket.on("disconnect", () => {
        console.log("User disconnected - Socket:", socket.id);
        // On Disconnect: Remove the specific socket ID
        let disconnectedUserId = null;
        for (const uId in userSocketMap) {
            const index = userSocketMap[uId].indexOf(socket.id);
            if (index !== -1) {
                userSocketMap[uId].splice(index, 1); // Remove the specific socket ID
                disconnectedUserId = uId;
                console.log(`Socket ${socket.id} removed for User ${uId}. Remaining sockets: ${userSocketMap[uId].length}`);
                if (userSocketMap[uId].length === 0) {
                    delete userSocketMap[uId]; // If no more sockets for this user, remove the user entry
                    console.log(`User ${uId} is now offline.`);
                }
                break; // Found and removed, exit loop
            }
        }

        // Emit updated online users in the OLD FORMAT
        io.emit("getOnlineUsers", Object.keys(userSocketMap).map(userId => ({ userId })));
    });
});

module.exports= { app, io, server , getReceiverSocketId, express};