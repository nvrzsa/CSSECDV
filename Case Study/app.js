require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const multer = require('multer');
const mongodb = require('mongodb');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.use(session({
  secret: '1234567',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static('public'));
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.get('/', async (req, res) => {
  try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('APDEV');
      const collection = db.collection('coffeeshops');
      const coffeeShops = await collection.find().toArray();

      res.render('index', { coffeeShops, loggedIn: req.session.loggedIn });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});
  
app.get('/coffeeshop/:id', async (req, res) => {
  const coffeeShopId = req.params.id;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('APDEV');
    const collection = db.collection('coffeeshops');
    const reviewsCollection = db.collection('reviews');

    const coffeeShop = await collection.findOne({ _id: new ObjectId (coffeeShopId) });
    const reviews = await reviewsCollection.find({ coffeeshop_id: coffeeShopId }).toArray();

    let totalRating = 0;
    let totalReviews = 0;
    
    reviews.forEach(review => {
      const rating = parseInt(review.rating);
      totalRating += rating;
      totalReviews++;
    });
    
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(2) : null;
    
    res.render('coffeeshop', { coffeeShop, reviews, averageRating, loggedIn: req.session.loggedIn });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/user/:username', async (req, res) => {
  const username = req.params.username;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('APDEV');
    const usersCollection = db.collection('user');
    const reviewsCollection = db.collection('reviews');

    // Ensure the username is queried case-insensitively
    const user = await usersCollection.findOne({ username });
    const description = user ? user.description : '';

    // Get reviews for the user
    const userReviews = await reviewsCollection.find({ username }).toArray();

    res.render('user', { user, description, userReviews, loggedIn: req.session.loggedIn });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/profile', async (req, res) => {
  if (req.session.loggedIn) {
    try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('APDEV');
      const usersCollection = db.collection('user');
      
      const username = req.session.username;
      
      const user = await usersCollection.findOne({ username });
      const description = user ? user.description : '';

      res.render('profile', { username, description, loggedIn: req.session.loggedIn });
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect('/login'); 
  }
});

app.get('/login', (req, res) => {
  res.render('login', {loggedIn: req.session.loggedIn});
});

app.get('/search', (req, res) => {
  res.render('search-form', {loggedIn: req.session.loggedIn});
});

app.get('/search-results', async (req, res) => {
  const query = req.query.query;

  try {
    const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    const db = client.db('APDEV');
    const collection = db.collection('coffeeshops');
    const usersCollection = db.collection('user');


    const results = await collection.find({ name: { $regex: query, $options: 'i' } }).toArray();
    const userResults = await usersCollection.find({ username: { $regex: query, $options: 'i' } }).toArray();

    res.render('search-results', { results, userResults, query, loggedIn: req.session.loggedIn  }); // Render the search results page with the results and query
  } catch (err) {
    console.error('Error during search:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup', { loggedIn: false });
});


app.get('/review-success', (req, res) => {
  res.render('review-success', { loggedIn: req.session.loggedIn });
});

app.get('/review-failed', (req, res) => {
  res.render('review-failed', { loggedIn: req.session.loggedIn });
});

app.get('/make', async (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }
  const { username } = req.session;
  try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('APDEV');
      const coffeeShopsCollection = db.collection('coffeeshops');
      const reviewsCollection = db.collection('reviews');

      const coffeeShops = await coffeeShopsCollection.find().toArray();
      const reviews = await reviewsCollection.find({ username }).toArray();

      for (const review of reviews) {
        const coffeeShop = await coffeeShopsCollection.findOne({ _id: new ObjectId(review.coffeeshop_id) });
        review.coffeeShopName = coffeeShop ? coffeeShop.name : 'Unknown';
      }

      res.render('make', { coffeeShops, reviews, loggedIn: req.session.loggedIn });
  } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/about', (req, res) => {
  res.render('about', { loggedIn: req.session.loggedIn });
});

app.post('/add-review', async (req, res) => {
  const { rating, comment } = req.body;
  const { username } = req.session;
  const coffeeshop_id = req.body.coffeeshop_id; 

  if (!username) {
    res.redirect('/login'); 
    return;
  }

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('APDEV');
    const coffeeShopsCollection = db.collection('coffeeshops');
    const reviewsCollection = db.collection('reviews');

    const coffeeShop = await coffeeShopsCollection.findOne({ _id: new ObjectId(coffeeshop_id) });
    const existingReview = await reviewsCollection.findOne({ coffeeshop_id, username });
    if (existingReview) {
      res.redirect('/review-failed');
      return;
    }
    await reviewsCollection.insertOne({ coffeeshop_id, rating: parseInt(rating), comment, username });

    res.redirect('/review-success');
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).send('Internal Server Error');
  }});


app.post('/reviews/:id/edit', async (req, res) => {
  const reviewId = req.params.id;
  const { editRating, editComment } = req.body;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('APDEV');
    const reviewsCollection = db.collection('reviews');
    await reviewsCollection.updateOne({ _id: new ObjectId(reviewId) }, { $set: { rating: editRating, comment: editComment } });

    res.redirect('/make');
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/reviews/:id/delete', async (req, res) => {
  const reviewId = req.params.id;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('APDEV');
    const reviewsCollection = db.collection('reviews');

    // Delete the review from the database
    await reviewsCollection.deleteOne({ _id: new ObjectId(reviewId) });

    res.redirect('/make'); 
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req, res) => {  
  const { username, password } = req.body;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('APDEV');
    const usersCollection = db.collection('login');

    const user = await usersCollection.findOne({ username });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        req.session.loggedIn = true;
        req.session.username = username; 
        res.redirect('/');
      } else {
        res.send('Invalid username or password');
      }
    } else {
      res.send('Invalid username or password');
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/signup-failed', (req, res) => {
  res.render('signup-failed');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('APDEV');
    const loginCollection = db.collection('login');
    const usersCollection = db.collection('user');

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.render('signup-failed', { error: 'Username is already taken', loggedIn: req.session.loggedIn});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await loginCollection.insertOne({ username, password: hashedPassword });
    await usersCollection.insertOne({ username, description: null });


    res.redirect('/login');
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/profile', async (req, res) => {
  if (req.session.loggedIn) {
    const { description } = req.body;
    const username = req.session.username;

    try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('APDEV');
      const usersCollection = db.collection('user');
      const existingUser = await usersCollection.findOne({ username });

      if (existingUser) {
        await usersCollection.updateOne({ username }, { $set: { description } });
      } else {
        await usersCollection.insertOne({ username, description });
      }

      res.redirect('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.redirect('/login'); 
  }
});

app.post('/reviews', async (req, res) => {
  const { coffeeshop_id, rating, comment } = req.body;
  const { username } = req.session;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('APDEV');
    const reviewsCollection = db.collection('reviews');
    const existingReview = await reviewsCollection.findOne({ coffeeshop_id, username });
    if (existingReview) {
      res.redirect('/review-failed');
      return;
    }

    await reviewsCollection.insertOne({ coffeeshop_id, rating: parseInt(rating), comment, username });

    res.redirect('/review-success'); 
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/logout', (req, res) => {  
  req.session.destroy();
  res.redirect('/');
});

// Admin Side

app.get('/admin', (req, res) => {
  res.render('admin', { error: null, loggedIn: req.session.loggedIn });
});

app.post('/admin', async (req, res) => {
    res.redirect('/dashboard', { loggedIn: req.session.loggedIn });
});

app.get('/dashboard', async (req, res) => {
  try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('APDEV');
      const reviewsCollection = db.collection('reviews');
      const usersCollection = db.collection('user');
      const coffeeShopsCollection = db.collection('coffeeshops');

      const reviews = await reviewsCollection.find().toArray();
      const users = await usersCollection.find().toArray();
      const coffeeShops = await coffeeShopsCollection.find().toArray();
      res.render('dashboard', { reviews, users, coffeeShops, coffeeShopsCollection, loggedIn: req.session.loggedIn });
  } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/dashboard', (req, res) => {
  const { password } = req.body;

  if (password === '7654321') {

      req.session.loggedIn = true;

      res.redirect('/dashboard');
  } else {

      res.render('admin', { error: 'Invalid password', loggedIn: false });
  }
});

app.post('/admin/delete-review/:id', async (req, res) => {
  const reviewId = req.params.id;
  try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('APDEV');
      const reviewsCollection = db.collection('reviews');
      await reviewsCollection.deleteOne({ _id: new ObjectId(reviewId) });
      res.redirect('/dashboard');
  } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      res.status(500).send('Internal Server Error');
  }
});
app.post('/admin/delete-user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('APDEV');
      const loginCollection = db.collection('login');
      const userCollection = db.collection('user');
      const user = await userCollection.findOne({ _id: new ObjectId(userId) });

      await loginCollection.deleteOne({ username: user.username});
      await userCollection.deleteMany({ username: user.username });

      res.redirect('/dashboard');
  } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/admin/delete-coffee-shop/:id', async (req, res) => {
  const coffeeShopId = req.params.id;
  try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('APDEV');
      const coffeeShopsCollection = db.collection('coffeeshops');
      await coffeeShopsCollection.deleteOne({ _id: new ObjectId(coffeeShopId) });
      res.redirect('/dashboard');
  } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/admin/add-coffee-shop', (req, res) => {
  res.render('add-coffee-shop');
});

app.post('/admin/add-coffee-shop', upload.single('image'), async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? req.file.originalname : 'default.jpg'; 

  try {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = client.db('APDEV');
      const collection = db.collection('coffeeshops');

      await collection.insertOne({ name, description, image });

      res.redirect('/dashboard'); 
  } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
