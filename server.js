const ioc = require("socket.io-client");
const app = require("http").createServer();
const ip = require("ip");
const socketServer = require("socket.io")(app);

const { superServer } = require("./configs");

function myServer (port) {
  this.serverPort = port;

  myServer.prototype.startServer = () => {
    let socketWithSuperServer = ioc.connect("http://"+superServer.ip+":"+superServer.port+"", {
      query: { ip: ip.address(), port: this.serverPort }
    });
  
    socketWithSuperServer.on("test", msg => {
      console.log(msg);
    });
  
    socketServer.listen(this.serverPort);
    socketServer.on('connection', function (socket) {
      console.log("CLIENT CONNECTION " +socket.id );
      socket.emit('test', { hello: 'world' });
      socket.on('new_server', function (data) {
        console.log(data);
      });
      socket.on('disconnect', () => {
        console.log("Client disconnected " + socket.id);
      })
    });
    
  }

}

module.exports.myServer = myServer;
