/**
 * Created by wangyanyan on 2016-08-03.
 * 访问的日志，设置权限
 */
    var mongodb = require('./db');
    var Schema = mongodb.mongoose.Schema;
    var RepLogSchema = new Schema({
        URL: String,
        UserID: String,
        PathName:String,
        Action: String,
        IP: String,
        B: String,//
        E: String,//
        Paramenters: String,//
        Result: String,
        Extra: String

    });
    module.exports = mongodb.mongoose.model("RepLog", RepLogSchema);

