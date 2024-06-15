require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const router = require("./routes/router");
const AuthenticationRoute = require("./authentication/Authentication");
const jwt = require("jsonwebtoken");
const { UserDB, RoomsInfoDB, onlineUsersDB } = require("./database/models");
const { v4: uuidv4 } = require("uuid");

const { SearchFilter } = require("./utility functions/search");
const { createRoom, GetRoomsData } = require("./utility functions/rooms_util");
const {
  addMessageToRoom,
  getMessageFromRoomId,
} = require("./utility functions/messages");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use("/api", AuthenticationRoute);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

////////// Authentication Middleware //////////
io.use((socket, next) => {
  // console.log('socket.io auth middleware ran');
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded.user;
    // console.log("socket.user:",decoded.user);
    next();
  });
});
//////////////////////////////////

const commonRoom = "Common Room";

async function addConnection(socket) {
  try {
    let activeUsersDoc = await onlineUsersDB.findOne().sort({ _id: 1 }).exec();

    if (!activeUsersDoc) {
      activeUsersDoc = new onlineUsersDB({ onlineUsers: [] });
    }

    activeUsersDoc.onlineUsers.push({
      userId: socket.user.id,
      socketId: socket.id,
    });

    const res = await activeUsersDoc.save();
    console.log("User added successfully:");
    return res.onlineUsers;
  } catch (error) {
    console.error("Error adding user:", error);
    return [];
  }
}

async function removeConnection(socket) {
  try {
    let activeUsersDoc = await onlineUsersDB.findOne().sort({ _id: 1 }).exec();

    if (!activeUsersDoc) {
      return [];
    }

    activeUsersDoc.onlineUsers = activeUsersDoc.onlineUsers.filter(
      (connection) => connection.userId !== socket.user.id
    );

    const res = await activeUsersDoc.save();
    console.log("User removed successfully");
    return res.onlineUsers;
  } catch (error) {
    console.error("Error adding user:", error);
    return [];
  }
}

io.on("connection", async (socket) => {
  const UserId = socket.user.id;
  // const onlineConnections = addConnection(socket);
  let UserData = await GetRoomsData(UserId, socket);

  socket.join(commonRoom);

  socket.emit("user's data", UserData);

  // io.to(commonRoom).emit("online users", onlineConnections);

  socket.on("search users", async (searchQuery) => {
    const filteredUsers = await SearchFilter(searchQuery, UserId);
    socket.emit("filtered users", filteredUsers);
  });

  socket.on("create room", async (data) => {
    data.connections.push({ userName: UserData?.userName, userId: UserId });
    await createRoom(data.connections, data.roomName);
    UserData = await GetRoomsData(UserId, socket);
    socket.emit("user's data", UserData);
  });

  socket.on("message form socket", async (message) => {
    message.messageId = uuidv4();
    io.to(message.roomId).emit("message from server", message);
    await addMessageToRoom(message.roomId, message);
  });

  socket.on("get messages array for roomId", async (data) => {
    console.log("get messages array for roomId", data);
    const messagesArray = await getMessageFromRoomId(data);
    socket.emit("messages array for roomId", messagesArray);
  });

  socket.on("disconnect", () => {
    // const onlineConnections = removeConnection(socket);
    socket.leave(commonRoom);
    // io.to(commonRoom).emit("online users", onlineConnections);
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
