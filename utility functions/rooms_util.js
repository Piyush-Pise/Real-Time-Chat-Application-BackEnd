const { promise } = require("bcrypt/promises");
const { UserDB, RoomsInfoDB, RoomMessagesDB } = require("../database/models");
const { v4: uuidv4 } = require("uuid");

async function getRoomData(roomId, UserId) {
  try {
    const roomData = await RoomsInfoDB.findOne({ roomId });

    if (!roomData) {
      return;
    }

    roomData.connections = roomData.connections.filter(
      (connection) => connection.userId != UserId
    );

    roomData.connections = roomData.connections.map(
      (connection) => connection.userName
    );

    const roomName =
      roomData.connections.length === 1
        ? roomData.connections[0].userName
        : roomData.roomName;

    return {
      roomId,
      roomName: roomName,
      connections: roomData.connections,
    };
  } catch (error) {
    console.log(error);
  }
}

async function GetRoomsData(UserId, socket) {
  try {
    const userData = await UserDB.findById(UserId);
    const userName = userData.UserName;
    const roomIds = userData.roomIds;

    const roomDataPromises = roomIds.map((roomId) =>
      getRoomData(roomId, UserId)
    );
    const roomsData = await Promise.all(roomDataPromises);

    roomsData?.forEach((roomData) => {
      if (roomData && roomData.roomId) {
        socket.join(roomData.roomId);
      }
    });

    return { userName, roomsData };
  } catch (error) {
    console.log(error);
    return;
  }
}

async function createRoom(connections, roomName) {
  try {
    const roomId = uuidv4();
    connections.forEach(async (connection) => {
      try {
        const userData = await UserDB.findById(connection.userId);
        userData.roomIds.push(roomId);
        await userData.save();
      } catch (error) {
        console.log("error while executing .map inside create room", error);
      }
    });

    const newRoom = new RoomsInfoDB({
      roomId,
      roomName,
      connections,
    });

    await newRoom.save();

    const newRoomMessageDoc = new RoomMessagesDB({
      roomId,
      messages: [],
    });
    await newRoomMessageDoc.save();
  } catch (error) {
    console.log("error occurred while executing create room function", error);
  }
}

module.exports = { createRoom, GetRoomsData };
