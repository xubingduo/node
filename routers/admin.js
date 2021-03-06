var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Categroy');
var Content = require('../models/Content');


router.use(function(req,res,next) {
    if(!req.userInfo.isAdmin) {
        //如果当前用户是非管理员
        res.send('对不起只有管理员可以进入后台管理')
    }
    next();
})

//index
router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo : req.userInfo
    })
})

//用户管理
router.get('/user',function(req,res){
    //读数据

    /**
     * limit()
     * skip()
     * （current -1 ）*limit
     * 
     */

     var page = Number(req.query.page || 1);
     var limit = 2;
     var pages = 0;

     User.count().then(function(count){
         //总页数
         pages = Math.ceil(count / limit);   //上取整

         //取值不能超过pages
         page = Math.min(page,pages);
         //取值不能小于1
         page = Math.max(page, 1);

         var skip = (page - 1) * limit;
         
         User.find().limit(limit).skip(skip).then(function(users) {
            res.render('admin/user_index',{
                userInfo : req.userInfo,
                users: users,
                page : page,
                count: count,
                pages: pages,
                limit: limit,
            })
        })
     })
})

//分类首页
router.get('/category',function(req,res,next){
    // res.render('admin/category_index',{
    //     userInfo: req.userInfo
    // })

    var page = Number(req.query.page || 1);
     var limit = 10;
     var pages = 0;

     User.count().then(function(count){
         //总页数
         pages = Math.ceil(count / limit);   //上取整

         //取值不能超过pages
         page = Math.min(page,pages);
         //取值不能小于1
         page = Math.max(page, 1);

         var skip = (page - 1) * limit;
         
         Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(Categories) {
            res.render('admin/category_index',{
                userInfo : req.userInfo,
                Categories: Categories,

                page : page,
                count: count,
                pages: pages,
                limit: limit,
            })
        })
     })
})
// 分类添加
router.get('/category/add',function(req,res){
    res.render('admin/category_add',{
        userInfo: req.userInfo
    })
})

//分类保存
router.post('/category/add',function(req,res){
    var name = req.body.name || '';

    if(name == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '名称不能为空',
        })
    }

    Category.findOne({
        name: name
    }).then(function(res){
        if(res){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '分类已经存在了',
            })
            return Promise.reject();
        }else{
            return new Category({
                name: name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success',{
            userInfo: res.userInfo,
            message: '分类保存成功',
            url:'/admin/category'
        })
    })
})


// 分内修改
router.get('/category/edit',function(req,res){
    var id = req.query.id || '';
    console.log(id)
    //获取要修改信息
    Category.findOne({
        _id : id
    }).then(function(category) {
        console.log(category)
        if(!category) {
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '分类信息不存在'
            })
        } else {
            res.render('admin/category_edit',{
                userInfo: req.userInfo,
                category: category
            })
        }
    })
})

//分类保存

router.post('/category/edit',function(req,res){
    var id = req.query.id || '';
    var name  = req.body.name ||  '';

    Category.findOne({
        _id : id
    }).then(function(category) {
        console.log(category)
        if(!category) {
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '分类信息不存在'
            })
            return Promise.reject();
        } else {
           //要修改分类名称 
           if(name === category.nane){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '修改成功',
                url : '/admin/category'
            })
            return Promise.reject();
           } else {
              return  Category.findOne({
                   _id: {$ne:id},
                   name:name
               })
           }
        }
    }).then(function(sameCategory){
        if(sameCategory) {
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '数据库中已经存在同名分类'
            })
            return Promise.reject();
        }else{
            Category.update({
                _id : id
            },{
                name: name
            }).then(function(){
                res.render('admin/error',{
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url : '/admin/category'
                })
            })
        }
    })
})


//分类删除

router.get('/category/delete',function(req,res){

    var id = req.query.id || '';
    Category.remove({
        _id : id
    }).then(function(){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '删除成功',
            url : '/admin/category'
        })
    })
})




/*内容首页*/
router.get('/content',function(req,res){
    // res.render('admin/content_index',{
    //     userInfo : req.userInfo
    // })
    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    Content.count().then(function(count){
        //总页数
        pages = Math.ceil(count / limit);   //上取整

        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page - 1) * limit;
        
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).sort({addTime: -1}).then(function(contents) {
        //    console.log(contents)
            res.render('admin/content_index',{
               userInfo : req.userInfo,
               contents: contents,

               page : page,
               count: count,
               pages: pages,
               limit: limit,
           })
       })
    })
})


/*内容添加*/
router.get('/content/add',function(req,res){
    Category.find().sort({_id: 1}).then(function(categories){
        res.render('admin/content_add',{
            userInfo : req.userInfo,
            categories : categories,
        })
    })
})

//内容保存

router.post('/content/add',function(req,res){
    // console.log(req.body)

    if(req.body.category === ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'内容分类不为空',
        })
        return;
    }

    if(req.body.title === ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'内容标题不为空',
        })
        return;
    }

    // passs
    new Content({
        category : req.body.category,
        title : req.body.title,
        description : req.body.description,
        content : req.body.content,
        user: req.userInfo._id.toString(),
    }).save().then(function(rs){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message:'保存成功',
            url : '/admin/content'
        })
    });
})


//修改

router.get('/content/edit',function(req,res){
    var id = req.query.id || '';
    var categories = [];

    Category.find().sort({_id: 1}).then(function(res){

        categories = res;
       return Content.findOne({
                _id : id
            }).populate('category');
       
    }).then(function(content){
        // console.log(content)
        if(!content){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message:'内容不存在',
            })
            return Promise.reject();
        } else {
            res.render('admin/content_edit',{
                userInfo: req.userInfo,
                content: content,
                categories:categories
            })
        }
    })   
})


//保存

router.post('/content/edit',function(req,res){
    var id = req.query.id || '';

    if(req.body.category === ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'内容分类不为空',
        })
        return;
    }

    if(req.body.title === ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message:'内容标题不为空',
        })
        return;
    }

    // passs
   Content.update({
       _id : id
   },{
    category : req.body.category,
    title : req.body.title,
    description : req.body.description,
    content : req.body.content,
   }).then(function(){
    res.render('admin/error',{
        userInfo: req.userInfo,
        message:'内容保存成功',
        url:'/admin/content/edit?id='+id,
    })
   })

})


//delete

router.get('/content/delete',function(req,res){
    var id = req.query.id || '';
    Content.remove({
        _id:id
    }).then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message:'删除成功',
            url:'/admin/content'
        })
    })
})




module.exports = router;