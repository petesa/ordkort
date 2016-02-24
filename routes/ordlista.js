var express = require('express');
var router = express.Router();
var Word = require('../models/word');

router.get('/', function(req, res) {

  var skip = req.query.skip ? req.query.skip : 0;
  var limit = req.query.limit ? req.query.limit: 10;

  if(req.user === undefined){
    res.redirect('/');
  }else{
    Word.find({'user_id':req.user._id.toString()},function(err, words) {
      if (err)
        return console.error(err);
        res.json(words);
    }).sort('word').skip(skip).limit(limit);
  }
});

module.exports = router;
