var balance = 500;
var raisedAmountByOtherUser = 0;

const socket = io('/');
const players = document.getElementById('players');
const activityChat = document.getElementById('activityChat');
const table = document.getElementById('table');
const pot = document.getElementById('pot');
const balanceDisplayed = document.getElementById('balance');
balanceDisplayed.innerText = balance;

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

document.getElementById('raiseAmount').onchange = data => {
  raiseBtn.innerText = `Raise by ${document.getElementById('raiseAmount').value}`;
};

socket.emit('room-join', TABLE_ID, playerName);
addElementIntoList(players, playerName);

raiseBtn.onclick = () => {
  const raisedAmount = parseInt(document.getElementById('raiseAmount').value);
  // decrease balance
  const total = raisedAmount + raisedAmountByOtherUser;
  balance = total <= balance ? balance - total : balance;
  balanceDisplayed.innerText = balance;
  // Allows the user to raise the bet
  socket.emit('raise', raisedAmount, playerName);
};

matchBtn.onclick = () => {
  // decrease balance
  const total = raisedAmountByOtherUser;
  balance = total <= balance ? balance - total : balance;
  balanceDisplayed.innerText = balance;
  socket.emit('match', playerName);
};

foldBtn.onclick = () => {
  // Disable all the buttons
  raiseBtn.disabled = true;
  matchBtn.disabled = true;
  foldBtn.disabled = true;
  socket.emit('fold', playerName);
};

// Allows the "creator" of the table to start the game
socket.on('start-game', () => {
  document.getElementById('startBtn').onclick = () => {
    document.getElementById('startBtnDiv').innerHTML = '';
    socket.emit('start-table-game');
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

// Runs when a user raises the amount
socket.on('raise', amount => {
  raisedAmountByOtherUser = amount;
  document.getElementById('matchAmount').innerText = amount;
});

// Don't show the start button if the current user is not the creator
socket.on('remove-start-game', () => {
  document.getElementById('startBtnDiv').innerHTML = '';
});

// Display the change in Pot
socket.on('pot-change', newAmount => {
  pot.innerText = newAmount;
});
