var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;

var Process_QCOverGradeSchema=new Schema({

    ProcessInstanceId:String,
    activityId:String,
    initiator:String,
    ID:String

},{ collection: 'Process_QCOverGrade' });



module.exports = mongodb.mongoose.model("Process_QCOverGrade", Process_QCOverGradeSchema);
