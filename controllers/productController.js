const Product = require('../models/Product');

// CREATE, READ, UPDATE, DELETE
module.exports = {
  async create(socket, name, price) {
    var product = new Product({ name,  price });
    await product.save();
    socket.emit("product_created", product._id);
  }
}