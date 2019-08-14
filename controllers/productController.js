const Product = require("../models/Product");

// CREATE, READ, UPDATE, DELETE
module.exports = {
  async create(socket, name, price) {
    const product = new Product({ name, price });
    await product.save();
    socket.emit("product_created", product._id);
  },
  async read(socket) {
    const product = await Product.find({});
    socket.emit("product_list", product);
  },
  async update(socket, productID, name, price) {
    const product = await Product.findOneAndUpdate(
      { _id: productID },
      { name, price }
    );
    socket.emit("product_updated", product);
  },
  async deleteP(socket, productID) {
    const product = await Product.findOneAndDelete({_id: productID});
    socket.emit("product_deleted", product);
  }
};
