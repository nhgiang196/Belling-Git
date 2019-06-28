
    function GateGuest_start($scope, EngineApi, $http, $timeout, Notifications, $compile,$routeParams, $upload, $filter, Auth, $resource, $translatePartialLoader, $translate, uiGridConstants, GateGuest) {
        $translatePartialLoader.addPart('GateGuest');
        $translate.refresh();
        var lang = window.localStorage.lang;
        $scope.recod = {};
        $scope.recod.start_name = "";
        $scope.guestItems = [];
        $scope.note = {};

        $scope.details = {};
        $scope.detailsGuestItems = [];
        var historyurl = "";
        $scope.onlyOwner = true;
        $scope.dateFrom = $filter('date')(new Date(), "yyyy-MM-dd");
        $scope.dateTo = $filter('date')(new Date(), "yyyy-MM-dd");
        $scope.bloodTypes = [
            {'id' : 1, 'description' : 'O+'},
            {'id' : 2, 'description' : 'A'},
            {'id' : 3, 'description' : 'B'},
        ];

        // set initial selected option to blood type B
        $scope.selectedOption =  { 'description' : 'B'};
        var paginationOptions = {
            pageNumber: 1,
            pageSize: 50,
            sort: null
        };
        $scope.getVoucherStatus = function (Status) {
            var statLen = $filter('filter')($scope.StatusList, {"Status": Status});
            if (statLen.length > 0) {
                return statLen[0].Remark;
            } else {
                return Status;
            }
        };

        $scope.getVoucherGuestType = function (GuestType) {
            var statLen = $filter('filter')($scope.kind, GuestType);
            if (statLen.length > 0) {
                return statLen[0].GuestType;
            } else {
                return GuestType;
            }
        };
        $scope.getVoucherRegion = function (Region) {
            var statLen = $filter('filter')($scope.regions, Region);
            if (statLen.length > 0) {
                return statLen[0].Region;
            } else {
                return Region;
            }
        };
        var col = [{
            field: 'VoucherID',
            displayName: $translate.instant('VoucherID'),
            minWidth: 130,
            cellTooltip: true,
            cellTemplate: '<a ng-click="grid.appScope.getVoucher(row)"  style="padding:5px;display:block; cursor:pointer">{{COL_FIELD}}</a>'
        },
            {
                field: 'Status',
                minWidth: 100,
                displayName: $translate.instant('Status'),
                cellTooltip: true,
                cellTemplate: '<span  >{{grid.appScope.getVoucherStatus(row.entity.Status)}}</span>'
            },
            {field: 'Content', minWidth: 150, displayName: $translate.instant('Content'), cellTooltip: true},
            {
                field: 'GuestType',
                minWidth: 80,
                displayName: $translate.instant('GuestType'),
                cellTooltip: true,
                cellTemplate: '<span  >{{grid.appScope.getVoucherGuestType(row.entity.GuestType)}}</span>'
            },
            {
                field: 'Region',
                minWidth: 80,
                displayName: $translate.instant('Region'),
                cellTooltip: true,
                cellTemplate: '<span  >{{grid.appScope.getVoucherRegion(row.entity.Region)}}</span>'
            },
            {field: 'Respondent', minWidth: 120, displayName: $translate.instant('Respondent'), cellTooltip: true},
            {field: 'ExtNO', minWidth: 80, displayName: $translate.instant('ExtNO'), cellTooltip: true},
            {field: 'Enterprise', displayName: $translate.instant('Enterprise'), minWidth: 80, cellTooltip: true},
            {field: 'ExpectIn', displayName: $translate.instant('ExpectIn'), minWidth: 150, cellTooltip: true},
            {field: 'InTime', displayName: $translate.instant('InTime'), minWidth: 150, cellTooltip: true},
            {field: 'Complete', displayName: $translate.instant('Complete'), minWidth: 150, cellTooltip: true},
            {field: 'OutTime', displayName: $translate.instant('OutTime'), minWidth: 150, cellTooltip: true},
            {field: 'ExpectOutTime', displayName: $translate.instant('GoodsExpectOut'), minWidth: 80, cellTooltip: true},
            {field: 'VehicleNo', displayName: $translate.instant('VehicleNO'), minWidth: 80, cellTooltip: true},
            {field: 'Stamp', displayName: $translate.instant('Stamp'), minWidth: 150, cellTooltip: true},
            {field: 'UserID', displayName: $translate.instant('UserID'), minWidth: 80, cellTooltip: true}];


        GateGuest.GuestBasic().getGuestType({language: lang}).$promise.then(function (res) {
            $scope.kind = res;
        }, function (errResponse) {
            Notifications.addError({'status': 'error', 'message': errResponse});
        });
        GateGuest.GuestBasic().getGuestRegions({language: lang}).$promise.then(function (res) {
            $scope.regions = res;
        }, function (errResponse) {
            Notifications.addError({'status': 'error', 'message': errResponse});
        });
        GateGuest.GetQueryStatus().get({ctype: 'Guest', language: lang, flag: '1'}).$promise.then(function (res) {
            $scope.StatusList = res;

        }, function (errResponse) {
            Notifications.addError({'status': 'error', 'message': errResponse});
        });


        $scope.gridOptions = {
            columnDefs: col,
            data: [],
            enableColumnResizing: true,
            enableSorting: true,
            showGridFooter: false,
            enableGridMenu: true,
            exporterMenuPdf: false,
            enableSelectAll: false,
            enableRowHeaderSelection: true,
            enableRowSelection: true,
            multiSelect: false,
            paginationPageSizes: [50, 100, 200, 500],
            paginationPageSize: 50,
            enableFiltering: false,
            exporterOlderExcelCompatibility: true,
            useExternalPagination: true,
            enablePagination: true,
            enablePaginationControls: true,
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                EngineApi.getTcodeLink().get({"userid": Auth.username, "tcode": "FEPVGateGuestCreate"}, function (linkres) {
                    if (linkres.IsSuccess) {
                        gridApi.core.addToGridMenu(gridApi.grid, gridMenu);

                    }
                })
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    $scope.selectedVoucherid = row.entity.VoucherID;
                });
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    paginationOptions.pageNumber = newPage;
                    paginationOptions.pageSize = pageSize;
                    SearchList(newPage, pageSize);
                });
            }
        };
var gridMenu= [{

    title: $translate.instant("Create"),
    action: function ($event) {
        $('#myModal').modal('show');
        $scope.recod = {};
        $scope.recod.start_name = "";
        $scope.recod.start_date = $filter('date')(new Date(), "yyyy-MM-dd HH:mm");
        $scope.recod.ExpectOutTime = $filter('date')(new Date($scope.recod.start_date),'yyyy-MM-dd 17:00');
        $scope.guestItems = [];
    },
    order: 1
}, {
    title: $translate.instant("Update"),
    action: function ($event) {
        $('#myModal').modal('show');
        var resultRows = $scope.gridApi.selection.getSelectedRows();
        if (resultRows.length == 1) {
            if (resultRows[0].Status == "N" && resultRows[0].UserID == Auth.username) {
                GateGuest.GuestBasic().getGuest({
                    VoucherID: obj.entity.VoucherID,
                    Language: lang
                }).$promise.then(function (res) {
                            console.log(res);
                            if (res[0].Status == "N" || !res[0].Status) {
                                if (res[0].UserID == Auth.username) {
                                    $scope.recod.start_kind = res[0].GuestType;
                                    $scope.recod.start_code = res[0].Respondent;
                                    $scope.recod.start_area = res[0].Region;
                                    $scope.recod.start_phone = res[0].ExtNO;
                                    $scope.recod.start_company = res[0].Enterprise;
                                    $scope.recod.start_date = res[0].ExpectIn;
                                    $scope.guestItems = res[0].GuestItems;
                                    $scope.recod.start_reason = res[0].Content;
                                    $scope.recod.start_voucherid = res[0].VoucherID;

                                    $('#myModal').modal('show');
                                } else {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('creatorError')
                                    });
                                }
                            } else {
                                $scope.details = res[0];
                                //  $scope.details
                                $scope.details.Status = $scope.getVoucherStatus($scope.details.Status);
                                $scope.details.GuestType = $scope.getVoucherGuestType($scope.details.GuestType);
                                $scope.details.Region = $scope.getVoucherRegion($scope.details.Region);

                                $scope.detailsGuestItems = res[0].GuestItems;
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('draftError')
                                });
                                document.getElementById("detailView").style.display = "";
                                document.getElementById("Search").style.display = "none";
                                GateGuest.GetGateGuestPID().get({
                                    VoucherID: obj.entity.VoucherID,
                                    activityName: "StartEvent_Create"
                                }).$promise.then(function (res) {
                                            historyurl = "#/processlog/" + res.ProcessInstanceId;
                                            $scope.$emit('historyurl', historyurl);
                                        }, function (errormessage) {
                                            console.log(errormessage);
                                            //  Notifications.addError({'status': 'error', 'message': errormessage});
                                        });
                            }

                        }, function (errormessage) {
                            Notifications.addError({'status': 'error', 'message': errormessage});
                        });
            }
            else {
                Notifications.addError({'status': 'error', 'message': $translate.instant('Edit_Draf_MSG')})
            }

        } else {
            Notifications.addError({
                'status': 'error',
                'message': $translate.instant('Select_ONE_MSG')
            });
        }
    },
    order: 2
},
    {
        title: $translate.instant('Delete'),
        action: function ($event) {
            var resultRows = $scope.gridApi.selection.getSelectedRows();
            if (resultRows.length == 1) {
                if (resultRows[0].Status == "N" && resultRows[0].UserID == Auth.username) {
                    if (confirm($translate.instant('Delete_IS_MSG') + ":" + resultRows[0].VoucherID)) {
                        GateGuest.GuestBasic().saveGuestStatus({
                            voucherID: resultRows[0].VoucherID,
                            status: "X"
                        }).$promise.then(function (res) {
                                    Notifications.addError({'status': 'info', 'message': "OK"});
                                    SearchList(1, 50);
                                }, function (errormessage) {
                                    Notifications.addError({'status': 'error', 'message': errormessage});
                                });
                    }
                }
                else {
                    Notifications.addError({
                        'status': 'error',
                        'message': $translate.instant('Edit_Draf_MSG')
                    })
                }

            } else {
                Notifications.addError({
                    'status': 'error',
                    'message': $translate.instant('Select_ONE_MSG')
                });
            }
        },
        order: 3

    },{
        title: $translate.instant('PrintReport'),
        action: function ($event) {
            var resultRows = $scope.gridApi.selection.getSelectedRows();
            $scope.voucherID ="";
            if(resultRows.length == 1){
                $scope.voucherID = resultRows[0].VoucherID;
                var href = '#/gate/Guest/print/'+  $scope.voucherID;
                window.open(href);
            }
            else {
                    Notifications.addError({'status': 'error', 'message': 'Please select one application on grid !'});
            }

        },
        order: 4
    }];
        $scope.reset = function () {
            SearchList(1, 50);
            document.getElementById("EmployeeName").readOnly = true;
            document.getElementById("EmployeeID").readOnly = false;
            $('#myModal').modal('hide');
            $('#nextModalGateGuest').modal('hide');
            $('#nextModal').modal('hide');
        };

        function SearchList(pageIndex, pageSize) {
            if ($scope.dateFrom == null && $scope.dateTo == null) {
                Notifications.addError({'status': 'error', 'message': $translate.instant('dataError')});
                return;
            }
            var query = {userID: "", des: ""};
            if ($scope.onlyOwner == true) {
                query.userID = Auth.username;
            }
            else {
                query.userID = "";
            }
            query.PageIndex = pageIndex;
            query.PageSize = pageSize;
            query.voucherID = $scope.VoucherID || "";
            query.status = $scope.status || "";
            query.enterprise = $scope.enterprise || "";
            query.dateFrom = $scope.dateFrom;
            query.dateTo = $scope.dateTo;
            query.region = $scope.region || "";
            query.guestType = $scope.guestType || "";
            GateGuest.GuestBasic().getGuestsList(query).$promise.then(function (res) {
                $scope.gridOptions.data = res.TableData;
                $scope.gridOptions.totalItems = res.TableCount[0];
            }, function (errormessage) {
                Notifications.addError({'status': 'error', 'message': errormessage});
            });
        }

        $scope.Search = function () {
            SearchList(1, 50);
        };
        //获得姓名
        $scope.$watch("recod.start_code", function (n) {
            if (n !== undefined && document.getElementById("EmployeeID").readOnly == false) {
                if (n.length == 10) {
                    var query = {};
                    query.UserID = Auth.username;
                    query.EmployeeID = n;
                    GateGuest.GuestBasic().getNameByEmployeeID(query).$promise.then(function (res) {
                        $scope.recod.start_name = res[0].Name;
                        $scope.recod.DepartmentSpc = res[0].Specification;
                    }, function (errResponse) {
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    });
                } else {
                    $scope.recod.start_name = "";
                }
            }
        });
        $scope.addGuestItem = function () {
           console.log('OKKKKKKKK: '+$scope.note.IdCard);
            if ($scope.note != null || $scope.note != {}) {
                $scope.guestItems.push($scope.note);
                $scope.note = {};
            }
        };

        $scope.deleteGuestItem = function (index) {
            $scope.guestItems.splice(index, 1);

        };
        var saveInit = function (type) {
            var dateObj = {};
            var objemail=[];
            var note = {};
            note.VoucherID = $scope.recod.start_voucherid || "";
            note.Content = $scope.recod.start_reason;
            if ($scope.recod.start_kind == "2") {//SaveGuest
                note.IsNeedConfirm = false;
                dateObj.confirm = "NO"
            }
            else {
                note.IsNeedConfirm = true;
                dateObj.confirm = "YES"
            }
            note.GuestType = $scope.recod.start_kind;
            note.Region = $scope.recod.start_area;
            var employeeID = $scope.recod.start_code;

            note.Respondent = employeeID.toUpperCase();
            note.DepartmentSpc = $scope.recod.DepartmentSpc;
            note.ExtNO = $scope.recod.start_phone;
            note.Enterprise = $scope.recod.start_company;
            note.ExpectIn = $scope.recod.start_date;
            note.UserID = Auth.username;
            note.Status = "N";
            for(var i = 0;i<$scope.guestItems.length;i++){
                if($scope.guestItems[i].IdCard == "" || !$scope.guestItems[i].IdCard){
                    $scope.guestItems[i].IdCard = i;
                }
            }
            note.GuestItems = $scope.guestItems;
            note.ExpectOutTime = $scope.recod.ExpectOutTime;
            note.VehicleNo = $scope.recod.VehicleNo;


            dateObj.note = note;

            return dateObj;
        };

        $scope.modalCancel =function () {
            var dateObj = saveInit();
            var note = dateObj.note;
            SaveGuest(note, function (voucherid, message) {
                if (voucherid) {
                    $scope.recod.start_voucherid = voucherid;
                    Notifications.addMessage({'status': 'information', 'message': $translate.instant('saveSuccess')});
                    SearchList(1, 50);
                    document.getElementById("EmployeeName").readOnly = true;
                    document.getElementById("EmployeeID").readOnly = false;
                    $('#messageModal').modal('hide');
                    $('#nextModalGateGuest').modal('hide');
                    $('#myModal').modal('hide');
                    $('#nextModal').modal('hide');
                } else {
                    Notifications.addError({'status': 'error', 'message': $translate.instant('saveError') + message});
                }
            })

        }
        $scope.modalSubmit =function (){

                var dateObj = saveInit();
                var note = dateObj.note;

                var subject="Your Guest checked in";
                var listguesttext="";
                var body=' <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
                        '<style>'+
                        ' body { font-family: "Hiragino Sans GB","微软雅黑"; }  </style> </head> <body style="margin: 0; padding: 0;"><div>Dear Mr/Mrs/Miss, </div>'+
                        '<div></div>'+
                        ' List guest checked in at Security room:';
                note.Status = "F";
                var mail="";
                var listguest=[];
                var listguestabsent="";
                var outputdate = moment($scope.recod.start_date).add(1, 'days').format('YYYY-MM-DD');
                var kinds = $scope.recod.start_area + "|" + $scope.recod.start_kind;
                GateGuest.GuestBasic().getEmail({UserID: Auth.username}).$promise.then(function (res) {
                    for (var i = 0; i < res.length; i++) {
                        mail= res[i].Email;

                    }
                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });

                GateGuest.GetGateCheckers().getCheckers({
                    owner: Auth.username,
                    fLowKey: "FEPVGateGuest",
                    Kinds: kinds,
                    CheckDate: $scope.recod.start_date
                }).$promise.then(function (res) {
                            var leaderList = [];
                            for (var i = 0; i < res.length; i++) {
                                leaderList[i] = res[i].Person;
                                console.log('Leader List: '+ leaderList[i])
                            }
                            if (leaderList.length <= 0 && dateObj.confirm != "NO") {
                                Notifications.addError({'status': 'error', 'message': $translate.instant('leaderError')});
                                return
                            } else {
                                $scope.formVariables.push({name: "GuestChecherArray", value: leaderList});
                                $scope.formVariables.push({name: "start_endDate", value: outputdate});
                                $scope.formVariables.push({name: "IsChecker", value: dateObj.confirm});
                                $scope.formVariables.push({name: "start_confirm", value: dateObj.confirm});
                                $scope.formVariables.push({name: "start_area", value: $scope.recod.start_area});
                                $scope.formVariables.push({name: "JWUser", value: "Guard"});

                                if (SaveGuest(note, function (voucherid, errormsg) {
                                            if (errormsg) {
                                                Notifications.addError({'status': 'error', 'message': errormsg});
                                            } else {
                                                $scope.formVariables.push({name: "VoucherID", value: voucherid});
                                                // $scope.formVariables.push({name: "email_to", value: mail});
                                                console.log('MAIL: '+ mail)
                                                // $scope.formVariables.push({name: "email_subject", value: subject});
                                                var RespondentName=[];

                                                GateGuest.GuestBasic().getGuestInfo({UserID: Auth.username, VoucherID:voucherid}).$promise.then(function (res) {

                                                    for (var i = 0; i < res.length; i++) {
                                                        listguest[i] = res[i].Name;
                                                        if (RespondentName.indexOf(res[i].RespondentName)=== -1) {
                                                            RespondentName.push(res[i].RespondentName);

                                                        }

                                                        listguesttext +='</br>'+'- '+ listguest[i];
                                                    }

                                                    body +=listguesttext +'</br> Respondent Name: '+ RespondentName+
                                                    '</b></br><b>Please confirm voucher before your Guest leave factory.</b></br>Thanks'+
                                                    '<footer> <div>Best Regards</div></footer>'+
                                                    ' </body></html>';



                                                    // $scope.formVariables.push({name: "email_text", value: body});
                                                    $scope.submitBykey(voucherid, function (submitres) {
                                                        if (submitres.status == "info") {

                                                            if (submitres.message) {

                                                                var queryObject = {processInstanceId: submitres.message};
                                                                EngineApi.getTasks().query(queryObject).$promise.then(function (nextres) {

                                                                    $scope.nexttasks = nextres;
                                                                    SearchList(1, 50);
                                                                    document.getElementById("EmployeeName").readOnly = true;
                                                                    document.getElementById("EmployeeID").readOnly = false;
                                                                    $('#messageModal').modal('hide');
                                                                    $('#nextModalGateGuest').modal('hide');
                                                                    $('#myModal').modal('hide');

                                                                }, function (errormessage) {
                                                                    Notifications.addError({
                                                                        'status': 'error',
                                                                        'message': errormessage
                                                                    });
                                                                });

                                                            } else {
                                                                Notifications.addError({
                                                                    'status': 'error',
                                                                    'message': "NO PID"
                                                                });
                                                            }
                                                        } else {
                                                            Notifications.addError({
                                                                'status': 'error',
                                                                'message': submitres.message
                                                            });
                                                        }
                                                    });
                                                });
                                            }

                                        }));
                            }

                        }, function (errormessage) {
                            Notifications.addError({'status': 'error', 'message': errormessage});
                        })




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


        $scope.savesubmit = function () {
            var kinds = $scope.recod.start_area + "|" + $scope.recod.start_kind;

            if( $scope.recod.start_area=='1'){
                GateGuest.GuestBasic().checkUserBelongDyeing({
                    EmployeeID: Auth.username
                }).$promise.then(function (res) {

                            if(res[0].DepartmentID.substr(0,3)=='513'||res[0].DepartmentID.substr(0,3)=='519'||res[0].DepartmentID.substr(0,3)=='511'||res[0].DepartmentID.substr(0,3)=='510') {
//                                if (res[0].DepartmentID.substr(0, 3) == '511') {
//                                    $scope.EmployeeID = 'FEPVNN0003';
//                                    $scope.EmployeeName = '徐廷威';
//                                } else {
//                                    $scope.EmployeeID = 'FEPVNN0023';
//                                    $scope.EmployeeName = '叶铭昱';
//                                }
                                GateGuest.GetGateCheckers().getCheckers({
                                    owner: Auth.username,
                                    fLowKey: "FEPVGateGuest",
                                    Kinds: kinds,
                                    CheckDate: $scope.recod.start_date
                                }).$promise.then(function (res) {
                                            var leaderList = [];
                                            asyncLoop(res[0].Person.split(',').length, function (loop) {
                                                        EngineApi.getMemberInfo().get({userid: res[0].Person.split(',')[loop.iteration()]}, function (ress) {

                                                            console.log(ress.Name);
                                                            leaderList.push(res[0].Person.split(',')[loop.iteration()] + ' -- ' + ress.Name)

                                                            loop.next();
                                                        });
                                                    },
                                                    function () {

                                                    });
                                            $scope.listleadercheck=leaderList;
                                        }, function (errormessage) {
                                            Notifications.addError({'status': 'error', 'message': errormessage});
                                        })
                                console.log('List of leader checker: '+ $scope.listleadercheck);
                                $('#messageModal').modal('show');
                            }
                            else if(res[0].DepartmentID.substr(0,3)=='512'){
                                GateGuest.GetGateCheckers().getCheckers({
                                    owner: Auth.username,
                                    fLowKey: "FEPVGateGuest",
                                    Kinds: kinds,
                                    CheckDate: $scope.recod.start_date
                                }).$promise.then(function (res) {
                                            var leaderList = [];
                                            asyncLoop(res[0].Person.split(',').length, function (loop) {
                                                        EngineApi.getMemberInfo().get({userid: res[0].Person.split(',')[loop.iteration()]}, function (ress) {

                                                            console.log(ress.Name);
                                                            leaderList.push(res[0].Person.split(',')[loop.iteration()] + ' -- ' + ress.Name)

                                                            loop.next();
                                                        });
                                                    },
                                                    function () {

                                                    });
                                            $scope.listleadercheck=leaderList;
                                        }, function (errormessage) {
                                            Notifications.addError({'status': 'error', 'message': errormessage});
                                        })
                                $scope.showMessageModal='';
                                $('#messageModal').modal('show');


                            }
                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });


            }
            else{
                var dateObj = saveInit();
                var note = dateObj.note;

                var subject="Your Guest checked in";
                var listguesttext="";
                var body=' <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'+
                        '<style>'+
                        ' body { font-family: "Hiragino Sans GB","微软雅黑"; }  </style> </head> <body style="margin: 0; padding: 0;"><div>Dear Mr/Mrs/Miss, </div>'+
                        '<div></div>'+
                        ' List guest checked in at Security room:';
                note.Status = "F";
                var mail="";
                var listguest=[];
                var listguestabsent="";
                var outputdate = moment($scope.recod.start_date).add(1, 'days').format('YYYY-MM-DD');
                var kinds = $scope.recod.start_area + "|" + $scope.recod.start_kind;
                GateGuest.GuestBasic().getEmail({UserID: Auth.username}).$promise.then(function (res) {
                    for (var i = 0; i < res.length; i++) {
                        mail= res[i].Email;

                    }
                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });

                GateGuest.GetGateCheckers().getCheckers({
                    owner: Auth.username,
                    fLowKey: "FEPVGateGuest",
                    Kinds: kinds,
                    CheckDate: $scope.recod.start_date
                }).$promise.then(function (res) {

                                var leaderList = [];
                                asyncLoop(res[0].Person.split(',').length, function (loop) {
                                            EngineApi.getMemberInfo().get({userid: res[0].Person.split(',')[loop.iteration()]}, function (ress) {

                                                console.log(ress.Name);
                                                leaderList.push(res[0].Person.split(',')[loop.iteration()] + ' -- ' + ress.Name)

                                                loop.next();
                                            });
                                        },
                                        function () {

                                        });
                            $scope.showMessageModal='';
                                $scope.listleadercheck=leaderList;
                            }, function (errormessage) {
                                Notifications.addError({'status': 'error', 'message': errormessage});
                            })
                            console.log('List of leader checker: '+ $scope.listleadercheck);
                            $('#messageModal').modal('show');


            }


        };

        function SaveGuest(note, callback) {
            GateGuest.SaveGuest().save(note).$promise.then(function (res) {
                var voucherid = res.VoucherID;
                if (voucherid) {
                    $scope.recod.start_voucherid = voucherid;
                    callback(voucherid, "")

                } else {
                    callback(voucherid, $translate.instant('saveError'))
                }
            }, function (errormessage) {
                callback("", errormessage)
            });
        }

        $scope.saveDraft = function () {
            var dateObj = saveInit();
            var note = dateObj.note;
            SaveGuest(note, function (voucherid, message) {
                if (voucherid) {
                    $scope.recod.start_voucherid = voucherid;
                    Notifications.addMessage({'status': 'information', 'message': $translate.instant('saveSuccess')});
                } else {
                    Notifications.addError({'status': 'error', 'message': $translate.instant('saveError') + message});
                }
            })

        };
        $scope.returnBack = function () {
            document.getElementById("Search").style.display = "";
            document.getElementById("detailView").style.display = "none";
            historyurl = "";
        };
        //修改
        $scope.getVoucher = function (obj) {

            GateGuest.GuestBasic().getGuest({
                VoucherID: obj.entity.VoucherID,
                Language: lang
            }).$promise.then(function (res) {
                        console.log(res);
                        if (res[0].Status == "N" || !res[0].Status) {
                            if (res[0].UserID == Auth.username) {
                                $scope.recod.start_kind = res[0].GuestType;
                                $scope.recod.start_code = res[0].Respondent;
                                $scope.recod.start_area = res[0].Region;
                                $scope.recod.start_phone = res[0].ExtNO;
                                $scope.recod.start_company = res[0].Enterprise;

                                $scope.recod.start_date = res[0].ExpectIn;
                                $scope.guestItems = res[0].GuestItems;
                                $scope.recod.start_reason = res[0].Content;
                                $scope.recod.start_voucherid = res[0].VoucherID;

                                $('#myModal').modal('show');
                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('creatorError')
                                });
                            }
                        } else {
                            console.log('TEST: '+ $scope.recod.start_date);
                            console.log('TESTSSSS: '+ res[0].ExpectOutTime);
                            $scope.details = res[0];
                            //  $scope.details
                            $scope.details.Status = $scope.getVoucherStatus($scope.details.Status);
                            $scope.details.GuestType = $scope.getVoucherGuestType($scope.details.GuestType);
                            $scope.details.Region = $scope.getVoucherRegion($scope.details.Region);
                            //$scope.details.ExpectIn=res[0].ExpectIn;
                            $scope.details.ExpectOutTime=res[0].ExpectOutTime;
                            $scope.detailsGuestItems = res[0].GuestItems;
                            $scope.details.VehicleNo = res[0].VehicleNo;
                            Notifications.addError({'status': 'error', 'message': $translate.instant('draftError')});
                            document.getElementById("detailView").style.display = "";
                            document.getElementById("Search").style.display = "none";
                            GateGuest.GetGateGuestPID().get({
                                VoucherID: obj.entity.VoucherID,
                                activityName: "StartEvent_Create"
                            }).$promise.then(function (res) {
                                        historyurl = "#/processlog/" + res.ProcessInstanceId;
                                        $scope.$emit('historyurl', historyurl);
                                    }, function (errormessage) {
                                        console.log(errormessage);
                                        //  Notifications.addError({'status': 'error', 'message': errormessage});
                                    });
                        }

                    }, function (errormessage) {
                        Notifications.addError({'status': 'error', 'message': errormessage});
                    });


        };

        $scope.change = function(){
            console.log('TEST: '+$scope.getVoucherRegion($scope.recod.start_area));
            if($scope.recod.start_area=='1'){
                Notifications.addWarning({'status': 'warning', 'message': $translate.instant('saveSuccess')});
            }else{

            }
        }

        //贵宾的生成
        $scope.produce = function () {
            if (!$scope.GuestNumber) {
                return;
            }
            else {
                if ($scope.GuestNumber > 100) {
                    Notifications.addError({'status': 'error', 'message': $translate.instant('msg_itemNum') + message});
                } else {
                    $scope.guestItems = [];
                    for (var i = 0; i < $scope.GuestNumber; i++) {
                        var j = i + 1;
                        $scope.items = {};
                        $scope.items.GuestName = "Guest" + j;
                        $scope.items.IdCard = "IdCard";
                        $scope.guestItems.push($scope.items);
                    }
                }
            }
        };
        $scope.searchEmployeeInfo = function () {
            if (document.getElementById("EmployeeName").readOnly != false) {
                document.getElementById("EmployeeName").readOnly = false;
                document.getElementById("EmployeeID").readOnly = true;
                $scope.recod.start_code = "";
            }
            else {
                document.getElementById("EmployeeID").readOnly = false;
                document.getElementById("EmployeeName").readOnly = true;
            }
        }
        $scope.checkErr = function() {
            var startDate = $scope.recod.start_date;
            var endDate = $scope.recod.ExpectOutTime;
            $scope.errMessage = '';
            if(new Date(startDate) > new Date(endDate)){
                $scope.errMessage = 'End Date should be greater than Start Date';
                Notifications.addError({'status': 'error', 'message':  $scope.errMessage});
                document.getElementById("btnSaveDraft").disabled = true;
                document.getElementById("btnSubmit").disabled = true;
                $scope.$apply();
                return;
            }else
            {
                document.getElementById("btnSaveDraft").disabled = false;
                document.getElementById("btnSubmit").disabled = false;
            }

        };
        $scope.setEndDate= function(){
            $scope.recod.ExpectOutTime = $filter('date')(new Date($scope.recod.start_date),'yyyy-MM-dd 17:00');
            $scope.$apply();

        };
        $scope.setdateTo = function()
        {
            $scope.dateTo = $filter('date')(new Date($scope.dateFrom),'yyyy-MM-dd');
            $scope.$apply();
        }
    }
