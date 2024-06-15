const mongoose = require("./db");

const AuthSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const UserSchema = new mongoose.Schema({
  UserName: { type: String, required: true },
  roomIds: [String],
});

const RoomsInfoSchema = new mongoose.Schema({
  roomName: { type: String, required: false },
  roomId: { type: String, required: true },
  connections: [
    {
      userName: { type: String, required: true },
      userId: { type: String, required: true },
    },
  ],
});

const RoomMessagesSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  messages: [
    {
      messageId: { type: String, required: true },
      content: { type: String, required: true },
      from: { type: String, required: true },
      time: { type: String, required: true },
    },
  ],
});

const ActiveUsersSchema = new mongoose.Schema({
  onlineUsers: [
    {
      // name: { type: String, required: true },
      userId: { type: String, required: true },
      socketId: { type: String, required: true },
    },
  ],
});

module.exports = {
  AuthSchema,
  UserSchema,
  RoomsInfoSchema,
  RoomMessagesSchema,
  ActiveUsersSchema,
};
