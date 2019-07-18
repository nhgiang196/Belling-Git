/**
 * Created by wangyanyan on 2014/10/15.
 */
/**
 * Created by GaoGuangCai on 14-8-14.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;


//稽查项目
var FileSchema=new Schema({
    TaskId:String,
    Index:String,
    cdt: { type: Date, default: Date.now },
    Files:Array
})


module.exports = mongodb.mongoose.model("Files", FileSchema);