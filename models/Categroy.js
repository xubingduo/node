var mongoose = require('mongoose');

var categorySchema = require('../schemas/categorys');

module.exports = mongoose.model('Category',categorySchema);