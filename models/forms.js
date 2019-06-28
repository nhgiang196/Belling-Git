

/**
 * Created by wangyanyan on 14-1-16.
 * 所有表单的日志信息
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;


//form 日志
var FormsSchema=new Schema({
    key:String,
    processDefinitionId:String,
    name:String,
    processInstanceId:String,//
    executionId:String,//
    taskid:String,//
    keyname:String,
    description:String,
    taskDefinitionKey:String,
    username:String, //
    sync: { type: Date, default: Date.now },
    ip:String,
    variable:String,
    historyField:Array
});


module.exports = mongodb.mongoose.model("Forms", FormsSchema);