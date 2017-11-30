var express = require('express');
var router = express.Router();
var Category = require('../models/Categroy');
var Content = require('../models/Content');


router.get('/',function(req,res,next){

    var data = {
         page : Number(req.query.page || 1),
         limit : 4,
         pages : 0,
         userInfo : req.userInfo,
         Categories : [],
         category: req.query.category || '',
         count : 0,
    }

    var where = {};

    if(data.category){
        where.category = data.category;
    }


    Category.find().then(function(Categories){
        data.Categories = Categories;
        return Content.where(where).count();

    }).then(function(countnad){
        
        data.count  = countnad;
        data.pages = Math.ceil(data.count / data.limit);   //上取整
        
        //取值不能超过pages
        data.page = Math.min(data.page,data.pages);
        //取值不能小于1
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(['category','user']).sort({addTime: -1});

    }).then(function(contents){
        data.contents = contents
        res.render('main/index',data)
    })
    
})

module.exports = router;