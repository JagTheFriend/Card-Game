import { Server } from 'socket.io';

function handleSocketIo_(io: Server) {
  io.on('connect', socket => {
    socket.on('room-join', (tableId, playerName) => {
      console.log(tableId)
      console.log(playerName)
    })
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
