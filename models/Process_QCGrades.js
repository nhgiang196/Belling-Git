var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;

var Process_QCGradesSchema=new Schema({

    ProcessInstanceId:String,
    activityId:String,
    ID:String

},{ collection: 'Process_QCGrades' });



module.exports = mongodb.mongoose.model("Process_QCGrades", Process_QCGradesSchema);
