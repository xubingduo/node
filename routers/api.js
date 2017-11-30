var express = require('express');
var router = express.Router();
var User = require('../models/User');

//统一返回格式
var responseData;
//初始化 返回信息格式
router.use(function(req,res,next){
    responseData = {
        code: 0,
        message: ''
    }
    next();
})

//用户注册
/**
 * 
 * 基本验证
 * 数据库验证
 * 
 * 
 */

router.post('/user/register',function(req,res,next){

    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    if( username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    if( password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    //两次密码是否一致
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }

    //用户名是否已经被注册了，如果数据库中存在和我们要注册的数据相同说明已注册了
    User.findOne({
        username: username
    }).then(function(userInfo) {
        //console.log(userInfo)
        if( userInfo ) {
            responseData.code = 4;
            responseData.message = '用户名已被注册';
            res.json( responseData );
            return;
        }
        //保存数据到数据库
        var user = new User({
            username: username,
            password : password
        });

        return user.save();
    }).then(function(newUserInfo){
        console.log(newUserInfo);
        responseData.message = '注册成功';
        res.json(responseData);
    })
})





router.post('/user/login',function(req,res) {
    var username = req.body.username;
    var password = req.body.password;

    if(username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名和密码不能为空';
        res.json( responseData );
        return;
    }

    //查询数据库
    User.findOne({
        username : username,
        password: password
    }).then(function(userInfo){
        console.log(userInfo)
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        responseData.message = '登录成功';
        responseData.userInfo ={
            _id: userInfo._id,
            username: userInfo.username,
        }
        //存储cookie
        req.cookies.set('userInfo',JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username,
        }));
        res.json(responseData);
        return;
    })
})


router.get('/user/logout',function(req,res){
    req.cookies.set('userInfo', null);
    res.json(responseData);
})


module.exports = router;








