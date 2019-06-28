/**
 * Created Common Truck ,it can by Container ,input creating
 * it can add guest when create  plan finished
 *
 */

define(['myapp', 'controllers/Gate/UnJointTruckContianer', 'controllers/Gate/UnJointTruckVoucher', 'controllers/Gate/GuestUserController', 'angular'], function (myapp, angular) {
    myapp.controller('UnJointTruckController', ['$rootScope', '$scope', '$filter', '$http', '$compile',
        '$routeParams', '$resource', '$location', '$interval', 'Notifications', 'Forms', 'Auth',
        'uiGridConstants', 'EngineApi', 'GateUnJointTruck', 'GateGuest', 'GateJointTruck', '$translate', '$q',
        function ($rootScope, $scope, $filter, $http, $compile, $routeParams, $resource,
                  $location, $interval, Notifications, Forms, Auth, uiGridConstants, EngineApi, GateUnJointTruck, GateGuest, GateJointTruck, $translate, $q) {
            $scope.onlyOwner = true;
            $scope.bpmnloaded = false;
            $scope.isContainerEdit = false;
                $scope.dateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.dateTo = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.username = Auth.username;
            $scope.LineMan = Auth.username + '-' + Auth.nickname;
            $scope.workflow = 'FEPVUnJointTruck';
            $scope.SpecialUser = false;
            $scope.isNormalUser = false;
            var VehicleTypes = 'UnJointTruck';
            var lang = window.localStorage.lang || 'EN';

            function loadOldContainer() {
                var deferred = $q.defer();
                GateUnJointTruck.UnJointTruckBasic().getOldContainerNO({Userid: $scope.username}).$promise.then(function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }

            function loadShapesData() {
                var deferred = $q.defer();
                GateUnJointTruck.UnJointTruckBasic().getVehicleTypes({
                    Language: lang,
                    Type: VehicleTypes
                }).$promise.then(function (res) {
                        deferred.resolve(res);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            }

            function loadStatus() {
                var deferred = $q.defer();
                GateGuest.GetQueryStatus().get({
                    ctype: 'Truck',
                    language: lang,
                    flag: '1'
                }).$promise.then(function (res) {
                        deferred.resolve(res);
                        //$scope.StatusList = res;
                    }, function (errResponse) {
                        deferred.reject(errResponse);
                    });
                return deferred.promise;
            }

            $q.all([loadShapesData(), loadStatus()]).then(function (results) {
                var Shapes = results[0];
                $scope.StatusList = results[1];
                $scope.Shape = Shapes;
                $scope.Shapes = [];


                for (var i = 0; i < Shapes.length; i++) {
                    if (Shapes[i].ID !== '19') {
                        $scope.Shapes.push(Shapes[i]);
                    }
                }
            }, function (error) {
                Notifications.addError({'status': 'Failed', 'message': 'Loading failed: ' + error});
            });
            var col = [
                {
                    field: 'VoucherID', displayName: $translate.instant('VoucherID'), minWidth: 120, cellTooltip: true,
                    cellTemplate: '<a href="#/gate/UnJointTruck/{{COL_FIELD}}" target="_blank">{{COL_FIELD}}</a>'
                },
                {
                    field: 'StatusSpec',
                    displayName: $translate.instant('Status'),
                    enableCellEdit: false,
                    minWidth: 100,
                    cellTemplate: '<span  >{{grid.appScope.getVoucherStatus(row.entity.Status)}}</span>',
                    cellTooltip: true
                },
                {
                    field: 'VehicleType',
                    displayName: $translate.instant('Models'),
                    enableCellEdit: false,
                    minWidth: 100,
                    cellTooltip: true,
                    cellTemplate: '<span  >{{grid.appScope.getVoucherModels(row.entity.VehicleType)}}</span>'
                },
                {
                    field: 'VehicleNO',
                    displayName: $translate.instant('VehicleNO')
                    , minWidth: 80, cellTooltip: true
                },
                {
                    field: 'Container',
                    displayName: $translate.instant('New Container'),
                    enableCellEdit: false,
                    minWidth: 120,
                    cellTooltip: true
                },
                {
                    field: 'StorageNO',
                    displayName: $translate.instant('StorageNO'),
                    enableCellEdit: false,
                    minWidth: 80,
                    cellTooltip: true
                },
                {
                    field: 'Manufacturer',
                    displayName: $translate.instant('Company'),
                    enableCellEdit: false,
                    minWidth: 120,
                    cellTooltip: true
                },
                {
                    field: 'OrderNO',
                    displayName: $translate.instant('OrderNO'),
                    enableCellEdit: false,
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'PO',
                    displayName: $translate.instant('PO_NO'),
                    enableCellEdit: false,
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'Material',
                    displayName: $translate.instant('Material'),
                    enableCellEdit: false,
                    minWidth: 120,
                    cellTooltip: true
                },
                {
                    field: 'ExpectIn',
                    displayName: $translate.instant('ExpectedIn'),
                    enableCellEdit: false,
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'ValidatePeriod',
                    displayName: $translate.instant('ValidTo'),
                    enableCellEdit: false,
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'LinkMan',
                    displayName: $translate.instant('LinkMan'),
                    enableCellEdit: false,
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'LinkPhone',
                    displayName: $translate.instant('LinkPhone'),
                    enableCellEdit: false,
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'FirstTime',
                    displayName: $translate.instant('FirstTime'),
                    enableCellEdit: false,
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'FirstWeight',
                    displayName: $translate.instant('FirstWeight'),
                    enableCellEdit: false,
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'SecondTime',
                    displayName: $translate.instant('SecondTime'),
                    enableCellEdit: false,
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'SecondWeight',
                    displayName: $translate.instant('SecondWeight'),
                    enableCellEdit: false,
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'UserID',
                    displayName: $translate.instant('UserID'),
                    enableCellEdit: false,
                    minWidth: 80,
                    cellTooltip: true
                },
                {
                    field: 'Remark',
                    displayName: $translate.instant('Remark'),
                    enableCellEdit: false,
                    minWidth: 80,
                    cellTooltip: true
                },
                {
                    field: 'Status',
                    displayName: $translate.instant('Status'),
                    enableCellEdit: false,
                    minWidth: 80,
                    cellTooltip: true
                }
            ];

            /**
             * UnJointTruck WorkFlow key
             */
            function loadDefineKey() {
                var deferred = $q.defer();
                EngineApi.getKeyId().getkey({'key': $scope.workflow}).$promise.then(function (FlowDefinition) {
                    if (FlowDefinition.id) {
                        deferred.resolve(FlowDefinition.id);
                    } else {
                        deferred.reject('get workflow key failed.');
                    }
                });
                return deferred.promise;
            }

            var paginationOptions = {
                pageNumber: 1,
                pageSize: 50,
                sort: null
            };
            function rowTemplate() {

                return '<div ng-dblclick="grid.appScope.doubleClick(row.entity)" style="cursor: pointer;" >' +
                    '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
                    '</div>';
            }
            $scope.gridOptions = {
                columnDefs: col,
                data: [],
                multiSelect: false,
                enableColumnResizing: true,
                enableColumnResize: true,
                enableCellEditOnFocus: true,
                enableSorting: true,
                showGridFooter: true,
                enableGridMenu: true,
                exporterMenuPdf: true,
                enableSelectAll: false,
                enableRowHeaderSelection: true,
                enableRowHashing: false,
                enableRowSelection: true,
                paginationPageSizes: [50, 100, 200, 500],
                paginationPageSize: 50,
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({
                        'userid': Auth.username,
                        'tcode': 'FEPVUnjointTruckContainer'
                    }, function (linkres) {
                        if (linkres.IsSuccess) {

                            $scope.SpecialUser = true;
                        }
                    });
                    EngineApi.getTcodeLink().get({
                        'userid': Auth.username,
                        'tcode': $scope.workflow
                    }, function (linkres) {
                        if (linkres.IsSuccess) {
                            /** IF have Auth and Get lastest workflow 's definition ID */
                            var keypromise = loadDefineKey();
                            keypromise.then(function (keyres) {
                                $scope.definitionID = keyres;
                                gridApi.core.addToGridMenu(gridApi.grid, gridMenu);
                                $scope.isNormalUser=true;
                                //gridApi.core.removeFromGridMenu(gridApi.grid, 'test');

                            }, function (error) {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': 'Get WORKFLOW KEY: ' + error.message
                                });
                            });
                        }
                    });
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.selectedVoucherid = row.entity.VoucherID;
                    });
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                        getPage();
                    });
                },
                rowTemplate: rowTemplate()

            };
            $scope.doubleClick = function (row) {
                GetModifyContainer(row);
            };
            var gridMenu = [
                {
                    title: $translate.instant('Container'),
                    action: function () {
                        $scope.cc = {};
                        $scope.Error = '';
                        $scope.query.OrderNO = '';
                        $scope.cc.LinkMan = $scope.LineMan;
                        $scope.cc.PO =''

                        $('#myModalContainer').modal('show');
                    },
                    order: 2,
                    id: 'Container'
                },
                {
                    title: $translate.instant('Create'),
                    action: function () {
                        $scope.note={};
                        $scope.ShowSave=true;
                        $('#myModal').modal('show');
                    },
                    order: 1,
                    id: 'Create'
                },
                {
                    title: $translate.instant('Update'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        console.log(resultRows);

                        if (resultRows.length == 1) {

                            GetModifyContainer(resultRows[0]);
                        } else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('Select_MSG')
                            });
                        }
                    },
                    order: 3,
                    id: 'Update'
                }, {
                    title: $translate.instant('Delete'),
                    icon: 'ui-grid-icon-cancel',
                    action: function () {
                        var selectRows = $scope.gridApi.selection.getSelectedGridRows();
                        var delvehicleNO = selectRows[0].entity.VehicleNO;
                        var delVoucherid = selectRows[0].entity.VoucherID;
                        if (confirm(delVoucherid + '|' + delvehicleNO + $translate.instant('Delete_IS_MSG'))) {
                            //get PID 
                            var pidPromise = GetPID(delVoucherid);
                            pidPromise.then(function (pidresult) {
                                if (pidresult.ProcessInstanceId) {
                                    $scope.pid = pidresult.ProcessInstanceId;
                                    //delete voucher id
                                    GateUnJointTruck.UnJointTruckBasic().deleteUnJointTruck({
                                        userId: Auth.username,
                                        voucherId: delVoucherid
                                    }, {}).$promise.then(function (res) {
                                            if (res.msg) {
                                                Notifications.addMessage({'status': 'error', 'message': res});
                                            } else {
                                                //delete Pid
                                                var deletepromise = DeletePID($scope.pid);
                                                deletepromise.then(function () {
                                                    Notifications.addError({
                                                        'status': 'information',
                                                        'message': 'DELETE Succeed'
                                                    });
                                                    getPage();
                                                }, function (reason) {
                                                    Notifications.addError({'status': 'error', 'message': reason});
                                                })
                                            }
                                        }, function (errormessage) {
                                            Notifications.addError({'status': 'error', 'message': errormessage});
                                        });
                                }
                            }, function (reason) {
                                Notifications.addError({'status': 'error', 'message': reason});
                            })
                        }
                    },
                    order: 5,
                    id: 'Delete'
                },
                {
                    title: $translate.instant('AddGuest'),
                    action: function ($event) {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        if (resultRows.length < 1) {
                            Notifications.addMessage({'status': 'information', 'message': 'Please Select VoucherID!'});
                            return;
                        }
                        $('#myGuestModal').modal('show');
                        $scope.SetGuest(resultRows[0].ExpectIn, resultRows[0].VehicleNO,
                            resultRows[0].LinkPhone, resultRows[0].Manufacturer);
                    },
                    order: 4,
                    id: 'AddGuest'
                },
            ];
            //
            /**
             * function control to show Modify method by row data
             * @param {*row data}
             */
            function GetModifyContainer(resultRows) {
                if (resultRows.VehicleType != '19') {
                    if (resultRows.Status == 'N' && resultRows.UserID == Auth.username) {
                        GateUnJointTruck.UnJointTruckBasic().unJointTruckByVoucherID({voucherid: resultRows.VoucherID}).$promise.then(function (res) {
                            $('#myModal').modal('show');
                            $scope.note = res;
                            $scope.note.ExpectIn = $filter('date')($scope.note.ExpectIn, 'yyyy-MM-dd');
                            $scope.note.ValidatePeriod = $filter('date')($scope.note.ValidatePeriod, 'yyyy-MM-dd');
                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });
                    } else {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('ModifyNotBelongUserID')
                        });

                    }
                }
                if (resultRows.VehicleType == '19') {
                    if (resultRows.Status != 'O') {

                        if ($scope.SpecialUser == true ||resultRows.UserID == Auth.username) {
                            if (resultRows.Status == 'D') {
                                $scope.isContainerEdit = true;
                            }
                            GateUnJointTruck.UnJointTruckBasic().unJointTruckByVoucherID({voucherid: resultRows.VoucherID}).$promise.then(function (res) {
                                $('#myEditContainer').modal('show');
                                $scope.note = res;
                                loadOldContainer().then(function (submitResult) {
                                    $scope.OldContainers = [];
                                    for (var i = 0; i < submitResult.length; i++) {
                                        if (submitResult.StorageNO !== res.StorageNO) {
                                            $scope.OldContainers.push(submitResult[i]);
                                        }
                                    }
                                    if (resultRows.Status == 'D') {
                                        $scope.isContainerEdit = true;
                                    } else {
                                        $scope.isContainerEdit = false;
                                    }

                                }, function (submitReason) {
                                    Notifications.addError({'status': 'error', 'message': submitReason});
                                });

                            }, function (errResponse) {
                                Notifications.addError({'status': 'error', 'message': errResponse});
                            });
                        }
                        else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('ModifyNotBelongUserID')
                            });
                        }

                    } else {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('Edit_Notice')
                        });
                    }
                }

                else {
                    Notifications.addError({
                        'status': 'error',
                        'message': $translate.instant('Edit_Notice')
                    });
                }
            }

            /**
             * Get Process instance id by voucherid
             * @param {*voucherid} delVoucherid
             */
            function GetPID(delVoucherid) {
                var deferred = $q.defer();
                GateUnJointTruck.GetGateUnjointTruckPID().get({
                    VoucherID: delVoucherid,
                    activityId: 'StartUnjointTruck'
                }).$promise.then(function (res) {
                        deferred.resolve(res);
                    }, function (error) {
                        deferred.reject(error);
                    });
                return deferred.promise;

            }

            /**
             * delete Workflow PID
             * @param {*BPM PID} pid
             */
            function DeletePID(pid) {
                var deferred = $q.defer();
                $http.delete('/bpm/api/default/bpm-rest-api/process-instance/' + pid + '', {}).success(function (response) {
                    //alert("流程进程结束成功");
                    deferred.resolve();
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }

            $scope.SetGuest = function (ExpectIn, VehicleNO, LinkPhone, Manufacturer) {
                $scope.recod.start_code = Auth.username;
                $scope.guestItems.length = 0;
                $scope.recod.start_date = ExpectIn;
                $scope.recod.ExpectOutTime = $filter('date')(new Date(ExpectIn), 'yyyy-MM-dd 17:00');
                $scope.recod.VehicleNo = VehicleNO;
                $scope.recod.start_phone = LinkPhone;
                $scope.recod.start_company = Manufacturer;
                $scope.recod.start_reason = $translate.instant('FEPVUnJointTruck') + '-' + $scope.kind[1].GuestType;
            };
            $scope.reset = function () {
                $('#nextModal').modal('hide');
                $scope.Search();
            };
            /**
             * query unjointTruck
             */
            $scope.Search = function (msg) {
                var query = getPage();
                GateUnJointTruck.UnJointTruckBasic().getUnJointTrucks(query).$promise.then(function (res) {
                    $scope.gridOptions.data = res.TableData;

                    $scope.gridOptions.totalItems = res.TableCount[0];
                    if (msg != '' && msg != undefined) {
                        Notifications.addError({'status': 'info', 'message': msg});
                    }

                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });
            };
            /**
             * paging condition
             */
            var getPage = function () {
                var query = {};
                query.userID = '';
                if ($scope.SpecialUser == true) {
                    query.pageIndex = paginationOptions.pageNumber || '1';
                    query.pageSize = paginationOptions.pageSize || '50';
                    query.des = '';
                    query.voucherID = $scope.VoucherID || '';
                    query.status = $scope.status || '';
                    query.manufacturer = $scope.Manufacturer || '';
                    query.containerNO=$scope.ContainerNO || '';
                    query.dateFrom = $scope.dateFrom || '';
                    query.dateTo = $scope.dateTo || '';
					if ($scope.onlyOwner == true) {
                        query.userID = Auth.username;
                    }
                    if($scope.isNormalUser==true){
                        query.VehicleType = '';
                    }else{
                        query.VehicleType = '19';
                    }

                } else {
                    if ($scope.onlyOwner == true) {
                        query.userID = Auth.username;
                    }
                    query.pageIndex = paginationOptions.pageNumber || '1';
                    query.pageSize = paginationOptions.pageSize || '50';
                    query.des = '';
                    query.voucherID = $scope.VoucherID || '';
                    query.status = $scope.status || '';
                    query.manufacturer = $scope.Manufacturer || '';
                    query.dateFrom = $scope.dateFrom || '';
                    query.dateTo = $scope.dateTo || '';
                    query.VehicleType = '';
                    query.containerNO=$scope.ContainerNO || '';
                }

                return query;
            };
            /**
             * flow chart display
             */
            $scope.showPng = function () {
                if ($scope.bpmnloaded == true) {
                    $scope.bpmnloaded = false;
                } else {
                    $scope.bpmnloaded = true;
                }
            };
            /**
             * grid status description
             */
            $scope.getVoucherStatus = function (Status) {
                var statLen = $filter('filter')($scope.StatusList, {'Status': Status});
                if (statLen.length > 0) {
                    return statLen[0].Remark;
                } else {
                    return Status;
                }
            };
            /**
             * truck type description
             */
            $scope.getVoucherModels = function (ID) {
                var statLen = $filter('filter')($scope.Shape, {'ID': ID});
                for(var i =0;i<statLen.length;i++) {
                    if (statLen[i].ID == ID) {
                        return statLen[i].Spec;
                    }
                }
                return ID;
            };

        }]);


});


