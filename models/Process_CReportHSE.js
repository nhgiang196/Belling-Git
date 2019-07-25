var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;

var Process_CReportHSESchema=new Schema({

    ProcessInstanceId:String,
    activityId:String,
    initiator:String,
    ID:String

},{ collection: 'Process_CReportHSE' });



module.exports = mongodb.mongoose.model("Process_CReportHSE", Process_CReportHSESchema);
