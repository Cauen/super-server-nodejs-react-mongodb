const app = require("http").createServer();
const socketSuperServer = require("socket.io")(app);

const servers = {};
socketSuperServer.listen(3000);
socketSuperServer.use((socket, next) => {
  let { ip, port, isUser } = socket.handshake.query;
  socket.ip = ip;
  socket.port = port;
  socket.isUser = isUser;
  if (!isUser)
    servers[ip + ":" + port] = socket;
  next();
});
socketSuperServer.on('connection', function (socket) {
  if (socket.isUser) {
    let randomServer = getRandomServer(servers);
    console.log("Client connected to server " + randomServer + " and will disconnect to me!");
    socket.emit('server', randomServer);
  } else {
    console.log("Server connected " + socket.ip + ":" + socket.port );
  }
  showServers();
  socket.on('database_changed', function () {
    let sockets = Object.values(servers);
    sockets.forEach(socket => {
      socket.emit("updated_database");
    })

  });
  socket.on("disconnect", () => {
    if (socket.isUser) {
      console.log("Client disconnected to me!");
    } else {
      console.log("Super server loses connection with server " + socket.ip+":"+socket.port);
      delete servers[socket.ip+":"+socket.port];
      showServers();
    }
  });
});

let showServers = () => {
  console.log('Servers');
  console.log(Object.keys(servers));
}
let getRandomServer = (obj) => {
  var keys = Object.keys(obj)
  return keys[ keys.length * Math.random() << 0];
};