/**
 * Created by wangyanyan on 2017/2/20.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("ContractorController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate','GateGuest',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate,GateGuest) {

            $scope.flowkey = "GateContractorInfoProcess";
            $scope.projects={};
            $scope.filedata = [];
            $scope.note={};
            $scope.bpmnloaded=false;
            var lang=window.localStorage.lang;
            var status=$routeParams.status;
            $scope.readEmployer=false;
            var formVariables = [];
            var historyVariable = [];
            var variablesMap = {};
            console.log("---start---");

            if(  $routeParams.employerId  &&  $routeParams.status=="N" && $routeParams.userid) {
              /*
                $scope.projects.EmployerId = $routeParams.employerId;
                $scope.projects.UserID = $routeParams.userid;
               */
                ConQuaService.ContractorQualification().get({"employerid":$routeParams.employerId}).$promise.then(function (res) {
                    if (res) {
                        console.log(res);
                        $scope.projects=res;
                        if($routeParams.userid != $scope.projects.UserID){
                            Notifications.addError({'status': 'error', 'message': "UserID is not the same"});
                            return;
                        }
                        if($scope.projects.EmployerId &&  $scope.projects.Status == "N") {
                            $scope.BusinessLicence = parseData($scope.projects.QualificationFiles||[], "BusinessLicence");
                            $scope.Cer2 = parseData($scope.projects.QualificationFiles||[], "Cer2");
                            $scope.Cer3 = parseData($scope.projects.QualificationFiles||[], "Cer3");
                            $scope.Cer4 = parseData($scope.projects.QualificationFiles||[], "Cer4");
                        }else{
                             Notifications.addError({'status': 'error', 'message': "Status is Error"});
                        }
                    }else{
                        Notifications.addError({'status': 'error', 'message': " Error"});
                    }
                }, function (errResponse) {
                    Notifications.addError({'status': 'error', 'message': errResponse});
                });

            }else if( $routeParams.employerId  && $routeParams.status=="Q" ){
                $scope.readEmployer=true;
                ConQuaService.ContractorQualification().get({employerid:$routeParams.employerId}).$promise.then(function (res) {
                    if (res) {
                        if (res.EmployerId && ( res.Status=="Q" || res.Status=="X")){
                            $scope.projects = res;
                            if (!$scope.projects.QualificationFiles) {
                                $scope.BusinessLicence = [];
                                $scope.Cer2 = [];
                                $scope.Cer3 = [];
                                $scope.Cer4 = [];
                            } else {
                                $scope.BusinessLicence = parseData($scope.projects.QualificationFiles||[], "BusinessLicence")||[];
                                $scope.Cer2 = parseData($scope.projects.QualificationFiles||[], "Cer2")||[];
                                $scope.Cer3 = parseData($scope.projects.QualificationFiles||[], "Cer3")||[];
                                $scope.Cer4 = parseData($scope.projects.QualificationFiles||[], "Cer4")||[];
                            }
                        }else{
                            Notifications.addError({'status': 'error', 'message': "it is not exsit; "});
                        }}
                }, function (errResponse) {
                    Notifications.addError({'status': 'error', 'message': errResponse});
                });

            }
            $scope.showPng = function () {
                if ($scope.bpmnloaded == true) {
                    $scope.bpmnloaded = false;
                } else {
                    $scope.bpmnloaded = true;
                }
            }
            $scope.key_login=function() {
                if($routeParams.status=="N") {
                    if ($scope.projects) {
                        if ($scope.projects.Employer) {
                            ConQuaService.ContractorQualification().get({employer: $scope.projects.Employer}).$promise.then(function (res) {
                                console.log(res);
                                showDetail(res);
                            }, function (errResponse) {
                                Notifications.addError({'status': 'error', 'message': errResponse});
                            });
                        }
                    }
                }
            }

          function showDetail(res){
                if (res) {
                    if (res.EmployerId && res.isvalid == 1 && res.Status != "N") {
                        Notifications.addError({'status': 'error', 'message': $scope.projects.Employer + "已经存在"});
                        $scope.projects = {};
                        return;
                    }
                    else if (res.EmployerId && res.Status == "N") {
                        $scope.projects = res;

                    } else if (res.isvalid == 0) {//无效,可以 新建
                        $scope.projects = res;
                        $scope.projects.EmployerId = "";
                    }
                    if ($scope.projects.QualificationFiles) {
                        $scope.BusinessLicence = parseData($scope.projects.QualificationFiles||[], "BusinessLicence")||[];
                        $scope.Cer2 = parseData($scope.projects.QualificationFiles||[], "Cer2")||[];
                        $scope.Cer3 = parseData($scope.projects.QualificationFiles||[], "Cer3")||[];
                        $scope.Cer4 = parseData($scope.projects.QualificationFiles||[], "Cer4")||[];
                    }
                    else {
                        console.log("file no ");
                        $scope.BusinessLicence =$scope.BusinessLicence|| [];
                        $scope.Cer2 = $scope.Cer2|| [];
                        $scope.Cer3 =$scope.Cer3|| [];
                        $scope.Cer4 = $scope.Cer4||[];
                    }

                } else {
                    console.log("noe");
                }
            }
            //附近的拆和 合并
            var parseData = function(data,filetype) {
                var arr=[];
                for(var i=0;i<data.length;i++) {
                    if(data[i].FileType==filetype){
                        arr.push(data[i]);
                    }
                }
                return arr;
            }


            var parseDataFile = function(data) {
                for(var i=0;i< data.length;i++) {
                    data[i].Files =data[i].Files;
                    data[i].JsonFile=JSON.stringify(data[i].Files);
                }

                return data;
            }

            //提交流程修改状态
            $scope.saveSumbit=function(){
                saveInfo("N",function(employerId,obj) {
                    if (obj && !employerId) {
                        Notifications.addError({'status': 'error', 'message': obj});
                    } else {
                        GateGuest.GetGateCheckers().getCheckers({
                            owner: Auth.username,
                            fLowKey: $scope.flowkey,
                            Kinds: "",
                            CheckDate:""
                        }).$promise.then(function (res) {
                                var leaderList = [];
                                for (var i = 0; i < res.length; i++) {
                                    leaderList[i] = res[i].Person;
                                }
                                if (leaderList.length <= 0) {
                                    Notifications.addError({'status': 'error', 'message': $translate.instant('Leader_NO_MSG')});
                                    return
                                } else {

                                    GateGuest.GetGateCheckerByKind("Contractor",function(reslen,errormsg) {
                                        if (errormsg) {
                                            Notifications.addError({'status': 'error', 'message': errormsg});
                                            return;
                                        } else {
                                            leaderList.push(reslen);
                                            console.log(leaderList);
                                            formVariables.push({name: "ChecherArray", value: leaderList});
                                            formVariables.push({name: "EmployerId", value: employerId});
                                            formVariables.push({name: "start_remark", value: $scope.projects.Remark});
                                            formVariables.push({name: "Employer", value: $scope.projects.Employer});
                                            historyVariable.push({name: "ConQua_Employer", value: $scope.projects.Employer});
                                            getFlowDefinitionId($scope.flowkey, function (FlowDefinitionId) {
                                                if (FlowDefinitionId) {
                                                    //  Notifications.addMessage({'status': 'information', 'message': "保存成功:"+ reportid });
                                                    startflowid(FlowDefinitionId, $scope.projects.EmployerId);
                                                } else {
                                                    Notifications.addError({'status': 'error', 'message': "Process definition error"});
                                                    return;
                                                }
                                            })
                                        }

                                    });

                                }
                        });

                    }
                })
            }
            function getFlowDefinitionId(keyname, callback) {
                EngineApi.getKeyId().getkey({
                    "key": keyname
                }, function (res) {
                    callback(res.id);
                });
            }
            function startflowid(definitionID, businessKey) {
                variablesMap = Forms.variablesToMap(formVariables)
                historyVariable = Forms.variablesToMap(historyVariable)
                var datafrom = {
                    formdata: variablesMap,
                    businessKey: businessKey,
                    historydata: historyVariable
                };
                console.log(datafrom);
                EngineApi.doStart().start({
                    "id": definitionID
                }, datafrom, function (res) {
                    console.log(res);
                    if (res.message) {
                        Notifications.addMessage({
                            'status': 'info',
                            'message': res.message
                        });
                        return;
                    }
                    if (!res.result) {
                        Notifications.addMessage({
                            'status': 'info',
                            'message': res.message
                        });
                    } else {

                        $location.url("/taskForm/"+res.url);

                    }
                })
            }

            function IsCanSave(callback){
                if($scope.readEmployer==true){
                    ConQuaService.ContractorQualification().get({employerid: $scope.projects.EmployerId}).$promise.then(function (statres) {
                        if (statres) {
                            if (statres.Status == "Q" || statres.Status == "X") {
                                callback("");
                                return;
                            }else{
                                callback("状态不对不能修改");
                            }
                        }else{
                            callback("没有这个承揽商");
                        }


                    }, function (errResponse) {
                        callback(errResponse);
                    })
                }else {
                    if ($scope.projects.EmployerId) {
                        ConQuaService.ContractorQualification().get({employerid: $scope.projects.EmployerId}).$promise.then(function (statres) {
                            if (statres) {
                                if (statres.Status != "N") {
                                    callback("this is  being signed");
                                    return;
                                }
                            }
                            callback("");

                        }, function (errResponse) {
                            callback(errResponse);
                        })
                    } else {
                        callback("");
                    }
                }
            }
            function saveInfo(Status,callback){
                IsCanSave(function(errmsg) {
                    if(errmsg){
                        callback("", errmsg);
                        return;
                    }else {
                        EngineApi.getMemberInfo().get({userid: Auth.username}).$promise.then(function (res) {
                            $scope.projects.UserID = Auth.username;
                            $scope.projects.DepartmentID = res.DepartmentID;
                            $scope.projects.Status = Status;//N:新建  F:提交审核  Q:审核通过
                            $scope.projects.isvalid = 1;
                            $scope.projects.QualificationFiles = [];
                            $scope.projects.AccDate = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
                            var arr = $scope.BusinessLicence;
                            arr = arr.concat($scope.Cer2);
                            arr = arr.concat($scope.Cer3);
                            arr = arr.concat($scope.Cer4);
                            $scope.projects.QualificationFiles = parseDataFile(arr);


                            ConQuaService.CreateContractorQualification().save($scope.projects).$promise.then(function (rese) {
                                $scope.projects.EmployerId = JSON.parse(rese.employerId).employerId;
                                //  alert( $scope.projects.EmployerId);
                                callback($scope.projects.EmployerId, "")

                            }, function (errResponse) {
                                // Notifications.addError({'status': 'error', 'message': errResponse});
                                callback("", errResponse);
                            });


                        }, function (errResponse) {
                            callback("",errResponse);
                        });
                    }
                })
            }
            $scope.save=function() {
                //新建承揽商
                saveInfo("N",function(employerId,obj) {
                    if (obj && !employerId) {
                        Notifications.addError({'status': 'error', 'message': obj});
                    } else {
                        Notifications.addMessage({'status': 'information', 'message': $translate.instant('saveSuccess')});

                    }

                })
            }

        }])
})
