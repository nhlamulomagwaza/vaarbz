//DECLARE MODEL VARIABLES
const mongoose= require('mongoose');


//SETTING UP SCHEMA
const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Students",
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Students",
			required: true,
		},
        senderName: {
            type: String,
            required: true,
        },
        receiverName: {
            type: String,
            required: true,
        },
		message: {
			type: String,
			required: true,
		},
		// createdAt, updatedAt
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
//EXPORT SCHEMA
module.exports=Message;