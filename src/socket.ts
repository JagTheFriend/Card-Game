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
        tableIds[tableId].activityChat.push(`${playerName} joined`);
      } else {
        tableIds[tableId] = {
          players: [playerName],
          pot: 0,
          currentBet: 0,
          activityChat: [`${playerName} joined`],
        };
      }
      io.sockets.in(tableId).emit('all-players', tableIds[tableId].players);
      io.sockets.in(tableId).emit('new-activity', `${playerName} joined`);
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
