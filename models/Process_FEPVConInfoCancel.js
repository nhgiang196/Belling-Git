/**
 * Created by wangyanyan on 2017/3/16.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;


//属性
var Process_FEPVConInfoCancelSchema=new Schema({
    ProcessInstanceId:String,
    activityName:String,
    activityId:String,
    EmployerId:String,
    initiator:String
},{ collection: 'Process_FEPVConInfoCancel' });


module.exports = mongodb.mongoose.model("Process_FEPVConInfoCancel", Process_FEPVConInfoCancelSchema);