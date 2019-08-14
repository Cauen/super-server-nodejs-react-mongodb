const { myServer } = require('./server');

const server = new myServer(3200);
server.startServer();