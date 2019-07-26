/**
 * Created by wangyanyan on 2015-02-06.
 */
/**
 * Created by wangyanyan on 2015-02-05.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;


//稽查项目
var process_ContractorInspectProcessSchema=new Schema({
    _id:Schema.Types.ObjectId,
    ProcessInstanceId:String,
    activityName:String,
    activityId:String,
    eventStart_ruletype:String,//类型
    eventStart_ruleattr:String,//属性
    eventStart_ruletitle:String,//类别
    eventStart_rulecontent:String,//事由
    eventStart_Remark:String,//问题描述
    eventStart_contractor:String,//承揽商
    eventStart_deduction:{ type: Number, default: 0 },
    eventStart_fine:{ type: Number, default: 0 },


    eventStart_keshi_id:String, //
    eventStart_keshi:String, //科室、管理单位
    eventStart_date: String//{ type: Date, default: Date.now }

},{ collection: 'Process_ContractorInspectProcess' });


module.exports = mongodb.mongoose.model("Process_ContractorInspectProcess", process_ContractorInspectProcessSchema);