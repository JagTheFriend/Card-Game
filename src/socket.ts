import { Server } from 'socket.io';
import { Table } from '@interfaces/table.interface';

const tableIds: Record<string, Table> = {};

function sendNewActivity({ io, tableId, data }) {
  return io.sockets.in(tableId).emit('new-activity', data);
}

function handleSocketIo_(io: Server) {
  io.on('connect', socket => {
    // User joined the table
    socket.on('room-join', (tableId, playerName) => {
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
        };
        socket.emit('start-game');
      }

      // Allows the client to get all the usernames connected to the table
      io.sockets.in(tableId).emit('all-players', tableIds[tableId].players);

      // Let other user connected to the table know a new user connected
      sendNewActivity({
        io: io,
        tableId: tableId,
        data: `${playerName} joined`,
      });

      // Allows a user to raise the bet by a specific amount
      socket.on('raise', (amount, playerName) => {
        // Increase the pot
        tableIds[tableId].pot += amount;
        // store the amount raised by
        tableIds[tableId].amountRaised = amount;
        socket.to(tableId).emit('raise', amount, playerName);
        sendNewActivity({
          io: io,
          tableId: tableId,
          data: `${playerName} raised by ${amount}`,
        });
      });

      // User matched the bet (amount raised)
      socket.on('match', playerName => {
        tableIds[tableId].pot += tableIds[tableId].amountRaised;
        sendNewActivity({
          io: io,
          tableId: tableId,
          data: `${playerName} matched`,
        });
      });

      // User folded
      socket.on('fold', playerName => {
        sendNewActivity({
          io: io,
          tableId: tableId,
          data: `${playerName} folded`,
        });
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
