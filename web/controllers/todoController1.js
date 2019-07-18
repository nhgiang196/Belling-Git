/**
 * Created by wangyanyan on 14-3-6.
 * 任务列表，代理任务，重要任务的区别
 */
define( ['myapp','angular','bpmn'],function(myapp,angular,Bpmn){
    myapp.controller("todoController",['$scope','$http','$compile','$routeParams','$resource','$location','Forms','EngineApi','User','Notifications','$q',
        function($scope,$http,$compile,$routeParams,$resource,$location,Forms,EngineApi,User,Notifications,$q){


   /*     $scope.showPng=function(flowid,taskid,taskDefinitionKey){
            $scope.bpmn = { };



                EngineApi.getProcessDefinitions().xml({ id : flowid },function (result) {
                    var diagram = $scope.bpmn.diagram,
                        xml = result.bpmn20Xml;
                    if (diagram) {
                        diagram.clear();
                    }
                    var width = $('#diagram').width();
                    var height = $('#diagram').height();

                    diagram = new Bpmn().render(xml, {
                        diagramElement : 'diagram',
                        width: width,
                        height: 400
                    });
                    console.log(taskDefinitionKey);
                    diagram.annotation(taskDefinitionKey).addClasses([ 'bpmn-highlight' ]);
                    $scope.bpmn.diagram = diagram;

                });

        }*/
        function loadData(callback){
            var toDoList = $scope.toDoList = {};
            var pdList = $scope.pdList = {};
            var keyList = $scope.keyList = new Array();

           /* var queryObject = {}
            console.log(User);
            //   Auth.username="041026";
            queryObject.assignee=User;
            queryObject.sortBy = "created";
            queryObject.sortOrder = "desc";*/
            //  queryObject.candidateUser = Auth.username;
            // queryObject.candidateGroup = "anhuan";
            //候选的用户任务也包含
            var ProxyUserList =  function(le_list){
                var newResult = [];
                for (var a = 0; a < le_list.length; a++) {
                    var proxytask = le_list[a];
                    proxytask["tasktype"] = "proxyuser";
                    newResult.push(proxytask);
                }
                return newResult;
            }
            var CaProxyUserList =  function(le_list){
                var newResult = [];
                for (var a = 0; a < le_list.length; a++) {
                    var proxytask = le_list[a];
                    proxytask["tasktype"] = "caproxyuser";
                    newResult.push(proxytask);
                }
                return newResult;
            }

            var UserList=  function(list){
                var newResult = [];
                for (var i = 0; i < list.length; i++) {
                    var usertask=  list[i];
                    usertask["tasktype"] = "usertask";
                    newResult.push(usertask);
                }
                return newResult;
            }


        function fetchgetProxyList(questions){


            var promises = questions.map(function(question) {
                console.log("get ca proxy user:"+question.UserId+" "+question.Name);
                return $http({
                    url   : '/bpm/api/default/bpm-rest-api/task',
                    method: 'GET',
                    data  : {"assignee":question.UserId,"processDefinitionKey":question.Name,"sortBy":"created","sortOrder":"desc"}
                });

            });
            console.log("ca proxy  all");
            return $q.all(promises);

              /*  var promises = [];

                for(var i = 0 ; i < questions.length ; i++) {

                    var deffered = $q.defer();
                    var question = questions[i];
                    console.log("get proxy user:"+question.UserId+" "+question.Name);
                    EngineApi.getTasks().query({"assignee": question.UserId, "processDefinitionKey": question.Name, "sortBy": "created", "sortOrder": "desc"}).$promise.then(function (le_list) {
                        if (le_list.length > 0) {
                            console.log("done proxy user:");
                            console.log(le_list);
                            var list = ProxyUserList(le_list);
                            promises.concat(list);
                            deffered.resolve(list);
                        }

                    }, function (errResponse) {
                        deffered.reject();
                    });
                    promises.push(deffered);
                }
                console.log("proxy  all");
                    return $q.all(promises);*/


            }
            function cafetchgetProxyList(promises,questions){

                var promises = questions.map(function(question) {
                    console.log("get ca proxy user:"+question.UserId+" "+question.Name);
                    return $http({
                        url   : '/bpm/api/default/bpm-rest-api/task',
                        method: 'GET',
                        data  : {"candidateUser":question.UserId,"processDefinitionKey":question.Name,"sortBy":"created","sortOrder":"desc"}
                    });

                });
                console.log("ca proxy  all");
                return $q.all(promises);
              /*  for(var i = 0 ; i < questions.length ; i++) {

                    var deffered = $q.defer();
                    var question = questions[i];
                    console.log("get ca proxy user:"+question.UserId+" "+question.Name);
                    EngineApi.getTasks().query().$promise.then(function(le_list) {
                        if (le_list.length > 0) {
                            console.log("done  ca proxy user:");
                            console.log(le_list);
                            var list = CaProxyUserList(le_list);
                            promises.concat(list);
                            deffered.resolve(list);
                        }

                    }, function (errResponse) {
                        deffered.reject();
                    });
                    promises.push(deffered);
                }
                console.log("ca proxy  all");
                return $q.all(promises);*/


            }


          /*  function cafetchgetProxyList(promises,f,callback) {
                console.log("ca proxy list");
                var promises=promises;
                f.forEach( function(data){
                    console.log("get  ca  user:"+data.UserId+" "+data.Name);
                    EngineApi.getTasks().query({"candidateUser":data.UserId,"processDefinitionKey":data.Name,"sortBy":"created","sortOrder":"desc"}).$promise.then(function(le_list) {
                        if(le_list.length>0) {
                            console.log("done ca user:");
                            console.log(le_list);
                            var list = CaProxyUserList(le_list);
                            promises.concat(list)
                        }
                    }, function(errResponse) {
                        callback("",errResponse);
                    });

                });
                //consolidate promises
                var finalDataPromise = $q.all(promises);
                console.log("ca proxy  all");
                callback( finalDataPromise,null);
            };
*/

            EngineApi.getProxyUser().get({'userid':User}).$promise.then(function (leavers) {
                console.log(leavers);
                if(leavers.length>0) {

                    var promise = cafetchgetProxyList([],leavers);
                    promise.then(function(greeting) {
                        alert('Success: ' );
                        var grepromises = [];

                        var promises = greeting.map(function(gren) {
                         //   grepromises.concat(gren.data) ;
                            console.log(gren.data.length);
                          var  newarray=    ProxyUserList(gren.data)
                            grepromises= grepromises.concat(newarray);
                        });


                        var promise = fetchgetProxyList(leavers);
                        promise.then(function(proxydata) {
                            alert('Success: ' );
                            var promises = proxydata.map(function(grenp) {
                                var  newarray=    ProxyUserList(grenp.data)
                                console.log(grenp.data.length);
                                grepromises= grepromises.concat(newarray) ;

                            });

                            console.log(grepromises);

                        }, function(proreason) {
                            alert('Failed: ' );
                            console.log(proreason);
                        });


                    }, function(reason) {
                        alert('Failed: ' );
                        console.log(reason);
                    });

            /*       fetchgetProxyList(leavers,function(result,msg){
                        if(msg){
                            Notifications.addError({
                                'status': 'error',
                                'message': msg
                            });
                        }else{
                            cafetchgetProxyList(result,leavers, function(caresult,msg){
                                if(msg){
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': msg
                                    });
                                }else{
                                    TaskQuery(caresult)
                                  *//*  EngineApi.getTasks().query({"assignee":User,"sortBy":"created","sortOrder":"desc"}).$promise.then(function(list) {

                                        caresult.concat( UserList(list));
                                        EngineApi.getTasks().query({'candidateUser':User}).$promise.then(function(candilist) {
                                            caresult.concat( UserList(candilist));
                                            TaskQuery(caresult)
                                        });
                                    });*//*
                                }
                            });
                        }

                    })


*/


                }
                  else{
                    var tasklist=new Array();
                    EngineApi.getTasks().query({"assignee":User,"sortBy":"created","sortOrder":"desc"}).$promise.then(function(list) {
                        tasklist=list;
                        EngineApi.getTasks().query({'candidateUser':User}).$promise.then(function(candilist) {
                            for (var i = 0; i < candilist.length; i++) {
                                tasklist.push(candilist[i]);
                            }
                            console.log(tasklist);
                            TaskQuery(tasklist)
                        });
                    });
                }
            })

            var mainCount,commonCount=0

         //   EngineApi.getTasks().query(queryObject).$promise.then(function(list) {
            function TaskQuery(list){
                callback(list.length);
                console.log(list.length);
                //得到key
                $.each(list, function(i, value) {
                   if( value.priority>50){
                       mainCount=mainCount+1;
                    }else {
                       commonCount=commonCount+1;
                    }
                    var key=list[i].processDefinitionKey = value.processDefinitionId.substring(0,value.processDefinitionId.indexOf(':'));
                    if($.inArray(list[i].processDefinitionKey,keyList)==-1){
                        keyList.push(list[i].processDefinitionKey);
                        toDoList[list[i].processDefinitionKey] = new Array();
                        toDoList[list[i].processDefinitionKey].push(list[i]);
                        getProcessName(key,function(data){
                            pdList[list[i].processDefinitionKey]=data;
                        });
                    }
                    else{
                        toDoList[list[i].processDefinitionKey].push(list[i]);
                    };
                });
                console.log(toDoList);
                toDoList = sortTodoList(toDoList);
                $scope.mainCount=mainCount;
                $scope.commonCount=commonCount;
            };
            //{assignee:user.userName}
            /*
            EngineApi.getTasks().getList({sortBy:'created',sortOrder:'desc'},function(list){
                callback(list.length);
                console.log(list.length);
                //得到key
                $.each(list, function(i, value) {

                    list[i].processDefinitionKey = value.processDefinitionId.substring(0,value.processDefinitionId.indexOf(':'));

                    if($.inArray(list[i].processDefinitionKey,keyList)==-1){
                        keyList.push(list[i].processDefinitionKey);

                        toDoList[list[i].processDefinitionKey] = new Array();
                        EngineApi.getProcessDefinitions().getList({key:list[i].processDefinitionKey,sortBy:'version',sortOrder:'desc'},function(data){
                            if(data.length>0)
                            {
                                toDoList[list[i].processDefinitionKey].push(list[i]);
                                pdList[list[i].processDefinitionKey] = data[0];
                            }
                        });
                    }
                    else{
                        toDoList[list[i].processDefinitionKey].push(list[i]);
                    };
                });
            });
         */
        };
        function sortTodoList(todoList) {
            for(var i in todoList) {
                todoList[i] = quickSort(todoList[i]);
            }
            return todoList;
        }

        var quickSort = function(arr) {
            if (arr.length <= 1) { return arr; }
            var pivotIndex = Math.floor(arr.length / 2);
            var pivot = arr.splice(pivotIndex, 1)[0];
            var left = [];
            var right = [];
            for (var i = 0; i < arr.length; i++){
                if (arr[i].created > pivot.created) {
                    left.push(arr[i]);}
                else {
                    right.push(arr[i]);
                }
            }
            return quickSort(left).concat([pivot], quickSort(right));
        };

        function getProcessName(key,callback){

            EngineApi.getProcessDefinitions().getDefinitionName({id:"key",operation:key}).$promise.then(function(data) {
                callback( data);
            })
          /*  EngineApi.getProcessDefinitions().getList({key:key}).$promise.then(function(data) {
                callback( data[0]);
            });*/
        }
        loadData( function(){
            loadData(function(counter){
                $scope.counter=counter;
            })
        });


        $scope.loadData = function(){
            loadData(function(counter){
                $scope.counter=counter;
            });
        };
        //是否按照重要性显示
        $scope.isShow=false;
        $scope.show=function(type){
            if(type==="main"){
                $scope.isShow=true;
            }else{
                $scope.isShow=false;
            }
        $("#nav-menu").children("li").removeClass("active");
            $(this).parent('li').addClass("active");
        }
/*
        var myList=[];
        EngineApi.getTasks().getList(function(list){
            $.each(list, function(i, value) {
               console.log(value);
               //  console.log(value.created);
               // toDoList["id"]=value.id;
                //toDoList["created"]=value.created;
                 myList.push({"id":value.id,"date":value.created,"name":value.name,processInstanceId:value.processInstanceId});
            });
            $scope.toDoList=myList;
            $scope.count=myList.length;
           console.log(myList);
        });
        */
    }]);
});