/**
 * Created by wangyanyan on 2016-09-18.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;

var Process_GateBlackListSchema=new Schema({

    ProcessInstanceId:String,
    activityName:String,
    VoucherID:String

},{ collection: 'Process_GateBlackList' });



module.exports = mongodb.mongoose.model("Process_GateBlackList", Process_GateBlackListSchema);