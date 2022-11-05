import { Server } from 'socket.io';

const tableIds: Record<string, string[]> = {};

function handleSocketIo_(io: Server) {
  io.on('connect', socket => {
    socket.on('room-join', (tableId, playerName) => {
      socket.join(tableId);
      if (tableId in tableIds) {
        tableIds[tableId].push(playerName);
      } else {
        tableIds[tableId] = [playerName];
      }
      io.sockets.in(tableId).emit('all-players', tableIds[tableId]);
      io.sockets.in(tableId).emit("new-activity", `${playerName} joined the table`);
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
