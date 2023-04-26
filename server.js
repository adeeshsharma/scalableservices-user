const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const connect = require('./mongodb.js');
const swaggerInit = require('./swagger/swaggerInit.js');
const axios = require('axios');

connect();

const Product = mongoose.model('Product', {
  name: String,
  price: Number,
});

const User = mongoose.model('User', {
  name: String,
  email: String,
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

const app = express();
app.use(bodyParser.json());

swaggerInit(app);

// GET all users and their wishlists
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('wishlist');
    res.json(users);
  } catch (err) {
    console.log(err.message);
  }
});

// GET a specific user by ID and their wishlist
app.get('/user/:idToGet', async (req, res) => {
  try {
    const id = req.params.idToGet;
    const user = await User.findById(id).populate('wishlist');
    res.json(user);
  } catch (err) {
    console.log(err.message);
  }
});

// POST a new user
app.post('/user', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.json(user);
  } catch (err) {
    console.log(err.message);
  }
});

// UPDATE an existing user by ID
app.put('/user/:userIdToUpdate', async (req, res) => {
  try {
    const id = req.params.userIdToUpdate;
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.log(err.message);
  }
});

// DELETE an existing user by ID
app.delete('/user/:userIdToDelete', async (req, res) => {
  try {
    const id = req.params.userIdToDelete;
    await User.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (err) {
    console.log(err.message);
  }
});

// POST a new product ID to a user's wishlist
app.post('/user/:userId/wishlist/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist');
    res.json(user);
  } catch (err) {
    console.log(err.message);
  }
});

// POST a new order with the products from a user's wishlist
app.post('/user/:userId/orderWishlist', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('wishlist');
    const productIds = user.wishlist.map((product) => product._id);
    const { data: order } = await axios.post(`http://localhost:5001/order`, {
      userId,
      productIds,
    });
    user.wishlist = [];
    await user.save();
    res.json(order);
  } catch (err) {
    console.log(err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
