/**
 * Created by wangyanyan on 2015-02-06.
 */
/**
 * Created by wangyanyan on 2015-02-05.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;


//稽查项目
var process_GateContractorInfoProcessSchema=new Schema({
    _id:Schema.Types.ObjectId,
    ProcessInstanceId:String,
    activityName:String,
    activityId:String,
    EmployerId:String,
    initiator:String

},{ collection: 'Process_GateContractorInfoProcess' });


module.exports = mongodb.mongoose.model("Process_GateContractorInfoProcess", process_GateContractorInfoProcessSchema);