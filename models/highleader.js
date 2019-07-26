/**
 * Created by GaoGuangCai on 14-5-30.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;

//==================================================================================
//工安 --- 属性
//==================================================================================
var HighLeaderSchema=new Schema({
    Id:String,//编号
    Name:String,//name
    Spec:String,//属性
    Remark:String//描述


})
module.exports = mongodb.mongoose.model("HighLeader", HighLeaderSchema);