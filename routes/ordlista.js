var express = require('express');
var router = express.Router();
var Word = require('../models/word');

router.get('/', function(req, res) {

  if(req.user === undefined){
    res.redirect('/');
  }else{
    Word.find({'user_id':req.user._id.toString()},function(err, words) {
      if (err)
        return console.error(err);
        res.json(words);
    }).sort('word');
  }
});

module.exports = router;
