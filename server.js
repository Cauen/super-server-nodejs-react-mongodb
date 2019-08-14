const ioc = require("socket.io-client");
const app = require("http").createServer();
const ip = require("ip");
const socketServer = require("socket.io")(app);
const mongoose = require('mongoose');
const { create, read, update, deleteP } = require('./controllers/productController');

const { superServer } = require("./configs");

mongoose.connect('mongodb+srv://ata:ata@emanuelcluster-d7gth.mongodb.net/distribuidos?retryWrites=true&w=majority', {
  useNewUrlParser: true
});

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
      socket.on('new_product', function (data) {
        const { name, price } = data;
        create(socket, name, price);
      });
      socket.on('list_products', function () {
        read(socket);
      });
      socket.on('edit_product', function (data) {
        const { productID, name, price } = data;
        update(socket, productID, name, price);
      });
      socket.on('delete_product', function (data) {
        const { productID } = data;
        deleteP(socket, productID);
      });
      socket.on('disconnect', () => {
        console.log("Client disconnected " + socket.id);
      })
    });
    
  }

}

module.exports.myServer = myServer;
