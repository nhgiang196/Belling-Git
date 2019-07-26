/**
 * Created by Just1n on 2014/6/17.
 */

var mongodb = require('./db');
var  Schema=mongodb.mongoose.Schema;


//属性
var ContractorSchema=new Schema({
    ID:String,//承揽商ID
    Name:String,//承揽商名称
    Type:String,//类型
    Category:String,//分类
    Remark:String//备注
});

var RuleSchema = new Schema({
    Type:String,//类型
    Attr:String,//属性
    Title:String,//标题
    No:String,//编号
    Content:String,//内容
    Fine:String,//罚款
    Remark:String//备注
},{ collection: 'evaluationrules4outer' });

exports.Contractor = mongodb.mongoose.model("contractors", ContractorSchema);
exports.Rule = mongodb.mongoose.model("evaluationrules4outer",RuleSchema);