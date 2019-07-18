/**
 * Created by wangyanyan on 2015-08-27.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;


//属性
var Process_ContractorQuaProcessSchema=new Schema({
    ProcessInstanceId:String,
    activityName:String,
    activityId:String,
    eventStart_Employer:String,
    eventStart_IdCard:String,
    eventStart_Name:String,
    eventStart_ValidTo:String,
    initiator:String
},{ collection: 'Process_GateContractorQuaProcess' });


module.exports = mongodb.mongoose.model("Process_GateContractorQuaProcess", Process_ContractorQuaProcessSchema);