const ioc = require("socket.io-client");
const { superServer } = require("./configs");

let socketWithSuperServer = ioc.connect("http://"+superServer.ip+":"+superServer.port+"", {
  query: { isUser: true }
});

socketWithSuperServer.on("server", serverIpAndPort => {
  console.log(serverIpAndPort);
  let socketWithServer = ioc.connect("http://"+serverIpAndPort);

  socketWithServer.on("connect", () => {
    console.log("CONNECTED TO SERVER");
    socketWithSuperServer.disconnect();
  })
});