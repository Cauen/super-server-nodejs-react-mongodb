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
  console.log("CLIENT CONNECTION " + socket.ip + ":" + socket.port );
  if (socket.isUser) {
    socket.emit('server', getRandomServer(servers));
  }
  showServers();
  socket.on('new_server', function (data) {
    console.log(data);
  });
  socket.on("disconnect", () => {
    console.log("Super server loses connection with server " + socket.ip+":"+socket.port);

    if (socket.isUser) {
      console.log("Client connected to server and disconnected from me!");
    } else {
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