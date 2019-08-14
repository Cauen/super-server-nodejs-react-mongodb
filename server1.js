const { myServer } = require('./server');

const server = new myServer(3100);
server.startServer();