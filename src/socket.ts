import { Server } from 'socket.io';
import { Table } from '@interfaces/table.interface';

const tableIds: Record<string, Table> = {};

function sendNewActivity({ io, tableId, data }) {
  return io.sockets.in(tableId).emit('new-activity', data);
}

function handleSocketIo_(io: Server) {
  io.on('connect', socket => {
    socket.on('room-join', (tableId, playerName) => {
      socket.join(tableId);
      if (tableId in tableIds) {
        tableIds[tableId].players.push(playerName);
      } else {
        tableIds[tableId] = {
          players: [playerName],
          pot: 0,
          currentBet: 0,
        };
      }

      io.sockets.in(tableId).emit('all-players', tableIds[tableId].players);
      sendNewActivity({
        io: io,
        tableId: tableId,
        data: `${playerName} joined`,
      });

      socket.on('raise', (amount, playerName) => {
        tableIds[tableId].pot += amount;
        tableIds[tableId].currentBet += amount;
        socket.to(tableId).emit('raise', amount, playerName);
        sendNewActivity({
          io: io,
          tableId: tableId,
          data: `${playerName} raised by ${amount}`,
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
