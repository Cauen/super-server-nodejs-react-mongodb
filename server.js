const ioc = require("socket.io-client");
const app = require("http").createServer();
const ip = require("ip");
const fs = require("fs");
const { spawn } = require('child_process');
const socketServer = require("socket.io")(app);
const mongoose = require('mongoose');
const { create, read, update, deleteP } = require('./controllers/productController');

const { superServer } = require("./configs");

mongoose.connect('mongodb+srv://ata:ata@emanuelcluster-d7gth.mongodb.net/distribuidos?retryWrites=true&w=majority', {
  useNewUrlParser: true
});

const restartProcess = () => {
  const logfile = 'servers_log.log';
  const out = fs.openSync(logfile, 'a');
  const err = fs.openSync(logfile, 'a');
  spawn(process.argv[0], process.argv.slice(1), {
    detached: true, 
    stdio: ['ignore', out, err]
  }).unref()
  process.exit()
}


let userList = {};
function myServer (port) {
  this.serverPort = port;

  myServer.prototype.startServer = () => {
    let socketWithSuperServer = ioc.connect("http://"+superServer.ip+":"+superServer.port+"", {
      query: { ip: ip.address(), port: this.serverPort }
    });
  
    socketWithSuperServer.on("updated_database", () => {
      let userSockets = Object.values(userList);
      userSockets.forEach(socket => {
        read(socket);
      })
    });
  
    socketServer.listen(this.serverPort);
    socketServer.on('connection', function (socket) {
      console.log("CLIENT CONNECTION " + socket.id );
      userList[socket.id] = socket;
      socket.emit('test', { hello: 'world' });
      socket.on('new_product', function (data) {
        const { name, price } = data;
        create(socket, name, price, socketWithSuperServer);
      });
      socket.on('list_products', function () {
        read(socket);
      });
      socket.on('edit_product', function (data) {
        const { productID, name, price } = data;
        update(socket, productID, name, price, socketWithSuperServer);
      });
      socket.on('delete_product', function (data) {
        const { productID } = data;
        if (productID == "failure") {
          restartProcess();
        }
        deleteP(socket, productID, socketWithSuperServer);
      });
      socket.on('disconnect', () => {
        delete userList[socket.id];
        console.log("Client disconnected " + socket.id);
      })
    });
    
  }

}

module.exports.myServer = myServer;
