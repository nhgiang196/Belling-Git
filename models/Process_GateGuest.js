/**
 * Created by wang.chen on 2016/11/11.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;

var Process_FEPVGateGuestSchema=new Schema({

    ProcessInstanceId:String,
    activityName:String,
    VoucherID:String

},{ collection: 'Process_FEPVGateGuest' });



module.exports = mongodb.mongoose.model("Process_FEPVGateGuest", Process_FEPVGateGuestSchema);
