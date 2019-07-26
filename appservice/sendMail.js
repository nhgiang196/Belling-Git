/**
 * Created by wangyanyan on 2015-07-27.
 */

var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodemailer.createTransport(smtpTransport({
    host: 'email.feg.cn',
    port: 25,
    tls: {rejectUnauthorized: false}
}));
module.exports = function(app,request,config,logs,express,http) {



    app.get('/ehs/moc/mail',function(req,res){
        var List=[];
        getWfList(function(wflist){
            if(wflist) {
                asyncLoop(wflist.length, function (loop) {
                    // log the iteration
                    var wf = wflist[loop.iteration()];
                    GetTaskList(wf.processDefinitionId, wf.taskDefinitionKey, function (tasklist) {
                        if (tasklist) {
                            asyncLoop(tasklist.length, function (taskloop) {
                                    var task = tasklist[taskloop.iteration()];
                                    //  console.log(task);
                                    var date1 = new Date(task.created.replace('T', ' '));
                                    var date2 = new Date();    //结束时间
                                    var date3 = date2.getTime() - date1.getTime();
                                    var leave1 = date3 / (24 * 3600*1000);
                                    if (leave1 > 0.25) {
                                        console.log(leave1);
                                        //send mail
                                        GetSendTo(task.id, function (to) {
                                            if (to) {
                                                var sendmail={};
                                                sendmail.to=to;
                                                sendmail.name=task.name || "";
                                                sendmail.description=task.description|| "";
                                                List.push(sendmail)
                                                taskloop.next();
                                                /*  sendMail(to, task.name || "", task.description+to || "", function (mail) {
                                                 taskloop.next();
                                                 })*/
                                            } else {
                                                taskloop.next();
                                            }
                                        })
                                    } else {
                                        taskloop.next();
                                    }
                                },
                                function () {
                                    console.log(wf.processDefinitionId + "  " + wf.taskDefinitionKey + "循环工作任务完成");
                                    loop.next();
                                }
                            )
                        }else{
                            loop.next();
                        }
                    })
                },  function () {
                    console.log("END");
                    // console.log(List);
                    SendMailByUser(List,function(){
                        res.send(200)
                    })

                })
            }
            res.send(200)
        })
    })

    function  GetTaskList(definId,taskDefinitionKey,callback){
        //   console.log(definId +" "+taskDefinitionKey);
        var url = config.bpmrest+"task?processDefinitionId="+definId+"&taskDefinitionKey="+taskDefinitionKey;
        request({ method: 'GET' , uri:url }
            , function (error, response, body) {
                if(!error){
                    callback(JSON.parse(body));
                }else{
                    callback(null);
                }
            });
    }
    //得到需要发邮件的流程节点
    function getWfList(callback){
        var url = config.form+"SendMailList.json";
        var wflist=[];
        console.log(url);
        request({ method: 'GET' , uri:url }
            , function (error, response, body) {
                if(error){
                    wflist=[];
                }else{
                    wflist=JSON.parse(body);
                }
                callback(wflist);
            });
    }
    function GetTaskCandidates(taskid,callback){

        var url = config.bpmrest+"task/"+taskid+"/identity-links";
        //  console.log(url);
        request({ method: 'GET' , uri:url }
            , function (error, response, body) {
                if(error){
                    callback(null);
                }else{
                    callback(JSON.parse(body));
                }
            });
    }
    function GetUserMail(userid,callback){
        console.log(userid);
        var url = config.hrrest + 'api/HSSE/GetEmployeeInfo/' + userid;
        request(
            { method: 'GET', uri: url
            }
            , function (error, response, body) {
                if (!error) {
                    callback(JSON.parse(body));
                }else{
                    callback(null);
                }
            });
    }
    function GetSendTo(taskid,callback){
        var to="";
        GetTaskCandidates(taskid,function(Candidates){
            //    console.log(Candidates)
            if(Candidates) {
                asyncLoop(Candidates.length, function (loop) {
                        GetUserMail(Candidates[loop.iteration()].userId, function (email) {
                            if (email) {
                                to = to + "," + email.Email;
                            }
                            loop.next();
                        })
                    },
                    function () {
                        // console.log('getCandidates:' + to);
                        callback(to);
                    }
                );
            }else{
                callback(to);
            }
        })

    }


    function  SendMailByUser(list,callback){
        var newlist=[];
        var toDoList={};
        for (var a = 0, len = list.length; a < len; a++){
            var key=list[a];
            if (newlist.indexOf(key.to)=== -1) {
                newlist.push(key.to);
                toDoList[key.to] = new Array();
                toDoList[key.to].push(key);
            } else {
                toDoList[key.to].push(key);
            }
        }

        asyncLoop(newlist.length, function (loop) {
                var key=newlist[loop.iteration()];
                sendMaillist(key,toDoList[key],function(){
                    loop.next();
                })
            },  function () {
                callback()
            }
        )

    }
    function sendMaillist(to,list,callback){
        var str="";
        for(var key in list) {
            str=str+  '<div style="margin-left: 15px">任务：'+list[key].name+'</div><div>'+list[key].description+'</div>'
        }
        console.log(to.split(',').length);
        var isremark="";
        if(to.split(',').length>2){
            isremark='<br><div style="color: red">备注:'+to+'多人候选人,只需要一个签核就可以!</div>';
        }
        transporter.sendMail({
            from: 'MS-FEIS@feg.cn',
            to:to  ,//",wang.yanyan@feg.cn",
            subject:"您有一个急需签核的任务",
            html: ' <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <title>Demystifying Email Design</title>'+
                '<style>'+
                ' body { font-family: "Hiragino Sans GB","微软雅黑"; }  </style> </head> <body style="margin: 0; padding: 0;"><div>Hello! </div>'+
                '<div style="margin: 15px">  您有签核任务需要及时的处理，请登录<a href="ehs.feg.cn">MS-Feis 系统</a>(ehs.feg.cn)</div>'+
                str
                +isremark+'<br><br><footer> <div>Best Regards</div> <p><strong><a href="apps.feg.cn">FEIT</a></strong>  © 远纺 星火 <p>TEL: <strong><a href="mailto:liu.juan@feg.cn">431-2106</a></strong></p></footer>'+
                ' </body></html>'

        }, function (error, info) {
            if (error) {
                callback(500)
            }else {
                callback(200)
            }
            //   console.log('Message sent: ' + info.response);
        });
    }
    function asyncLoop(iterations, func, callback) {
        var index = 0;
        var done = false;
        var loop = {
            next: function() {
                if (done) {
                    return;
                }
                if (index < iterations) {
                    index++;
                    func(loop);

                } else {
                    done = true;
                    callback();
                }
            },

            iteration: function() {
                return index - 1;
            },

            break: function() {
                done = true;
                callback();
            }
        };
        loop.next();
        return loop;
    }

    function sendMail(to,subject,remark,callback){
        transporter.sendMail({
            from: 'MS-FEIS@feg.cn',
            to:to,
            subject:subject,
            html: ' <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <title>Demystifying Email Design</title>'+
                '<style>'+
                ' body { font-family: "Hiragino Sans GB","微软雅黑"; }  </style> </head> <body style="margin: 0; padding: 0;"><div> Hello! </div>'+
                '<div style="margin: 15px">  <a href="ehs.feg.cn">MS-Feis 系统</a>(ehs.feg.cn)</div>'+
                '<div style="margin-left: 15px">任务：'+remark+'</div><br><br>' +
                '<footer> <div>Best Regards</div>' +
                ' <p><strong><a href="apps.feg.cn">FEIT</a></strong>  © 远纺 星火 <p>TEL: <strong><a href="mailto:liu.juan@feg.cn">431-2106</a></strong></p></footer>'+
                ' </body></html>'

        }, function (error, info) {
            if (error) {

                logs.logger.error(error);
                callback(500)
            }else {
                callback(200)
            }
            //   console.log('Message sent: ' + info.response);
        });
    }



    app.post('/ehs/moc/MailSend',express.bodyParser(),function(req,res) {
        var to=req.body.to;
        var subject=req.body.subject;
        var remark=req.body.remark;
        sendMail(to,subject,remark,function(result){
            res.send(result)
        })
    });
}



