const { UserDB } = require("../database/models");

async function getAllUsers(retryCount = 3) {
  try {
    const documentsArray = await UserDB.find({}, { UserName: 1 });
    if (!documentsArray) {
      return [];
    }
    const usersArray = documentsArray.map((document) => {
      return { userName: document.UserName, userId: document._id };
    });
    return usersArray;
  } catch (error) {
    if (error.code === "ECONNRESET" && retryCount > 0) {
      console.log(`Retrying... Attempts left: ${retryCount}`);
      return await getAllUsers(retryCount - 1);
    }
    console.log("error while executing getAllUsers function", error);
    return [];
  }
}

// Filter usernames based on search searchQuery
function filterUsers(searchQuery, usersArray) {
  if (searchQuery === "") {
    return [];
  }

  const filtered = usersArray.filter((userData) =>
    userData.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by relevance
  const sorted = filtered.sort((a, b) => {
    // Exact match
    if (a.userName.toLowerCase() === searchQuery.toLowerCase()) return -1;
    if (b.userName.toLowerCase() === searchQuery.toLowerCase()) return 1;

    // Starts with the search searchQuery
    if (a.userName.toLowerCase().startsWith(searchQuery.toLowerCase()))
      return -1;
    if (b.userName.toLowerCase().startsWith(searchQuery.toLowerCase()))
      return 1;

    // Contains the search searchQuery
    if (a.userName.toLowerCase().includes(searchQuery.toLowerCase())) return -1;
    if (b.userName.toLowerCase().includes(searchQuery.toLowerCase())) return 1;

    return 0;
  });

  return sorted;
}

async function SearchFilter(searchQuery, userID, retryCount = 3) {
  try {
    let usersArray = await getAllUsers(retryCount);
    usersArray = usersArray.filter((userData) => {
      return userData.userId != userID;
    });
    return filterUsers(searchQuery, usersArray);
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying SearchFilter... Attempts left: ${retryCount}`);
      return await SearchFilter(searchQuery, userID, retryCount - 1);
    }
    console.log("error while executing SearchFilter function", error);
    return [];
  }
}

module.exports = { SearchFilter };
