var mongoose = require('mongoose');
var ContactCategory = new mongoose.Schema({
    Category_name: String,
    Subcategory_name:Array
});

module.exports = mongoose.model('ContactCategory', ContactCategory)