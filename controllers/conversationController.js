//IMPORT CONVERSATION CONTROLLER VARIABLES

const Conversation= require("../models/conversationModel.js");
const Message= require("../models/messageModel.js");
const Users= require('../models/userModel.js');




//CONTROLLER FUNCTIONS



// The following function allows a user to send a message
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const {receiverId } = req.params;
        const senderId = req.user._id.toString();

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // Fetch the sender and receiver documents from the Users collection
        const sender = await Users.findById(senderId);
        const receiver = await Users.findById(receiverId);
        console.log(senderId)
        console.log(receiver)
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

        // await conversation.save();
        // await newMessage.save();

        // this will run in parallel
        await Promise.all([conversation.save(), newMessage.save()]);

        // SOCKET IO FUNCTIONALITY WILL GO HERE
        

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
