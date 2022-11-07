import { Server } from 'socket.io';
import { Table } from '@interfaces/table.interface';
import Deck from '@creativenull/deckjs';

const tableIds: Record<string, Table> = {};

function sendNewActivity({ io, tableId, data, event = 'new-activity' }): any {
  return io.sockets.in(tableId).emit(event, data);
}

function handleSocketIo_(io: Server) {
  io.on('connect', socket => {
    // User joined the table
    socket.on('room-join', (tableId: string, playerName: string) => {
      socket.join(tableId);

      // Check whether the table exists in the "database"
      if (tableId in tableIds) {
        // Add user's name into the database
        tableIds[tableId].players.push(playerName);
        socket.emit('remove-start-game');
      } else {
        // Create a new table
        tableIds[tableId] = {
          players: [playerName],
          pot: 0,
          amountRaised: 0,
          cards: Deck.stringify(new Deck(true).getCards(5)),
        };
        socket.emit('start-game');
      }
      socket.emit('5-cards', tableIds[tableId].cards);
      socket.emit('your-cards', Deck.stringify(new Deck(true).getCards(2)));

      // Allows the client to get all the usernames connected to the table
      sendNewActivity({
        io: io,
        tableId: tableId,
        data: tableIds[tableId].players,
        event: 'all-players',
      });

      // Let other user connected to the table know a new user connected
      sendNewActivity({
        io: io,
        tableId: tableId,
        data: `${playerName} joined`,
      });

      // Allows a user to raise the bet by a specific amount
      socket.on('raise', (amount: string, playerName: string) => {
        // Increase the pot
        tableIds[tableId].pot += parseInt(amount);
        // store the amount raised by
        tableIds[tableId].amountRaised = parseInt(amount);
        socket.to(tableId).emit('raise', amount);
        sendNewActivity({
          io: io,
          tableId: tableId,
          data: `${playerName} raised by ${amount}`,
        });
        sendNewActivity({
          io: io,
          tableId: tableId,
          data: tableIds[tableId].pot,
          event: 'pot-change',
        });
        const players = tableIds[tableId].players;
        const nextPlayer = players[players.indexOf(playerName) + 1];
        if (nextPlayer) {
          sendNewActivity({
            io: io,
            tableId: tableId,
            data: nextPlayer,
            event: 'next-player-turn',
          });
        } else {
          sendNewActivity({
            io: io,
            tableId: tableId,
            data: null,
            event: 'next-card',
          });

          sendNewActivity({
            io: io,
            tableId: tableId,
            data: 'Displaying the next card',
          });
        }
      });

      // User matched the bet (amount raised)
      socket.on('match', playerName => {
        tableIds[tableId].pot += tableIds[tableId].amountRaised;
        sendNewActivity({
          io: io,
          tableId: tableId,
          data: `${playerName} matched`,
        });
        sendNewActivity({
          io: io,
          tableId: tableId,
          data: tableIds[tableId].pot,
          event: 'pot-change',
        });
        const players = tableIds[tableId].players;
        const nextPlayer = players[players.indexOf(playerName) + 1];
        if (nextPlayer) {
          sendNewActivity({
            io: io,
            tableId: tableId,
            data: nextPlayer,
            event: 'next-player-turn',
          });
        } else {
          sendNewActivity({
            io: io,
            tableId: tableId,
            data: null,
            event: 'next-card',
          });

          sendNewActivity({
            io: io,
            tableId: tableId,
            data: 'Displaying the next card',
          });
        }
      });

      // User folded
      socket.on('fold', playerName => {
        sendNewActivity({
          io: io,
          tableId: tableId,
          data: `${playerName} folded`,
        });
        const players = tableIds[tableId].players;
        const nextPlayer = players[players.indexOf(playerName) + 1];
        if (nextPlayer) {
          sendNewActivity({
            io: io,
            tableId: tableId,
            data: nextPlayer,
            event: 'next-player-turn',
          });
        } else {
          sendNewActivity({
            io: io,
            tableId: tableId,
            data: null,
            event: 'next-card',
          });

          sendNewActivity({
            io: io,
            tableId: tableId,
            data: 'Displaying the next card',
          });
        }
      });
    });
  });
}

export class handleSocketIo {
  public static io: Server;

  public static SetIo(io_: Server) {
    handleSocketIo.io = io_;
    handleSocketIo_(io_);
  }
  public static getIo(): Server {
    return handleSocketIo.io;
  }
}
