const Product = require("../models/Product");

// CREATE, READ, UPDATE, DELETE
module.exports = {
  async create(socket, name, price, superServerSocket) {
    const product = new Product({ name, price });
    await product.save();
    socket.emit("product_created", product._id);
    superServerSocket.emit("database_changed");
  },
  async read(socket) {
    const product = await Product.find({});
    socket.emit("product_list", product);
  },
  async update(socket, productID, name, price, superServerSocket) {
    const product = await Product.findOneAndUpdate(
      { _id: productID },
      { name, price }
    );
    socket.emit("product_updated");
    superServerSocket.emit("database_changed");
  },
  async deleteP(socket, productID, superServerSocket) {
    const product = await Product.findOneAndDelete({_id: productID});
    socket.emit("product_deleted", product);
    superServerSocket.emit("database_changed");
  }
};
