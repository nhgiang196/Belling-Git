/**
 * Created by wangyanyan on 2017/3/17.  没用
 */
define(['myapp', 'angular'], function (myapp, angular) {

    myapp.controller("UnJointTruckUpdateController", ['$scope', 'EngineApi', '$http', '$timeout', 'Notifications', '$upload', '$compile', '$filter', 'Auth', '$resource', '$routeParams', 'IO_BARCODE_TYPES', 'Forms', '$location', 'GateUnJointTruck', 'GateGuest', 'GateJointTruck',
        function ($scope, EngineApi, $http, $timeout, Notifications, $upload, $compile, $filter, Auth, $resource, $routeParams, IO_BARCODE_TYPES, Forms, $location, GateUnJointTruck, GateGuest, GateJointTruck) {
            console.log($routeParams.code);
            var lang = window.localStorage.lang;
            $scope.workflow="FEPVUnJointTruck";
            var formVariables = [];
            var historyVariable = [];
            var variablesMap = {};
            GateUnJointTruck.UnJointTruckBasic().getVehicleTypes({Language:lang,Type:"UnJointTruck"}).$promise.then(function (res) {
                $scope.Shape = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            GateUnJointTruck.UnJointTruckBasic().unJointTruckByVoucherID({voucherid: $routeParams.code}).$promise.then(function (res) {
                $scope.note = res;
                $scope.note.ExpectIn = $filter('date')($scope.note.ExpectIn, 'yyyy-MM-dd');
                $scope.note.ValidatePeriod = $filter('date')($scope.note.ValidatePeriod, 'yyyy-MM-dd');
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });


            function saveVoucher(Status, callback) {
                var query = {};
                query = $scope.note;
                query.Status = Status;
                query.UserID = Auth.username;
                query.OrderNO = $scope.note.OrderNO || "";
                query.ImportBatch== $scope.note.OrderNO || "";
                GateJointTruck.JointTruckBasic().isInBlackList({
                    vehicle: $scope.note.VehicleNO,
                    type: "Truck"
                }).$promise.then(function (res) {
                        if (res.msg) {
                            callback(res.msg);
                            return
                        }
                        else {

                            GateUnJointTruck.SaveUnJointTruck().save(query).$promise.then(function (res) {
                                    var voucherid = res.VoucherID;
                                    if (voucherid) {
                                        $scope.note.VoucherID = voucherid;
                                        callback("");
                                    }
                                },
                                function (errResponse) {
                                    callback(errResponse);
                                })

                        }
                    },
                    function (errResponse) {
                        callback(errResponse);
                    });
            }
            $scope.flowkey = ""
            $scope.savesubmit = function () {
                saveVoucher("F", function (errmsg) {
                    console.log(errmsg)
                    if (errmsg) {
                        Notifications.addMessage({'status': 'error', 'message': errmsg});
                    } else {
                        GateGuest.GetGateCheckerLeaders({owner: Auth.username,  fLowKey: $scope.flowkey,  Kinds: "",  CheckDate: $scope.note.ExpectIn  },
                            function(res,errormsg){
                                if (errormsg) {
                                    Notifications.addError({'status': 'error', 'message': errormsg});
                                    return;
                                } else {
                                    /*-------------submit start-------------------------------*/
                                    var leaderList = [];
                                    for (var i = 0; i < res.length; i++) {
                                        leaderList[i] = res[i].Person;
                                    }
                                    if (leaderList.length <= 0) {
                                        Notifications.addError({  'status': 'error',  'message': $translate.instant('Leader_NO_MSG')  });
                                        return
                                    } else {;
                                        formVariables.push({name: "IsChecker", value: "YES"});//需要签核
										
										formVariables.push({name: "ValidTo",value: $scope.note.ValidatePeriod });
                                        formVariables.push({    name: "ChecherArray", value: leaderList    });
                                        formVariables.push({
                                            name: "start_remark",
                                            value: $scope.note.VoucherID + " " + $scope.note.VehicleType
                                        });
                                        formVariables.push({name: "JWUser", value: "Guard"});
                                        formVariables.push({
                                            name: "VoucherID",
                                            value: $scope.note.VoucherID
                                        });
										 formVariables.push({    name: "ValidTo", value: $scope.note.ValidatePeriod    });
                                        formVariables.push({name: "checkinconfirm", value: "NO"});//进厂确认
                                        if ($scope.note.VehicleType == "5") {
                                            /* ---------------废料车辆总务签核  start---------------*/
                                            GateGuest.GetGateCheckerByKind("UnJointTruck", function (reslen, errormsg) {
                                                if (errormsg) {
                                                    Notifications.addError({  'status': 'error', 'message': errormsg.message });

                                                } else {
                                                        formVariables.push({   name: "initiator_confirm", value: reslen});
                                                        formVariables.push({name: "checkoutconfirm", value: "YES"});
                                                        getFlowDefinitionId( $scope.workflow, function (FlowDefinitionId) {
                                                            if (FlowDefinitionId) {
                                                                startflowid(FlowDefinitionId, $scope.note.VoucherID);
                                                            } else {
                                                                Notifications.addError({'status': 'error', 'message': "Process definition error"});
                                                                return;
                                                            }
                                                        })

                                                }
                                            });
                                            /* ---------------废料车辆总务签核  end--------------*/
                                        }
                                        else {
                                            formVariables.push({name: "checkoutconfirm", value: "NO"});
                                            getFlowDefinitionId( $scope.workflow, function (FlowDefinitionId) {
                                                if (FlowDefinitionId) {
                                                    //  Notifications.addMessage({'status': 'information', 'message': "保存成功:"+ reportid });
                                                    startflowid(FlowDefinitionId, $scope.note.VoucherID);
                                                } else {
                                                    Notifications.addError({'status': 'error', 'message': "Process definition error"});
                                                    return;
                                                }
                                            })
                                        }
                                    }


                                    /*submit  end*/

                                }
                        });

                    }
                })
            }
            $scope.savedraft = function () {
                var query = {}
                query = $scope.note;
                query.UserID = Auth.username;
                query.Status = "N";
                GateUnJointTruck.SaveUnJointTruck().save(query).$promise.then(function (res) {
                        var voucherid = res.VoucherID;
                        if (voucherid) {
                            Notifications.addMessage(({
                                'status': 'message',
                                'message': $translate.instant("Save_Success_MSG")
                            }))
                        }
                    },
                    function (errResponse) {
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    });
            }
            $scope.close = function () {
                var query = {}
                query = $scope.note;
                query.UserID = Auth.username;
                query.Status = "X";
                GateUnJointTruck.SaveUnJointTruck().save(query).$promise.then(function (res) {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant("Delete_Succeed_Msg")
                        });
                        history.go(-1);
                    },
                    function (errResponse) {
                        Notifications.addError({'status': 'error', 'message': errResponse});
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
                            'status': 'information',
                            'message': res.message
                        });
                        return;
                    }
                    if (!res.result) {
                        Notifications.addMessage({
                            'status': 'information',
                            'message': res.message
                        });
                    } else {
                        var result = res.result;
                        console.log(result);
                        $location.url("/taskForm/" + res.url);
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


        }])

})