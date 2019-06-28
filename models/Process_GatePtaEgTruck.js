/**
 * Created by wangyanyan on 2016-09-18.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;

var Process_FEPVPtaEgTruckSchema=new Schema({

    ProcessInstanceId:String,
    activityId:String,
    VoucherID:String

},{ collection: 'Process_FEPVPtaEgTruck' });



module.exports = mongodb.mongoose.model("Process_FEPVPtaEgTruck", Process_FEPVPtaEgTruckSchema);