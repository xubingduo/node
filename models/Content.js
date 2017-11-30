var mongoose = require('mongoose');

var contentsSchema = require('../schemas/content');

module.exports = mongoose.model('Content',contentsSchema);