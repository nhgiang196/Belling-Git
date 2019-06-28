/**
 * Created by wang.chen on 2017/2/24.
 */


define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("ContractorQuaUpdateController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate','GateGuest',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate,GateGuest) {
            var lang = window.localStorage.lang;
            var query = {};
            query.Language = window.localStorage.lang;
            query.employer = "";
            query.cType = "";
            query.departmentID = "";
            $scope.importButton="hide";
            ConQuaService.GetContractorQualification().get(query).$promise.then(function (res) {
                $scope.EmployerList = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            if($routeParams.EmployerId  &&  $routeParams.IdCard) {
                ConQuaService.GetContractor().get({
                    idCard: $routeParams.IdCard,
                    EmployerId: $routeParams.EmployerId || "",
                    Language: window.localStorage.lang || ""
                }).$promise.then(function (data) {
                        if (data.length != 0) {
                            if(data[0].Status=="I"){
                                $scope.importButton="show";
                            }else{
                                $scope.importButton="hide";
                            }
                            $scope.event.Name = data[0].Name;
                            $scope.event.IdCard = $routeParams.IdCard;
                            $scope.event.Employer = $routeParams.EmployerId
                            $scope.event.Phone = data[0].Phone;
                            $scope.event.Remark = data[0].Remark;
                            $scope.TrainDate = data[0].TrainDate;
                            if (data[0].ValidTo !== "0001-01-01T00:00:00") {
                                $scope.event.ValidTo = $filter('date')(data[0].ValidTo, 'yyyy-MM-dd');
                            }
                            $scope.cers = data[0].Certificates||[];
                            $scope.inss = data[0].Insurances||[];
                            //这个单据在流程中，不能重新启动
                            $scope.isCanSave = data[0].IsUpdate;
                            if (data[0].TTValidTo <= myDate.toLocaleString()) {
                                $scope.event.TrainTime = data[0].TrainTime;
                                $scope.event.TTValidTo = $filter('date')(data[0].TTValidTo, 'yyyy-MM-dd');
                                $scope.trainFile = JSON.parse(data[0].TTFile);
                            }

                            if (data[0].MIValidTo <= myDate.toLocaleString()) {
                                $scope.event.MedicalInspection = data[0].MedicalInspection;
                                $scope.event.MIValidTo = $filter('date')(data[0].MIValidTo, 'yyyy-MM-dd');
                                $scope.healthFile = JSON.parse(data[0].MIFile);
                            }

                        }
                    })
            }
            var formVariables = [];
            var historyVariable = [];
            var variablesMap = {};
            $scope.bpmnloaded = false;
            $scope.note = {};
            $scope.filedata = [];
            $scope.cers = [];
            $scope.inss = [];
            $scope.IsUpdate = false;
            $scope.trainFile = [];
            $scope.healthFile = [];
            $scope.event = {};
            $scope.flowkey = "GateContractorQuaProcess";
            $scope.$watch("event.IdCard", function (n) {
                if (n !== undefined && $scope.event.Employer !== null) {
                    ConQuaService.GetContractor().get({
                        idCard: n,
                        EmployerId: $scope.event.Employer || "",
                        Language: window.localStorage.lang || ""
                    }).$promise.then(function (data) {
                            if (data.length != 0) {
                                if(data[0].Status=="I"){
                                    $scope.importButton="show";
                                }else{
                                    $scope.importButton="hide";
                                }
                                $scope.event.Name = data[0].Name;
                                $scope.event.Phone = data[0].Phone;
                                $scope.event.Remark = data[0].Remark;
                                $scope.TrainDate = data[0].TrainDate;
                                if (data[0].ValidTo !== "0001-01-01T00:00:00") {
                                    $scope.event.ValidTo = $filter('date')(data[0].ValidTo, 'yyyy-MM-dd');
                                }
                                $scope.cers = data[0].Certificates||[];
                                $scope.inss = data[0].Insurances||[];
                                //这个单据在流程中，不能重新启动
                                $scope.isCanSave = data[0].IsUpdate;
                                if (data[0].TTValidTo >= $filter('date')(new Date(), "yyyy-MM-dd")) {
                                    $scope.event.TrainTime = data[0].TrainTime;
                                    $scope.event.TTValidTo = $filter('date')(data[0].TTValidTo, 'yyyy-MM-dd');
                                    $scope.trainFile = JSON.parse(data[0].TTFile);
                                }

                                if (data[0].MIValidTo >= $filter('date')(new Date(), "yyyy-MM-dd")) {
                                    $scope.event.MedicalInspection = data[0].MedicalInspection;
                                    $scope.event.MIValidTo = $filter('date')(data[0].MIValidTo, 'yyyy-MM-dd');
                                    $scope.healthFile = JSON.parse(data[0].MIFile);
                                }

                            }
                            if (data.length != 0) {
                                formVariables.push({name: "IsUpdate", value: "YES"});
                                $scope.IsUpdate = true;
                            } else {
                                formVariables.push({name: "IsUpdate", value: "NO"});
                                $scope.IsUpdate = false;
                            }
                        }, function (err) {
                            Notifications.addError({'status': 'error', 'message': err})
                        });
                }
            });

            $scope.$watch("event.Employer", function (n) {

                    if (n != null && $scope.event.IdCard != undefined) {
                        ConQuaService.GetContractor().get({
                            idCard: $scope.event.IdCard || "",
                            EmployerId: $scope.event.Employer || "",
                            Language: window.localStorage.lang || ""
                        }).$promise.then(function (data) {
                                $scope.note.EmployerRemark = $filter('filter')($scope.EmployerList, $scope.note.Employer)[0].Employer || "";
                                if (data.length != 0) {
                                    if (data[0].Status == "I") {
                                        $scope.importButton = "show";
                                    } else {
                                        $scope.importButton = "hide";
                                    }
                                    $scope.event.Name = data[0].Name;
                                    $scope.event.Phone = data[0].Phone;
                                    $scope.event.Remark = data[0].Remark;
                                    $scope.TrainDate = data[0].TrainDate;
                                    if (data[0].ValidTo !== "0001-01-01T00:00:00") {
                                        $scope.event.ValidTo = $filter('date')(data[0].ValidTo, 'yyyy-MM-dd');
                                    }
                                    $scope.cers = data[0].Certificates || [];
                                    $scope.inss = data[0].Insurances || [];
                                    //这个单据在流程中，不能重新启动
                                    $scope.isCanSave = data[0].IsUpdate;
                                    if (data[0].TTValidTo <= myDate.toLocaleString()) {
                                        $scope.event.TrainTime = data[0].TrainTime;
                                        $scope.event.TTValidTo = $filter('date')(data[0].TTValidTo, 'yyyy-MM-dd');
                                        $scope.trainFile = JSON.parse(data[0].TTFile);
                                    }

                                    if (data[0].MIValidTo <= myDate.toLocaleString()) {
                                        $scope.event.MedicalInspection = data[0].MedicalInspection;
                                        $scope.event.MIValidTo = $filter('date')(data[0].MIValidTo, 'yyyy-MM-dd');
                                        $scope.healthFile = JSON.parse(data[0].MIFile);
                                    }

                                }

                                if (data.length != 0) {
                                    formVariables.push({name: "IsUpdate", value: "YES"});
                                    $scope.IsUpdate = true;
                                } else {
                                    formVariables.push({name: "IsUpdate", value: "NO"});
                                    $scope.IsUpdate = false;
                                }
                            }, function (err) {
                                Notifications.addError({'status': 'error', 'message': err})
                            });
                    }

            });

            $scope.$watch("insId", function (n) {
                if (n !== undefined && n != null) {
                    ConQuaService.GetIns().get({
                        insId: n
                    }).$promise.then(function (data) {
                            $scope.insName = data.InsName;
                            if (data.ValidTo !== "0001-01-01T00:00:00") {
                                $scope.insValidTo = $filter('date')(data.ValidTo, 'yyyy-MM-dd');
                            }
                            if (data.Files.length <= 0) {
                                $scope.IsinsShow = true;
                            } else {
                                $scope.IsinsShow = false;
                            }
                            $scope.filedata = data.Files
                        }, function (err) {
                            Notifications.addError({'status': 'error', 'message': err})
                        })
                }

            });

            function saveVoucher(status,callback){
                var insType4 = false;
                var insType5 = false;
                for(var i = 0;i<$scope.inss.length;i++){
                    if($scope.inss[i].InsName == "4"){
                        insType4 = true
                    }
                    else if($scope.inss[i].InsName == "5"){
                        insType5 = true
                    }
                }
                if(!insType4 ){
                    Notifications.addError({'status': 'error', 'message': $translate.instant("InsType4Error")});
                    return;
                }
                else if(!insType5){
                    Notifications.addError({'status': 'error', 'message': $translate.instant("InsType5Error")});
                    return;
                }
                var today = new Date();
                var d1 = parseInt(new Date(today).getTime() / 1000 / 60 / 60 / 24);
                var d2 = parseInt(new Date($scope.event.ValidTo).getTime() / 1000 / 60 / 60 / 24);
                var days = d2 - d1;
                if (days > 366) {
                    Notifications.addError({'status': 'error', 'message': $translate.instant("Msg_ConQua_Validity")});
                    return;
                }
                var query = {};
                query.IdCard = $scope.event.IdCard;
                query.EmployerID = $scope.event.Employer;
                query.Name = $scope.event.Name;
                query.Phone = $scope.event.Phone;
                query.Remark = $scope.event.Remark;
                query.ValidTo = $scope.event.ValidTo;
                query.UserId = Auth.username;
                query.Certificates = $scope.cers;
                query.Insurances = $scope.inss;
                query.IsUpdate = $scope.IsUpdate;
                query.Status = status;
                query.PersonalEquipment = JSON.stringify($scope.checkboxes);
                query.TrainTime = $scope.event.TrainTime;
                query.TTValidTo = $scope.event.TTValidTo;
                query.TTFile = JSON.stringify($scope.trainFile);
                query.MedicalInspection = $scope.event.MedicalInspection;
                query.MIValidTo = $scope.event.MIValidTo;
                query.MIFile = JSON.stringify($scope.healthFile);
                query.TrainDate = $scope.TrainDate || null;
                ConQuaService.SaveContractor().save(query).$promise.then(function (res) {
                    callback(null)
                }, function (errResponse) {
                    callback(errResponse)
                });
            }

            $scope.save = function () {
                window.localStorage.setItem("Employer", $scope.eventStart_Employer);
                /*if ($scope.isCanSave == false) {
                 Notifications.addError({'status': 'error', 'message': "这个包商还在流程中，不能重新启动!"});
                 return;
                 }*/
                //日期的判断有效期不能大于一年

                GateGuest.GetGateCheckers().getCheckers({
                    owner: Auth.username,
                    fLowKey: $scope.flowkey,
                    Kinds: "",
                    CheckDate: ""
                }).$promise.then(function (res) {
                        var leaderList = [];
                        for (var i = 0; i < res.length; i++) {
                            leaderList[i] = res[i].Person;
                        }
                        if (leaderList.length <= 0) {
                            Notifications.addError({'status': 'error', 'message': $translate.instant('Leader_NO_MSG')});
                           return
                        } else {
                            saveVoucher("F",function(errResponse){
                                if(errResponse){
                                    Notifications.addError({'status': 'error', 'message': errResponse});
                                }
                                else{
                                    GateGuest.GetGateCheckerByKind("Contractor",function(reslen,errormsg) {
                                        if (errormsg) {
                                            Notifications.addError({'status': 'error', 'message': errormsg});
                                            return;
                                        } else {
                                            formVariables.push({name: "safety", value:reslen});//EHS审核人员
                                            formVariables.push({name: "cers", value: $scope.cers});
                                            formVariables.push({name: "inss", value: $scope.inss});
                                            formVariables.push({name: "start_remark", value: "remark"});
                                            formVariables.push({name: "checker", value: leaderList});
                                            formVariables.push({name: "eventStart_Employer", value: $scope.event.Employer});
                                            formVariables.push({name: "eventStart_IdCard", value: $scope.event.IdCard});
                                            formVariables.push({name: "eventStart_ValidTo", value: $scope.event.ValidTo});


                                            historyVariable.push({name: "Name", value: $scope.event.Name});
                                            historyVariable.push({name: "IdCard", value: $scope.event.IdCard});
                                            historyVariable.push({name: "ValidTo", value: $scope.event.ValidTo});
                                            historyVariable.push({name: "phone", value: $scope.event.Phone});
                                            historyVariable.push({name: "Remark", value: $scope.event.Remark});
                                            historyVariable.push({name: "TrainTime", value: $scope.event.TrainTime});
                                            historyVariable.push({name: "MedicalInspection", value: $scope.event.MedicalInspection});
                                            getFlowDefinitionId($scope.flowkey, function (FlowDefinitionId) {
                                                if (FlowDefinitionId) {
                                                    //  Notifications.addMessage({'status': 'information', 'message': "保存成功:"+ reportid });
                                                    startflowid(FlowDefinitionId);
                                                } else {
                                                    Notifications.addError({'status': 'error', 'message': "Process definition error"});
                                                    return;
                                                }
                                            })
                                        }
                                    })

                                }
                            })
                        }
                    });
            };
            $scope.saveImport = function(){
                saveVoucher("Q",function(errResponse){
                    if(errResponse){
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    }
                    else{
                        Notifications.addError({'status': 'error', 'message': $translate.instant('Save_Success_MSG')});
                    }
                })
            }
            $scope.saveDraft = function(){
                saveVoucher("N",function(errResponse){
                    if(errResponse){
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    }
                    else{
                        Notifications.addError({'status': 'error', 'message': $translate.instant('Save_Success_MSG')});
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
            function startflowid(definitionID) {
                variablesMap = Forms.variablesToMap(formVariables)
                historyVariable = Forms.variablesToMap(historyVariable)
                var datafrom = {
                    formdata: variablesMap,
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

        }])
});
