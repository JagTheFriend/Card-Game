const socket = io("/");

socket.emit("room-join", TABLE_ID, "Jag")
