define(['app', 'angular'], function(app, angular) {
    app.factory('NewGuest', ['$rootScope', 'EngineApi', '$http', '$timeout', 'Forms','Notifications', '$compile', '$routeParams', '$upload', '$filter', 'Auth', '$resource', '$translatePartialLoader', '$translate', 'uiGridConstants', 'GateGuest',
        function($rootScope, EngineApi, $http, $timeout,Forms, Notifications, $compile, $routeParams, $upload, $filter, Auth, $resource, $translatePartialLoader, $translate, uiGridConstants, GateGuest) {
        var lang = window.localStorage.lang;
        $rootScope.recod = {};
        $rootScope.recod.start_name = "";
        $rootScope.guestItems = [];
        $rootScope.gd = {};
        $rootScope.note = [];
        $rootScope.workflow="FEPVUnJointTruck";
        var variablesMap = {};
        var pdid =  $routeParams.id;
        var formVariables  = $rootScope.formVariables = [];
        var  historyVariable = $rootScope.historyVariable=[];
        GateGuest.GuestBasic().getGuestType({ language: lang }).$promise.then(function(res) {
            $rootScope.kind = res;
            console.log($rootScope.kind[1]);

        }, function(errResponse) {
            Notifications.addError({ 'status': 'error', 'message': errResponse });
        });
        GateGuest.GuestBasic().getGuestRegions({ language: lang }).$promise.then(function(res) {
            $rootScope.regions = res;
        }, function(errResponse) {
            Notifications.addError({ 'status': 'error', 'message': errResponse });
        });
        GateGuest.GuestBasic().getGuestType({language: lang}).$promise.then(function (res) {
            $rootScope.kind = res;
        }, function (errResponse) {
            Notifications.addError({'status': 'error', 'message': errResponse});
        });

        $rootScope.searchEmployeeInfo = function() {
            if (document.getElementById("EmployeeName").readOnly != false) {
                document.getElementById("EmployeeName").readOnly = false;
                document.getElementById("EmployeeID").readOnly = true;
                $rootScope.recod.start_code = "";
            } else {
                document.getElementById("EmployeeID").readOnly = false;
                document.getElementById("EmployeeName").readOnly = true;
            }
        }
        $rootScope.checkErr = function() {
            var startDate = $rootScope.recod.start_date;
            var endDate = $rootScope.recod.ExpectOutTime;
            $rootScope.errMessage = '';
            if (new Date(startDate) > new Date(endDate)) {
                $rootScope.errMessage = 'End Date should be greater than Start Date';
                Notifications.addError({ 'status': 'error', 'message': $rootScope.errMessage });
                document.getElementById("btnSaveDraft").disabled = true;
                document.getElementById("btnSubmit").disabled = true;
                $rootScope.$apply();
                return;
            } else {
                document.getElementById("btnSaveDraft").disabled = false;
                document.getElementById("btnSubmit").disabled = false;
            }

        };
        $rootScope.Close = function () {
            $rootScope.recod.start_code = "";
            $rootScope.recod.start_date = "";
            $rootScope.recod.VehicleNo = "";
            $rootScope.recod.ExpectOutTime ="";
            $rootScope.recod.start_phone ="";
            $rootScope.recod.start_company = "";
            $rootScope.recod.start_reason = "";
            $('#myGuestModal').modal('hide');

        };
        function SaveGuest(note, callback) {
            GateGuest.SaveGuest().save(note).$promise.then(function(res) {
                var voucherid = res.VoucherID;
                if (voucherid) {
                    //getFlowDefinitionId( $rootScope.workflow, function (FlowDefinitionId) {
                    //    if (FlowDefinitionId) {
                    //        //  Notifications.addMessage({'status': 'information', 'message': "保存成功:"+ reportid });
                    //        startflowid(FlowDefinitionId, $scope.note.VoucherID,$scope.note.VehicleNO,$scope.note.ValidatePeriod);
                    //
                    //    } else {
                    //        Notifications.addError({'status': 'error', 'message': "Process definition error"});
                    //        return;
                    //    }
                    //});
                    //$rootScope.recod.start_voucherid = voucherid;
                    callback(voucherid, "")

                } else {
                    callback(voucherid, $translate.instant('saveError'))
                }
            }, function(errormessage) {
                callback("", errormessage)
            });
        }

        $rootScope.saveGuestDraft = function() {
            var dateObj = saveInit('N');
            var note = dateObj.note;
            SaveGuest(note, function(voucherid, message) {
                if (voucherid) {
                    $rootScope.recod.start_voucherid = voucherid;
                   // Notifications.addMessage({ 'status': 'information', 'message': $translate.instant('saveSuccess') });
                    $rootScope.note = [];
                    $('#myGuestModal').modal('hide');
                } else {
                    Notifications.addError({ 'status': 'error', 'message': $translate.instant('saveError') + message });
                }
            })

        };
        //$rootScope.saveGuestsubmit = function() {
        //    var kinds = $rootScope.recod.start_area + "|" + $rootScope.recod.start_kind;
        //
        //    if ($rootScope.recod.start_area == '1') {
        //        GateGuest.GuestBasic().checkUserBelongDyeing({
        //            EmployeeID: Auth.username
        //        }).$promise.then(function(res) {
        //                if (res[0].DepartmentID.substr(0, 3) == '513' || res[0].DepartmentID.substr(0, 3) == '519' || res[0].DepartmentID.substr(0, 3) == '511' || res[0].DepartmentID.substr(0, 3) == '510') {
        //                    //                                if (res[0].DepartmentID.substr(0, 3) == '511') {
        //                    //                                    $rootScope.EmployeeID = 'FEPVNN0003';
        //                    //                                    $rootScope.EmployeeName = '徐廷威';
        //                    //                                } else {
        //                    //                                    $rootScope.EmployeeID = 'FEPVNN0023';
        //                    //                                    $rootScope.EmployeeName = '叶铭昱';
        //                    //                                }
        //                    GateGuest.GetGateCheckers().getCheckers({
        //                        owner: Auth.username,
        //                        fLowKey: "FEPVGateGuest",
        //                        Kinds: kinds,
        //                        CheckDate: $rootScope.recod.start_date
        //                    }).$promise.then(function(res) {
        //                            var leaderList = [];
        //                            asyncLoop(res[0].Person.split(',').length, function(loop) {
        //                                    EngineApi.getMemberInfo().get({ userid: res[0].Person.split(',')[loop.iteration()] }, function(ress) {
        //
        //                                        console.log(ress.Name);
        //                                        leaderList.push(res[0].Person.split(',')[loop.iteration()] + ' -- ' + ress.Name)
        //
        //                                        loop.next();
        //                                    });
        //                                },
        //                                function() {
        //
        //                                });
        //                            $rootScope.listleadercheck = leaderList;
        //                        }, function(errormessage) {
        //                            Notifications.addError({ 'status': 'error', 'message': errormessage });
        //                        })
        //                    console.log('List of leader checker: ' + $rootScope.listleadercheck);
        //                    $('#messageModal').modal('show');
        //                } else if (res[0].DepartmentID.substr(0, 3) == '512') {
        //                    GateGuest.GetGateCheckers().getCheckers({
        //                        owner: Auth.username,
        //                        fLowKey: "FEPVGateGuest",
        //                        Kinds: kinds,
        //                        CheckDate: $rootScope.recod.start_date
        //                    }).$promise.then(function(res) {
        //                            var leaderList = [];
        //                            asyncLoop(res[0].Person.split(',').length, function(loop) {
        //                                    EngineApi.getMemberInfo().get({ userid: res[0].Person.split(',')[loop.iteration()] }, function(ress) {
        //
        //                                        console.log(ress.Name);
        //                                        leaderList.push(res[0].Person.split(',')[loop.iteration()] + ' -- ' + ress.Name)
        //
        //                                        loop.next();
        //                                    });
        //                                },
        //                                function() {
        //
        //                                });
        //                            $rootScope.listleadercheck = leaderList;
        //                        }, function(errormessage) {
        //                            Notifications.addError({ 'status': 'error', 'message': errormessage });
        //                        })
        //                    $rootScope.showMessageModal = '';
        //                    $('#messageModal').modal('show');
        //
        //
        //                }
        //            }, function(errResponse) {
        //                Notifications.addError({ 'status': 'error', 'message': errResponse });
        //            });
        //
        //
        //    } else {
        //        var dateObj = saveInit();
        //        var note = dateObj.note;
        //
        //        var subject = "Your Guest checked in";
        //        var listguesttext = "";
        //        var body = ' <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
        //            '<style>' +
        //            ' body { font-family: "Hiragino Sans GB","微软雅黑"; }  </style> </head> <body style="margin: 0; padding: 0;"><div>Dear Mr/Mrs/Miss, </div>' +
        //            '<div></div>' +
        //            ' List guest checked in at Security room:';
        //        note.Status = "F";
        //        var mail = "";
        //        var listguest = [];
        //        var listguestabsent = "";
        //        var outputdate = moment($rootScope.recod.start_date).add(1, 'days').format('YYYY-MM-DD');
        //        var kinds = $rootScope.recod.start_area + "|" + $rootScope.recod.start_kind;
        //        GateGuest.GuestBasic().getEmail({ UserID: Auth.username }).$promise.then(function(res) {
        //            for (var i = 0; i < res.length; i++) {
        //                mail = res[i].Email;
        //
        //            }
        //        }, function(errormessage) {
        //            Notifications.addError({ 'status': 'error', 'message': errormessage });
        //        });
        //
        //        GateGuest.GetGateCheckers().getCheckers({
        //            owner: Auth.username,
        //            fLowKey: "FEPVGateGuest",
        //            Kinds: kinds,
        //            CheckDate: $rootScope.recod.start_date
        //        }).$promise.then(function(res) {
        //
        //                var leaderList = [];
        //                asyncLoop(res[0].Person.split(',').length, function(loop) {
        //                        EngineApi.getMemberInfo().get({ userid: res[0].Person.split(',')[loop.iteration()] }, function(ress) {
        //
        //                            console.log(ress.Name);
        //                            leaderList.push(res[0].Person.split(',')[loop.iteration()] + ' -- ' + ress.Name)
        //
        //                            loop.next();
        //                        });
        //                    },
        //                    function() {
        //
        //                    });
        //                $rootScope.showMessageModal = '';
        //                $rootScope.listleadercheck = leaderList;
        //            }, function(errormessage) {
        //                Notifications.addError({ 'status': 'error', 'message': errormessage });
        //            })
        //        console.log('List of leader checker: ' + $rootScope.listleadercheck);
        //
        //        $('#messageModal').modal('show');
        //
        //
        //    }
        //
        //
        //};


        $rootScope.saveGuestsubmit = function() {
            var outputdate = moment($rootScope.recod.start_date).add(1, 'days').format('YYYY-MM-DD');
            var kinds = $rootScope.recod.start_area + "|" + $rootScope.recod.start_kind;
            var dateObj = saveInit('Q');
            $rootScope.note = dateObj.note;
            GateGuest.GetGateCheckers().getCheckers({
                owner: Auth.username,
                fLowKey: "FEPVGateGuest",
                Kinds: kinds,
                CheckDate: $rootScope.recod.start_date
            }).$promise.then(function (res) {
                    var leaderList = [];
                    for (var i = 0; i < res.length; i++) {
                        leaderList[i] = res[i].Person;
                        console.log('Leader List: '+ leaderList[i])
                    }
                    $rootScope.formVariables.push({name: "GuestChecherArray", value: leaderList});
                    $rootScope.formVariables.push({name: "start_endDate", value: outputdate});
                    $rootScope.formVariables.push({name: "IsChecker", value: dateObj.confirm});
                    $rootScope.formVariables.push({name: "start_confirm", value: dateObj.confirm});
                    $rootScope.formVariables.push({name: "start_area", value: $rootScope.recod.start_area});
                    $rootScope.formVariables.push({name: "JWUser", value: "Guard"});
                    $rootScope.formVariables.push({name: "start_date", value: $rootScope.recod.start_date});
                    $rootScope.formVariables.push({name: "start_kind", value: $rootScope.recod.start_kind});
                    $rootScope.formVariables.push({name: "start_reason", value: $rootScope.recod.start_reason});
                    $rootScope.formVariables.push({name: "ExpectOutTime", value: $rootScope.recod.ExpectOutTime});
                    $rootScope.formVariables.push({name: "VehicleNo", value: $rootScope.recod.ExpectOutTime});
                    console.log($rootScope.formVariables);
                   SaveGuest($rootScope.note, function(voucherid, message) {

                        if (voucherid) {
                            $rootScope.formVariables.push({name: "VoucherID", value: voucherid});
                            //  Notifications.addMessage({'status': 'information', 'message': "保存成功:"+ reportid });
                            startflowid(voucherid);
                           // $rootScope.recod.start_voucherid = voucherid;
                            $('#myGuestModal').modal('hide');
                            Notifications.addMessage({ 'status': 'information', 'message': $translate.instant('Submit Success') });
                            return;


                        } else {
                            Notifications.addError({ 'status': 'error', 'message': $translate.instant('Submit Error') + message });
                        }
                    })


                });


        };

        var saveInit = function(msg) {
            var dateObj = {};
            var objemail = [];
            var note = {};
            note.VoucherID = $rootScope.recod.start_voucherid || "";
            note.Content = $rootScope.recod.start_reason;
            if ($rootScope.recod.start_kind == "2") { //SaveGuest
                note.IsNeedConfirm = false;
                dateObj.confirm = "NO"
            } else {
                note.IsNeedConfirm = true;
                dateObj.confirm = "YES"
            }

            note.GuestType = $rootScope.recod.start_kind;
            note.Region = $rootScope.recod.start_area;
            var employeeID = $rootScope.recod.start_code;

            note.Respondent = employeeID.toUpperCase();
            note.DepartmentSpc = $rootScope.recod.DepartmentSpc;
            note.ExtNO = $rootScope.recod.start_phone;
            note.Enterprise = $rootScope.recod.start_company;
            note.ExpectIn = $rootScope.recod.start_date;
            note.UserID = Auth.username;
            $rootScope.formVariables= new Array();
            if(msg=="N")
            {
                note.Status = "N";
            }else
            {
                note.Status = "Q";
            }

            for (var i = 0; i < $rootScope.guestItems.length; i++) {
                if ($rootScope.guestItems[i].IdCard == "" || !$rootScope.guestItems[i].IdCard) {
                    $rootScope.guestItems[i].IdCard = i;
                }
            }
            note.GuestItems = $rootScope.guestItems;
            note.ExpectOutTime = $rootScope.recod.ExpectOutTime;
            note.VehicleNo = $rootScope.recod.VehicleNo;
            dateObj.note = note;
            return dateObj;
        };

        $rootScope.addGuestItemG = function() {
           // console.log('OKKKKKKKK: ' + $rootScope.gd.IdCard);
            if ($rootScope.gd != null || $rootScope.gd != {}) {
                $rootScope.guestItems.push($rootScope.gd);
                $rootScope.gd = {};
            }
        };

        $rootScope.deleteGuestItemG = function(index) {
            $rootScope.guestItems.splice(index, 1);

        };

        $rootScope.$watch("recod.start_code", function(n) {
            if (n !== undefined && document.getElementById("EmployeeID").readOnly == false) {
                if (n.length == 10) {
                    var query = {};
                    query.UserID = Auth.username;
                    query.EmployeeID = n;
                    GateGuest.GuestBasic().getNameByEmployeeID(query).$promise.then(function(res) {
                        $rootScope.recod.start_name = res[0].Name;
                        $rootScope.recod.DepartmentSpc = res[0].Specification;
                    }, function(errResponse) {
                        Notifications.addError({ 'status': 'error', 'message': errResponse });
                    });
                } else {
                    $rootScope.recod.start_name = "";
                }
            }
        });

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

        EngineApi.getStart().start({"id":'FEPVGateGuest:3:11adc7dc-4f32-11e7-9368-0050568c22a6'},function(res){
            if(res.message){
                Notifications.addError({'status': 'error', 'message': res.message });
                return ;
            }
            if(res.formkey){
                console.log(res.formkey);
                $rootScope.definitionID=res.definitionID;
                console.log($rootScope.definitionID);
                $http.get(res.formkey).success(function(data, status, headers, config){
                    console.log(data);
                    $("#bindHtml").html(data);
                    var newScope = $rootScope.$new();
                    //$compile($("#bindHtml").contents())($rootScope.$new());
                });
            }else{
                Notifications.addError({'status': 'error', 'message': "No form to start, set the start form in the process" });
                return ;
            }
        });

        function startflowid( businessKey) {

            $rootScope.businessKey = businessKey;
            variablesMap = Forms.variablesToMap($rootScope.formVariables)
            historyVariable = Forms.variablesToMap($rootScope.historyVariable)

            var datafrom = {
                formdata: variablesMap,
                businessKey: $rootScope.businessKey,
                historydata: historyVariable
            };
            console.log(datafrom);
            EngineApi.doStart().start({"id": $rootScope.definitionID}, datafrom).$promise.then(function (res) {
                console.log('log process:'+res);
                if (res.message) {
                    callback({'status': 'error', 'message': res.message});
                    return;
                }
                if (!res.result) {
                    callback({'status': 'error', 'message': res.message});
                } else {
                    var result=JSON.parse(res.result);
                    console.log(result.id);

                    callback({'status': 'info', 'message': result.id});
                }
            }, function (errResponse) {
                callback({'status': 'error', 'message': errResponse});
            });

        }


        function getFlowDefinitionId(keyname, callback) {
            EngineApi.getKeyId().getkey({
                "key": keyname
            }, function (res) {
                callback(res.id);
            });
        }


    }])
});