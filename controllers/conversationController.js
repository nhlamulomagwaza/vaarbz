//IMPORT CONVERSATION CONTROLLER VARIABLES

const Conversation= require("../models/conversationModel.js");
const Message= require("../models/messageModel.js");
const Users= require('../models/userModel.js');

// This import remains the same!
const { getReceiverSocketId, io } = require('../socket/socket.js');


//CONTROLLER FUNCTIONS


// The following function allows a user to send a message
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { receiverId } = req.params;
        const senderId = req.user._id.toString();

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const sender = await Users.findById(senderId);
        const receiver = await Users.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ msg: 'Sender or receiver not found' });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            senderName: sender.username,
            receiverName: receiver.username,
            message,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        // getReceiverSocketId now returns an ARRAY of socket IDs
        const receiverSocketIds = getReceiverSocketId(receiverId);
        const senderSocketIds = getReceiverSocketId(senderId); // Get the sender's socket IDs

        console.log(`Message delivery attempt - Receiver: ${receiverId}, Sockets: ${receiverSocketIds.length > 0 ? receiverSocketIds.join(', ') : 'offline'}`);
        console.log(`Message delivery attempt - Sender: ${senderId}, Sockets: ${senderSocketIds.length > 0 ? senderSocketIds.join(', ') : 'offline'}`);


        if (io) {
            // Emit to all connected instances of the receiver
            if (receiverSocketIds.length > 0) {
                receiverSocketIds.forEach(socketId => {
                    io.to(socketId).emit("receive_message", newMessage);
                });
                console.log(`Message delivered to ${receiverId} via ${receiverSocketIds.length} socket(s).`);
            } else {
                console.log(`Receiver ${receiverId} is currently offline. Message saved to database.`);
            }

            // Emit to all connected instances of the sender (for immediate update on sender's multiple devices)
            if (senderSocketIds.length > 0) {
                 senderSocketIds.forEach(socketId => {
                    // Only emit if the sender's socket is not the *same* as the receiver's if they are chatting themselves
                    // Or if you want to ensure the message is shown on all sender's devices
                    io.to(socketId).emit("receive_message", newMessage);
                });
                console.log(`Message delivered to ${senderId} via ${senderSocketIds.length} socket(s).`);
            }
        } else {
            console.log("Socket.IO instance not available."); // Should not happen if server is running
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// The following function allows a user to receive a message
const getMessage = async (req, res) => {
    try {
        const { userToChatId } = req.params;
        const senderId = req.user._id.toString();

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

        if (!conversation) return res.status(200).json([]);

        const messages = conversation.messages;

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


//EXPORTING ALL THE CONTROLLER FUNCTIONS
module.exports= {sendMessage, getMessage};