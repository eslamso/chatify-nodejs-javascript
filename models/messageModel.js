const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: [true, "a message must have a sender"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: [true, "a message must have a receiver"],
    },
    // chatChannel: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Chat",
    //   required: [true, "a message must belong to a chat channel"],
    // },
    content: { type: String },
    isSeen: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    isSent: Boolean,
    sentAt: { type: Date },
  },
  { timestamps: true }
);

// messageSchema.pre("save", function (next) {
//   this.sentAt = Date.now();
//   next();
// });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
