const mongoose = require("./db");
const {
  AuthSchema,
  UserSchema,
  RoomsInfoSchema,
  RoomMessagesSchema,
  ActiveUsersSchema,
} = require("./schemas");

const AuthDB = mongoose.model("Real Time Chat App Authentication", AuthSchema);
const UserDB = mongoose.model("Real Time Chat App User Data", UserSchema);
const RoomsInfoDB = mongoose.model("Real Time Chat App Rooms Information", RoomsInfoSchema);
const RoomMessagesDB = mongoose.model("Real Time Chat App Rooms Messages", RoomMessagesSchema);
const onlineUsersDB = mongoose.model("Real Time Chat App Active Users", ActiveUsersSchema);

module.exports = { AuthDB, UserDB, RoomsInfoDB, RoomMessagesDB, onlineUsersDB};