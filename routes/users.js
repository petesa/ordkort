var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Word = require('../models/word');
var router = express.Router();

/* GET users listing. */
router.get('/', isLoggedin, function(req, res, next) {
    res.redirect(req.user.username);
});

router.get('/:username', isLoggedin, function(req, res, next) {
  res.render('users', { title: 'Ordkort :: '+req.user.username, username:req.user.username});
});

router.get('/:username/admin', isLoggedin, function(req, res, next) {
  res.render('admin', { title: 'Hantera dina ord', username:req.user.username });
})

router.post('/:username/lagg-ord', isLoggedin, function(req, res) {
    var data = JSON.parse(req.body.data);

    for(i=0; i< data.length; i++)
      data[i].user_id = req.user._id.toString();

    var newWord = new Word();

    newWord.collection.insert(data, onInsert);

    function onInsert(err, word){
      if(err){
          throw err;
          console.log(err);
          res.send({response:err});
      }else{
          console.log('saved!');
          req.body.msg = '';
          res.send(req.body);
      }
    };
});

router.post('/:username/redigera', isLoggedin, function(req, res, next){
  var data = JSON.parse(req.body.data);
  Word.findById(data.id, function (err, word) {
    if(err) { return next(err); }
    if(!word) { return res.sendStatus(404); }
    /*word.update({ ord: data.ord, beskrivning: data.beskrivning}, function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(204);
    });*/
    word.word = data.ord;
    word.description = data.beskrivning;

    word.save(function(err) {
      if (err)
        res.send({response:err});
      else
        res.send(req.body);
    });
  });
});

router.delete('/:username/radera', isLoggedin, function(req, res, next) {
  Word.findById(req.body.id, function (err, word) {
    if(err) { return next(err); }
    if(!word) { return res.sendStatus(404); }
    word.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
});

/*router.get('/:username/ordlista', isLoggedin, function(req, res) {
    Word.find({'user_id':req.user._id.toString()},function(err, words) {
      if (err)
        return console.error(err);
        res.json(words);
    });
});*/

function isLoggedin(req, res, next) {

    if (req.user)
        return next();

    res.redirect('/');
}


module.exports = router;
