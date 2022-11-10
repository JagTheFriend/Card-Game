var balance = 500;
var raisedAmountByOtherUser = 0;
var myTurn = false;
var cardsToDisplay = [];
var myCards = [];
var raisedCard = false;

const socket = io('/');
const players = document.getElementById('players');
const activityChat = document.getElementById('activityChat');
const table = document.getElementById('table');
const pot = document.getElementById('pot');
const balanceDisplayed = document.getElementById('balance');
const matchOrCheck = document.getElementById('matchOrCheck');
balanceDisplayed.innerText = balance;

// The selector for cards
const hiddenCards = document.getElementsByClassName('hiddenCards');
const displayedCard = document.getElementsByClassName('displayedCard');
const userDisplayedCard = document.getElementsByClassName('userDisplayedCard');

// Selector for the slider
const slider = document.getElementById('raiseAmount');

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

function disableButtons(disableBtn = true) {
  raiseBtn.disabled = disableBtn;
  matchBtn.disabled = disableBtn;
  foldBtn.disabled = disableBtn;
}

function getImage(card) {
  const data = card.split('#')[1];
  return `${data.slice(0, -1)}-${data.slice(-1)}.png`;
}

slider.onchange = data => {
  raiseBtn.innerText = `Raise by ${slider.value}`;
};

balanceDisplayed.onchange = data => {
  slider.max = balanceDisplayed.innerText;
};

socket.emit('room-join', TABLE_ID, playerName);
addElementIntoList(players, playerName);

raiseBtn.onclick = () => {
  if (balance == 0) {
    return socket.emit('next-player', playerName);
  }

  const raisedAmount = parseInt(slider.value) <= balance ? parseInt(slider.value) : balance;
  // decrease balance
  const total = raisedAmount + raisedAmountByOtherUser;
  balance = total <= balance ? balance - total : 0;
  balanceDisplayed.innerText = balance;
  // Allows the user to raise the bet
  socket.emit('raise', raisedAmount, playerName);
  raisedCard = true;
  disableButtons();
};

matchBtn.onclick = () => {
  if (matchOrCheck.innerText == 'Match') {
    return socket.emit('check', playerName);
  }

  if (balance == 0) {
    return socket.emit('next-player', playerName);
  }

  // decrease balance
  const total = raisedAmountByOtherUser;
  balance = total <= balance ? balance - total : 0;
  balanceDisplayed.innerText = balance;
  socket.emit('match', playerName);
  disableButtons();
};

foldBtn.onclick = () => {
  // Disable all the buttons
  raiseBtn.disabled = true;
  matchBtn.disabled = true;
  foldBtn.disabled = true;
  socket.emit('fold', playerName);
  disableButtons();
};

// Allows the "creator" of the table to start the game
socket.on('start-game', () => {
  document.getElementById('startBtn').onclick = () => {
    document.getElementById('startBtnDiv').innerHTML = '';
    disableButtons(false);
  };
});

// Adds received data to activityChat
socket.on('new-activity', data => {
  return addElementIntoList(activityChat, data);
});

// Displays all the connected username
socket.on('all-players', receivedPlayerNames => {
  players.innerHTML = '';
  return receivedPlayerNames.forEach(receivedPlayerName => {
    addElementIntoList(players, receivedPlayerName);
  });
});

// Runs when a user raises the amount
socket.on('raise', amount => {
  raisedAmountByOtherUser = amount;
  raisedCard = false;
  matchOrCheck.innerText = 'Match';
  document.getElementById('matchAmount').innerText = amount;
});

// Don't show the start button if the current user is not the creator
socket.on('remove-start-game', () => {
  document.getElementById('startBtnDiv').innerHTML = '';
  return disableButtons();
});

// Display the change in Pot
socket.on('pot-change', newAmount => {
  pot.innerText = newAmount;
});

// Checks whether it's current user's turn
socket.on('next-player-turn', _playerName => {
  if (_playerName === playerName && raisedCard) {
    raisedCard = false;
    return socket.emit('next-player', playerName);
  }
  myTurn = _playerName === playerName;
  return disableButtons(!myTurn);
});

socket.on('5-cards', cards_ => {
  cards_.slice(0, 3).forEach(card => {
    displayedCard[cards_.indexOf(card)].src = `/cards/${getImage(card)}`;
  });
  cardsToDisplay = cardsToDisplay.concat(cards_);
});

socket.on('your-cards', cards_ => {
  return cards_.forEach(card => {
    userDisplayedCard[cards_.indexOf(card)].src = `/cards/${getImage(card)}`;
    myCards.push(card);
  });
});

socket.on('display-next-card', () => {
  if (hiddenCards[0].src.split('/')[4] == 'BACK.png') {
    const card = cardsToDisplay[cardsToDisplay.length - 2];
    hiddenCards[0].src = `/cards/${getImage(card)}`;
  } else {
    const card = cardsToDisplay[cardsToDisplay.length - 1];
    hiddenCards[1].src = `/cards/${getImage(card)}`;
  }
  raisedCard = false;
  matchOrCheck.innerText = 'Check';
});

socket.on('send-cards', () => {
  return disableButtons();
});
