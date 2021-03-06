var express = require('express');
var router = express.Router();
var Category = require('../models/Categroy');
var Content = require('../models/Content');

//处理通用数据
var data;

router.use(function(req,res,next){
    data = {
        userInfo : req.userInfo,
        Categories : [],
    }

    Category.find().then(function(Categories){
        data.Categories = Categories;

        // console.log(Categories)
        next();
    })
})


router.get('/',function(req,res,next){

    data.page = Number(req.query.page || 1);
    data.limit = 4;
    data.pages = 0;
    data.category= req.query.category || '';
    data.count = 0;



    var where = {};
    if(data.category){
        where.category = data.category;
    }


    Content.where(where).count().then(function(countnad){
        
        data.count  = countnad;
        data.pages = Math.ceil(data.count / data.limit);   //上取整
        
        //取值不能超过pages
        data.page = Math.min(data.page,data.pages);
        //取值不能小于1
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(['category','user']).sort({addTime: -1});

    }).then(function(contents){
        data.contents = contents;
        res.render('main/index',data)
    })
    
})



router.get('/view',function(req,res){
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).then(function(content){
        data.content = content;
        content.views++;
        content.save();
        res.render('main/view',data);
    })
})

module.exports = router;