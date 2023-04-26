const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const connect = require('./mongodb.js');
const swaggerInit = require('./swagger/swaggerInit.js');

connect();

const User = mongoose.model('User', {
  name: String,
  email: String,
});

const app = express();
app.use(bodyParser.json());

swaggerInit(app);

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err.message);
  }
});

app.get('/user/:idToGet', async (req, res) => {
  try {
    const id = req.params.idToGet;
    const user = await User.findById(id);
    res.json(user);
  } catch (err) {
    console.log(err.message);
  }
});

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

app.put('/user/:idToUpdate', async (req, res) => {
  try {
    const { idToUpdate } = req.params;
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

app.delete('/user/:idToDelete', async (req, res) => {
  try {
    const { idToDelete } = req.params;
    await User.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (err) {
    console.log(err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
