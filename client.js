const ioc = require("socket.io-client");
const { superServer } = require("./configs");
var readline = require("readline");
let entered = false;

let connectWithSuperServer = () => {
  return ioc.connect("http://" + superServer.ip + ":" + superServer.port + "", {
    query: { isUser: true }
  });
};
let socketWithSuperServer = connectWithSuperServer();

async function ask(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve =>
    rl.question(query+": ", ans => {
      rl.close();
      resolve(ans);
    })
  );
}

let socketWithServer;
socketWithSuperServer.on("server", serverIpAndPort => {
  //console.log(serverIpAndPort);
  socketWithServer = ioc.connect("http://" + serverIpAndPort);

  socketWithServer.on("product_created", prodID => console.log(prodID));
  socketWithServer.on("product_list", productList => console.log(productList));
  socketWithServer.on("product_updated", () => console.log('Product Changed'));
  socketWithServer.on("product_deleted", product => console.log(product));

  socketWithServer.on("disconnect", () => {
    socketWithServer.disconnect();
    socketWithSuperServer.open();
  });

  socketWithServer.on("connect", async () => {
    //console.log("CONNECTED TO SERVER " + serverIpAndPort);

    socketWithSuperServer.disconnect();

    let choose;

    if (!entered) {
      entered = true;
      do {
        choose = await ask(
          "Type what do you want - 0: exit, 1: create, 2: read, 3: update, 4: delete "
        );
        switch (choose) {
          case "1":
            const productName = await ask("Type the product name");
            const productPrice = await ask("Type the product price");
            createProduct(productName, productPrice);
            break;
          case "2":
            console.log("CHAMANDO LISTAR");
            listProducts();
            break;
          case "3":
            const productIDUpdate = await ask("Type the product ID");
            const productNameUpdate = await ask("Type the product name");
            const productPriceUpdate = await ask("Type the product price");
            editProduct(productIDUpdate, productNameUpdate, productPriceUpdate);
            break;
          case "4":
            const productIDDelete = await ask("Type the product ID");
            deleteProduct(productIDDelete);
            break;
        }
      } while (choose !== "0");
    }
  });

  let createProduct = (name, price) =>
    socketWithServer.emit("new_product", { name, price });
  let listProducts = () => socketWithServer.emit("list_products");
  let editProduct = (productID, name, price) =>
    socketWithServer.emit("edit_product", { productID, name, price });
  let deleteProduct = productID =>
    socketWithServer.emit("delete_product", { productID });
});
