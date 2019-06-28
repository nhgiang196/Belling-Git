/**
 * Created by wangyanyan on 2016-10-08.
 * 协同车辆
 */

var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;

var Process_FEPVJointTruckSchema=new Schema({

    ProcessInstanceId:String,
    activityName:String,
    activityId:String,
    VoucherID:String

},{ collection: 'Process_FEPVJointTruck' });



module.exports = mongodb.mongoose.model("Process_FEPVJointTruck", Process_FEPVJointTruckSchema);
