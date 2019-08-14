const { myServer } = require('./server');

const server = new myServer(3300);
server.startServer();