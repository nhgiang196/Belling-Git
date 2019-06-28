/**
 * Created by wangyanyan on 2015-05-08.
 */
var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;
//稽查地点
var ProcessContactcardSchema=new Schema({

    ProcessInstanceId:String,
    activityName:String,
    Code:String

},{ collection: 'Process_Contactcard' });



module.exports = mongodb.mongoose.model("Process_Contactcard", ProcessContactcardSchema);