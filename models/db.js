var mongoose= require('mongoose');
var log = require('log4js').getLogger("db");
/*var options = {
    db: 'mes',
    server: { poolSize: 50 },
    user: 'root',
    pass: '123456'
}*/
//mongoose.connect("mongodb://root:123456@10.17.255.9:27017/test");
// mongoose.connect("mongodb://root:123456@10.17.255.9:27017/mes" ,{auth:{authdb:"admin"}});
var options = { server: { socketOptions: { keepAlive: 500000, connectTimeoutMS: 50000 } },replset: { socketOptions: { keepAlive: 500000, connectTimeoutMS : 80000 } } };
//28.39
mongoose.connect('mongodb://10.20.46.23:27017/MES',options, function(err) {
    if (err) {

        log.error(err);
       console.log("mongodb connect");
        console.log(err);
        return err;
    }
});

exports.mongoose = mongoose;