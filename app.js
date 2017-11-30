var express = require('express');
//加载模板
var swig = require('swig');
//加载数据库模块
var mongoose = require('mongoose');
//加载body-parser,用来处理post提交过来的数据
var bodyParser = require('body-parser');
//加载cookie模块
var cookies = require('cookies');

var app = express();
var User = require('./models/User');


//静态文件托管
//当用户访问过以public开始 那么直接返回对应的————dirname+'/public'
app.use('/public',express.static(__dirname+'/public'));



//配置模板应用
//定义当前应用所用的模板引擎
app.engine('html',swig.renderFile);
//设置模板文件存放的目录
app.set('views','./views');
//注册使用模板
app.set('view engine','html');
//开发取消缓存
swig.setDefaults({cache: false});

//bodyparser 设置
app.use( bodyParser.urlencoded({extended: true}));

//cookies设置  保存到对象 request对象中
app.use( function(req, res, next){
    req.cookies = new cookies( req , res);
    // console.log(req.cookies.get('userInfo'));

    // 解析登录信息
    req.userInfo = {};
    if( req.cookies.get('userInfo') ){
        try {
            req.userInfo = JSON.parse( req.cookies.get('userInfo'))
            //获取当前用户类型
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        } catch (e) {
            console.log(e)
            next();
        }
    }else {
        next();
    }
} )


//根据不同的功能划分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));




//监听http请求
//开启数据库
mongoose.connect('mongodb://localhost:27017/blog',function(err){
    if(err){
        console.log('数据库连接失败')
    }else {
        console.log('数据库连接成功')
        app.listen(8081,function(){
            console.log('loacalhost  8081')
        });
    }
});
