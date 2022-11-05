const socket = io('/');
const players = document.getElementById('players');
const activityChat = document.getElementById('activityChat');
const table = document.getElementById('table');
const playerName = 'jag';

function addElementIntoList(listReference, data) {
  const node = document.createElement('li');
  node.className = 'list-group-item';
  const data_ = document.createTextNode(data);
  node.appendChild(data_);
  listReference.appendChild(node);
  listReference.appendChild(document.createElement('br'));
}

socket.emit('room-join', TABLE_ID, playerName);
addElementIntoList(players, playerName);

socket.on('all-players', receivedPlayerNames => {
  console.log(receivedPlayerNames);
  players.innerHTML = '';
  receivedPlayerNames.forEach(receivedPlayerName => {
    addElementIntoList(players, receivedPlayerName);
  });
});
