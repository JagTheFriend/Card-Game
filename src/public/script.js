const socket = io('/');
const players = document.getElementById('players');
const activityChat = document.getElementById('activityChat');
const table = document.getElementById('table');
const pot = document.getElementById('pot');

// All the buttons
const raiseBtn = document.getElementById('raiseBtn');
const matchBtn = document.getElementById('matchBtn');
const foldBtn = document.getElementById('foldBtn');

const playerName = `${Math.random() * 100}`;

function addElementIntoList(listReference, data) {
  const node = document.createElement('li');
  node.className = 'list-group-item';
  const data_ = document.createTextNode(data);
  node.appendChild(data_);
  listReference.appendChild(node);
  listReference.appendChild(document.createElement('br'));
}

// Adds received data to activityChat
socket.on('new-activity', data => {
  addElementIntoList(activityChat, data);
});

socket.emit('room-join', TABLE_ID, playerName);
addElementIntoList(players, playerName);

// Displays all the connected username
socket.on('all-players', receivedPlayerNames => {
  players.innerHTML = '';
  receivedPlayerNames.forEach(receivedPlayerName => {
    addElementIntoList(players, receivedPlayerName);
  });
});

// Allows the user to raise the bet
socket.emit('raise', 50, playerName);
socket.on('raise', (amount, playerName) => {
  alert(`${playerName}: ${amount}`);
});
