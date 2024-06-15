const { RoomMessagesDB } = require("../database/models");
const { v4: uuidv4 } = require("uuid");

function getTime() {
  const date = new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const amOrPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours.toString().padStart(2, "0")}:${minutes} ${amOrPm}`;
}

async function addMessageToRoom(roomId, newMessage, retryCount = 3) {
  try {
    await RoomMessagesDB.updateOne(
      { roomId: roomId },
      { $push: { messages: newMessage } }
    );
    console.log("Message added successfully");
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying... Attempts left: ${retryCount}`);
      addMessageToRoom(roomId, newMessage, retryCount - 1);
      return;
    }
    console.error("Error adding message: ", error);
  }
}

async function getMessageFromRoomId(roomId, retryCount = 3) {
  try {
    const MessagesObj = await RoomMessagesDB.findOne(
      { roomId },
      { messages: 1 }
    );
    return MessagesObj.messages;
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying... Attempts left: ${retryCount}`);
      getMessageFromRoomId(roomId, retryCount - 1);
      return [];
    }
    console.error("Error adding message: ", error);
  }
}

module.exports = { addMessageToRoom, getMessageFromRoomId };
