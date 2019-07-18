/**
 * Created by wangyanyan on 2016-09-18.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;

var Process_FEPVUnJointTruckSchema=new Schema({

    ProcessInstanceId:String,
    activityId:String,
    VoucherID:String

},{ collection: 'Process_FEPVUnJointTruck' });



module.exports = mongodb.mongoose.model("Process_FEPVUnJointTruck", Process_FEPVUnJointTruckSchema);
