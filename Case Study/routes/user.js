const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/users', (req, res) => {
  fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Server Error');
    } else {
      res.json(JSON.parse(data));
    }
  });
});

module.exports = router;
