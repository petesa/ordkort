var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Word = new Schema({
    word: String,
    description: String,
    image:String,
    user_id:String
});

module.exports = mongoose.model('Word', Word);
