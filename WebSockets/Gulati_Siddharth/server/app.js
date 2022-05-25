const app = require('express');
const http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('new client connected', socket.id);

  socket.on('user_join', (name, room) => {
    //socket.broadcast.emit('user_join', name);
    io.in(room).emit('user_join', name)
  });

  socket.on('room', (room) => {
    socket.join(room);
  })

  socket.on('message', ({name, message, room}) => {
    console.log(name, message, socket.id);
    io.to(room).emit('message', {name, message});
  });

  socket.on('disconnect', () => {
    console.log('Disconnect Fired');
  });
});

http.listen(4000, () => {
  console.log(`listening on *:${4000}`);
});
