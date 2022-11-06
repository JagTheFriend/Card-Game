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

document.getElementById("raiseAmount").onchange = (data) => {
  raiseBtn.innerText = `Raise by ${document.getElementById("raiseAmount").value}`
}

socket.emit('room-join', TABLE_ID, playerName);
addElementIntoList(players, playerName);

raiseBtn.onclick = () => {
  const amount = document.getElementById('raiseAmount').value
  // Allows the user to raise the bet
  socket.emit('raise', amount, playerName);
};

matchBtn.onclick = () => {
  socket.emit('match');
};

foldBtn.onclick = () => {
  raiseBtn.disabled = true;
  matchBtn.disabled = true;
  foldBtn.disabled = true;
  socket.emit('fold', playerName);
};

// Allows the "creator" of the table to start the game
socket.on('start-game', () => {
  document.getElementById('startBtn').onclick = () => {
    document.getElementById('startBtnDiv').innerHTML = '';
    socket.emit('start-game');
  };
});

// Adds received data to activityChat
socket.on('new-activity', data => {
  addElementIntoList(activityChat, data);
});

// Displays all the connected username
socket.on('all-players', receivedPlayerNames => {
  players.innerHTML = '';
  receivedPlayerNames.forEach(receivedPlayerName => {
    addElementIntoList(players, receivedPlayerName);
  });
});

socket.on('raise', (amount, playerName) => {
  alert(`${playerName}: ${amount}`);
});

// Don't show the start button if the current user is not the creator
socket.on('remove-start-game', () => {
  document.getElementById('startBtnDiv').innerHTML = '';
});
