const ioc = require("socket.io-client");
const { superServer } = require("./configs");

let socketWithSuperServer = ioc.connect("http://"+superServer.ip+":"+superServer.port+"", {
  query: { isUser: true }
});

socketWithSuperServer.on("server", serverIpAndPort => {
  console.log(serverIpAndPort);
  let socketWithServer = ioc.connect("http://"+serverIpAndPort);

  socketWithServer.on("product_created", (prodID) => {
    console.log(prodID);
  })
  socketWithServer.on("connect", () => {
    console.log("CONNECTED TO SERVER");
    
    socketWithSuperServer.disconnect();
  })

  let createProduct = (name, price) => {
    socketWithServer.emit("new_product", { name, price });
  }
});