/**
 * Created by wang.chen on 2016/9/1.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("PtaEgTruckController", ['$rootScope','$scope', 'EngineApi','$routeParams', '$http', '$timeout', 'Notifications', '$upload', '$compile', '$filter', 'Auth', '$resource', 'uiGridConstants', '$location', 'Forms', 'GatePtaEg', 'GateGuest', 'GateJointTruck', '$translate','NewGuest',
        function ($rootScope,$scope, EngineApi, $http, $timeout,$routeParams, Notifications, $upload, $compile, $filter, Auth, $resource, uiGridConstants, $location, Forms, GatePtaEg, GateGuest, GateJointTruck, $translate,NewGuest) {
            $scope.onlyOwner = true;

            $scope.dateFrom = $filter('date')(new Date(), "yyyy-MM-dd");
            $scope.dateTo = $filter('date')(new Date(), "yyyy-MM-dd");
            $scope.flowkey="FEPVPtaEgTruck";
           // $scope.minDate = "2017-01-01"
            $scope.getHref = function (grid, row) {
                window.open('#/gate/PtaEgTruck/' + row.entity.VoucherID);
            }

                    $scope.bpmnloaded=false;
            $scope.showPng = function () {
                if ($scope.bpmnloaded == true) {
                    $scope.bpmnloaded = false;
                } else {
                    $scope.bpmnloaded = true;
                }
            }


            var lang = window.localStorage.lang;




            $scope.$watch("note.VehicleNO", function (n) {
                if (n !== undefined && $scope.note.VehicleNO !== null) {

                        if(n.length > 5){
                            GatePtaEg.GatePtgEgTruckBasic().getPtaEgTruckByVehicleNO({
                                VehicleNO: $scope.note.VehicleNO,//$scope.note.VehicleNO,
                                CType: "PtaEgTruck",
                                Language: window.localStorage.lang || ""
                            }).$promise.then(function (data) {

                                    if(data.length>0) {
                                        console.log(data)
                                        $scope.note.Manufacturer = data[0]["Manufacturer"];
                                        $scope.note.LinkMan = data[0]["ContactMan"];
                                        $scope.note.LinkPhone = data[0]["ContactPhone"];

                                        $scope.note.PtaEg = {"ID":data[0]["ID"],"Spec":data[0]["Spec"]}; // {"ID":data[0]["ID"],"Lan":"VN","Spec":data[0]["Spec"],"Ctype":"PtaEgTruck"}
                                        data = null;
                                    }

                                }, function (err) {
                                    Notifications.addError({'status': 'error', 'message': err})
                                });

                        }else{
                            $scope.VehicleNO = "";
                        }


                }
            });

            GateGuest.GetQueryStatus().get({ctype: 'Truck', language: lang, flag: '1'}).$promise.then(function (res) {
                $scope.StatusList = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            $scope.getVoucherStatus = function (obj) {

                if(obj.entity.WeightLogs !='False'){
                    return $translate.instant("Weighted");
                }
                var Status = obj.entity.Status;
                var statLen = $filter('filter')($scope.StatusList, {"Status": Status});
                if (statLen.length > 0) {
                    return statLen[0].Remark;
                } else {
                    return Status;
                }
            };
            $scope.getVoucherMaterial = function (ID) {
                var statLen = $filter('filter')($scope.material, {"ID": ID});
                if (statLen.length > 0) {
                    return statLen[0].Spec;
                } else {
                    return ID;
                }
            };
            var col = [{
                field: 'VoucherID',
                displayName: $translate.instant("VoucherID"),
                minWidth: 180,
                cellTooltip: true,
                cellTemplate: "<a href='javascript:;' target='_blank' ng-click='grid.appScope.getHref(grid, row)'>{{COL_FIELD}}</a>"
            },
                /*   {field: 'Status', displayName: '状态说明', minWidth: 80, cellTooltip: true},*/
                {
                    field: 'StatusSpec',
                    displayName: $translate.instant("Status"),
                    minWidth: 100,
                    cellTemplate: '<span  >{{grid.appScope.getVoucherStatus(row)}}</span>',
                    cellTooltip: true
                },
                {field: 'OrderNo', displayName: $translate.instant("OrderNO"), minWidth: 200, cellTooltip: true},
                {field: 'VehicleNO', displayName: $translate.instant("VehicleNO"), minWidth: 80, cellTooltip: true},
                {field: 'Manufacturer', displayName: $translate.instant("Company"), minWidth: 80, cellTooltip: true},
                {field: 'ExpectIn', displayName: $translate.instant("ExpectedIn"), minWidth: 180, cellTooltip: true},
                {field: 'ValidatePeriod', displayName: $translate.instant("ValidTo"), minWidth: 180, cellTooltip: true},
                {field: 'LinkMan', displayName: $translate.instant("LinkMan"), minWidth: 80, cellTooltip: true},
                {field: 'LinkPhone', displayName: $translate.instant("LinkPhone"), minWidth: 80, cellTooltip: true},
                {
                    field: 'PtaEg',
                    displayName: $translate.instant("Material"),
                    minWidth: 100,
                    cellTooltip: true,
                    cellTemplate: '<span  >{{grid.appScope.getVoucherMaterial(row.entity.PtaEg)}}</span>'
                },
                {field: 'Stamp', displayName: $translate.instant("Stamp"), minWidth: 180, cellTooltip: true},
                {field: 'Remark', displayName: $translate.instant("Remark"), minWidth: 180, cellTooltip: true},
                {field: 'Status', displayName: $translate.instant("Status"), minWidth: 80, cellTooltip: true},
                {field: 'UserID', displayName: $translate.instant("UserID"), minWidth: 80, cellTooltip: true}
            ];
            GateGuest.GetQueryStatus().get({ctype: 'Truck', language: lang, flag: '1'}).$promise.then(function (res) {
                $scope.StatusList = res
                console.log(res)

            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });

            var paginationOptions = {
                pageNumber: 1,
                pageSize: 20,
                sort: null
            };

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
                paginationPageSizes: [20, 40, 200, 500],
                paginationPageSize: 20,
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,

                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({"userid": Auth.username, "tcode": $scope.flowkey}, function (linkres) {
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
                        getPage();
                    });
                }
            };
            var gridMenu= [{
                title: $translate.instant("Create"),
                action: function ($event) {
                    $('#myModal').modal('show');
                },
                order: 1
            },{
                    title: $translate.instant("AddGuest"),
                    action: function($event) {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                        if(resultRows.length < 1){
                            Notifications.addMessage({'status': 'information', 'message': "Please Select VoucherID!"});
                            return;
                        }
                    $('#myGuestModal').modal('show');
                    $rootScope.guestItems.length = 0;
                    $rootScope.recod.start_code = Auth.username;
                    $rootScope.recod.start_date = resultRows[0].ExpectIn;
                    $rootScope.recod.VehicleNo = resultRows[0].VehicleNO;
                    $rootScope.recod.ExpectOutTime =$filter('date')(new Date(resultRows[0].ExpectIn),'yyyy-MM-dd 17:00');
                    $rootScope.recod.start_phone = resultRows[0].LinkPhone;
                    $rootScope.recod.start_company = resultRows[0].Manufacturer;
                    $rootScope.recod.start_reason = $translate.instant("FEPVPtaEgTruck")+"-"+$rootScope.kind[1].GuestType;
                    },
                    order: 2

                },{
                title: $translate.instant("Delete"),
                order: 3,
                icon: 'ui-grid-icon-cancel',
                action: function () {
                    var selectRows = $scope.gridApi.selection.getSelectedGridRows();
                    var delvehicleNO = selectRows[0].entity.VehicleNO;
                    var delVoucherid = selectRows[0].entity.VoucherID;
                    if (confirm(delVoucherid + '|' + delvehicleNO + $translate.instant("Delete_IS_MSG"))) {
                        GatePtaEg.GatePtgEgTruckBasic().deletePtaEgTruck({
                            userId: Auth.username,
                            voucherId: delVoucherid
                        }, {}).$promise.then(function (res) {
                                if (res.msg) {
                                    Notifications.addMessage({'status': 'error', 'message': res});
                                } else {
                                    searchlist();
                                    Notifications.addMessage({
                                        'status': 'info',
                                        'message': $translate.instant("Delete_Succeed_Msg")
                                    });

                                }

                            }, function (errResponse) {
                                Notifications.addError({'status': 'error', 'message': errResponse});
                            });
                    }
                }
            }];

            $scope.addGuest = function(){
                $('#myGuestModal').modal('show');
                $rootScope.recod.start_code = Auth.username;
                $rootScope.guestItems.length = 0;
                $rootScope.recod.start_date = $scope.note.ExpectIn;
                $rootScope.recod.ExpectOutTime =$filter('date')(new Date($scope.note.ExpectIn),'yyyy-MM-dd 17:00');
                $rootScope.recod.VehicleNo = $scope.note.VehicleNO;
                $rootScope.recod.start_phone = $scope.note.LinkPhone;
                $rootScope.recod.start_company = $scope.note.Manufacturer;
                $rootScope.recod.start_reason = $translate.instant("FEPVPtaEgTruck")+"-"+$rootScope.kind[1].GuestType;

                $scope.reset();
            };

            function searchlist() {

                getPage();
            }

            $scope.Search = function () {
                searchlist();
            };
            var getPage = function () {
                var query = {};
                query.userID = "";
                if ($scope.onlyOwner == true) {
                    query.userID = Auth.username;
                }
                query.PageIndex = paginationOptions.pageNumber || "1";
                query.PageSize = paginationOptions.pageSize || "20";
                query.des = "";
                query.voucherID = $scope.VoucherID || "";
                query.status = $scope.status || "";
                query.manufacturer = $scope.Manufacturer || "";
                query.dateFrom = $scope.dateFrom || "";
                query.dateTo = $scope.dateTo || "";
                GatePtaEg.GatePtgEgTruckBasic().getPtaEgTrucks(query).$promise.then(function (res) {
                    $scope.gridOptions.data = res.TableData;
                    $scope.gridOptions.totalItems = res.TableCount[0];

                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });
            };
            //model
            var formVariables = [];
            var historyVariable = [];
            var variablesMap = {};
            var today = new Date();today.setMonth(today.getMonth()+2);
          // $scope.maxDate = new Date(today.getFullYear(),today.getMonth()+2 , today.getDate());
      //     $scope.disabled = function(date, mode) {
         //       return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
          // };
            $scope.note = {};
            $scope.note.ExpectIn = $filter('date')(new Date(), "yyyy-MM-dd");
            $scope.note.ValidatePeriod = $filter('date')(new Date(), "yyyy-MM-dd");
    //        var nextDay = new Date($scope.today);
    //          nextDay.setDate($scope.today.getDate()+7);

          // var newMinDate = new Date();
          //var newMinDate = newMinDate.getFullYear().toString()+'/' + (newMinDate.getMonth()2)+'/'+ newMinDate.getDaysInMonth() ;
          // $scope.minDate = newMinDate;
            var newMaxDate=new Date();
            newMaxDate=newMaxDate.getFullYear().toString()+'/'+(newMaxDate.getMonth()+2)+'/'+newMaxDate.getDaysInMonth();
            console.log(newMaxDate);
            $scope.maxDate=newMaxDate;

            GatePtaEg.GatePtgEgTruckBasic().getPtaEgTypes({
                Language: lang,
                Type: "PtaEgTruck"
            }).$promise.then(function (res) {
                $scope.material = res;

            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            $scope.savesubmit = function () {
                GateJointTruck.JointTruckBasic().isInBlackList({
                    vehicle: $scope.note.VehicleNO,
                    type: "Truck"
                }).$promise.then(function (res) {
                        if (res.msg) {
                            Notifications.addError({'status': 'error', 'message': res.msg});
                            return
                        }
                        else {

                            var query = {};
                            query = $scope.note;
                            query.OrderNO = $scope.note.OrderNO || "";
                            query.UserID = Auth.username;
                            query.Status = "N";
                            query.PtaEg= $scope.note.PtaEg.ID;
                            if (res.msg == "") {
                                if($scope.note.VoucherID != "" && $scope.note.VoucherID != undefined){
                                    Notifications.addMessage({'status': 'information', 'message': "VoucherID Already Exist.Please Create New Voucher!"});
                                    return;
                                }
                                GatePtaEg.GatePtgEgTruckBasic().savePtaEgTruck(query).$promise.then(function (res) {
                                    var voucherid = res.VoucherID;
                                    $scope.note.VoucherID = voucherid;
                                    if (voucherid) {
                                        formVariables.push({name: "IsChecker", value: "NO"});//不签核
                                        formVariables.push({name: "ChecherArray", value: ["cassie"]});
                                        formVariables.push({
                                            name: "start_remark",
                                            value: voucherid + " " + $scope.note.VehicleNO
                                        });
                                        formVariables.push({name: "VoucherID", value: voucherid});
                                        historyVariable.push({name: "VehicleNO", value: $scope.note.VehicleNO});
                                        historyVariable.push({name: "Models", value: $scope.note.PtaEg});
                                        historyVariable.push({name: "ExpectedIn", value: $scope.note.ExpectIn});
                                        historyVariable.push({name: "ValidTo", value: $scope.note.ValidatePeriod});
                                        historyVariable.push({name: "LinkMan", value: $scope.note.LinkMan});
                                        getFlowDefinitionId($scope.flowkey, function (FlowDefinitionId) {
                                            if (FlowDefinitionId) {
                                                //  Notifications.addMessage({'status': 'information', 'message': "保存成功:"+ reportid });
                                                startflowid(FlowDefinitionId, voucherid);
                                                Notifications.addMessage({
                                                    'status': 'information',
                                                    'message': "Submit Succeed"
                                                });
                                                return;
                                            } else {
                                                Notifications.addError({
                                                    'status': 'error',
                                                    'message': "Achieve Process Error"
                                                });
                                                return;
                                            }
                                        })
                                    }

                                }, function (errResponse) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': errResponse
                                    });
                                });
                            }
                            else {
                                Notifications.addError({'status': 'error', 'message': res.msg});
                            }


                        }
                    },
                    function (errResponse) {

                        Notifications.addError({'status': 'error', 'message': errResponse});
                    });
            }
            function reload() {
                $('#myModal').modal('hide');
               // $('#nextModal').modal('hide');
                searchlist();
                formVariables = [];
                historyVariable = [];
                variablesMap = {};
                $scope.note = {};

                $scope.note.ExpectIn = $filter('date')(new Date(), "yyyy-MM-dd");
            }

            $scope.reset = function () {
                reload();
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
                            'status': 'error',
                            'message': res.message
                        });
                        return;
                    }
                    if (!res.result) {
                        Notifications.addMessage({
                            'status': 'error',
                            'message': res.message
                        });
                    } else {
                        var result = res.result;
                        console.log(result);
                        // reload();
                        Notifications.addMessage({
                            'status': 'information',
                            'message': "Submit Succeed"
                        });

                        // $location.url("/taskForm/" + res.url);
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
        }]);
});
