var mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({
    // 关联字段   ---分类信息的id
    category:{
         // 类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref : 'Category'
    },
    // 内容 名称
    title: String, 

    user:{
        // 类型
       type: mongoose.Schema.Types.ObjectId,
       //引用
       ref : 'User'
   },
   
   addTime:{
       type: Date,
       default : new Date()
   },

   //点击量
   views:{
       type : Number,
       default: 0
   },

    //简介
    description: {
        type: String,
        default:''
    },
    //内容
    content: {
        type: String,
        default:''
    },

    //评论
    comments:{
        type: Array,
        default: []
    }

})



























