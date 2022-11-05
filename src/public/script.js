const socket = io("/");
const players = document.getElementById("players");
const activityChat = document.getElementById("activityChat");
const table = document.getElementById("table");

socket.emit("room-join", TABLE_ID, "Jag")
