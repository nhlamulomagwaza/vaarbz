//DECLARE MODEL VARIABLES
const mongoose= require('mongoose');



//SETTING UP SCHEMA
const conversationSchema = new mongoose.Schema(
	{
		participants: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Students",
			},
		],
		messages: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Message",
				default: [],
			},
		],
	},
	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);


//EXPORT SCHEMA
module.exports= Conversation;