/**
 * Created by ptanh on 4/14/2018.
 */

define(['myapp','controllers/Gate/VisitorVoucher','angular'],function(myapp,angular){
    myapp.controller('VisitorController', ['$filter', '$http',
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'uiGridConstants', 'EngineApi', 'GateUnJointTruck',
        'GateGuest', 'GateJointTruck', '$translate', '$q','$scope',
        function($filter, $http, $routeParams,
            $resource, $location, $interval, Notifications, Forms, Auth, uiGridConstants,
            EngineApi, GateUnJointTruck, GateGuest, GateJointTruck, $translate, $q,$scope){


            var lang = window.localStorage.lang;
            $scope.recod = {};
            $scope.recod.start_name = '';
            $scope.guestItems = [];
            $scope.note = {};
            var historyurl = '';
            $scope.flowkey='FEPVGateGuest';
            $scope.details = {};
            $scope.detailsGuestItems = [];
            $scope.onlyOwner = true;
            $scope.isError=false;
            $scope.dateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.dateTo = $filter('date')(new Date(), 'yyyy-MM-dd');

            $scope.recod.ExpectOutTime = $filter('date')(new Date($scope.recod.start_date), 'yyyy-MM-dd 17:00');
            // set initial selected option to blood type B
            $scope.selectedOption = {'description': 'B'};
            var paginationOptions = {
                pageNumber: 1,
                pageSize: 50,
                sort: null
            };

            /**
             * Visitor WorkFlow key
             */
            function loadDefineKey() {
                var deferred = $q.defer();
                EngineApi.getKeyId().getkey({'key': $scope.flowkey}).$promise.then(function (FlowDefinition) {
                    if (FlowDefinition.id) {
                        deferred.resolve(FlowDefinition.id);
                    } else {
                        deferred.reject('get workflow key failed.');
                    }
                });
                return deferred.promise;
            }

            /**
             * load Guest details by VoucherID
             */
            function loadGuestDetails(voucherID){
                var deferred = $q.defer();
                GateGuest.GuestBasic().getGuest({
                    VoucherID: voucherID,
                    Language: lang
                }).$promise.then(function (res) {
                    $scope.recod.start_kind = res[0].GuestType;
                    $scope.recod.start_code = res[0].Respondent;
                    $scope.recod.start_area = res[0].Region;
                    $scope.recod.start_phone = res[0].ExtNO;
                    $scope.recod.start_company = res[0].Enterprise;
                    $scope.recod.start_date = res[0].ExpectIn;
                    $scope.guestItems = res[0].GuestItems;
                    $scope.recod.start_reason = res[0].Content;
                    $scope.recod.start_voucherid = res[0].VoucherID;
                    deferred.resolve(res);
                },function(error){
                    deferred.reject(error);
                })
                return deferred.promise;
            }

            /**
             * Update status by VoucherID
             */
            function updateStatusbyVoucherID(voucherID,status){
                var deferred = $q.defer();
                GateGuest.GuestBasic().saveGuestStatus({
                    voucherID: voucherID,
                    status: status
                }).$promise.then(function () {
                    deferred.resolve();
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }
            /**
             *Load Guest Type
             */
            function loadGuestType(){
                var deferred = $q.defer();
                GateGuest.GuestBasic().getGuestType({language: lang}).$promise.then(function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }

            /**
             * Load Guest Regions
             */
            function loadGuestRegions(){
                var deferred = $q.defer();
                GateGuest.GuestBasic().getGuestRegions({language: lang}).$promise.then(function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }

            /**
             * load Query status
             */
            function loadQueryStatus(){
                var deferred =$q.defer();
                GateGuest.GetQueryStatus().get({ctype: 'Guest', language: lang, flag: '1'}).$promise.then(function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }

            /**
             * Init data
             */
            $q.all([loadGuestType(),loadGuestRegions(),loadQueryStatus()]).then(function(result){
                $scope.kind=result[0];
                $scope.regions=result[1];
                $scope.StatusList = result[2];
            },function(error){
                Notifications.addError({'status': 'Failed', 'message': 'Loading failed: ' + error});
            });
            /**
             *Get Status of Voucher
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
             *Get Guest Type of Voucher
             */
            $scope.getVoucherGuestType = function (GuestType) {
                var statLen = $filter('filter')($scope.kind, GuestType);
                if (statLen.length > 0) {
                    return statLen[0].GuestType;
                } else {
                    return GuestType;
                }
            };
            /**
             *Get Region of Voucher
             */
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

                cellTemplate: '<a href="#/gate/Visitor/{{COL_FIELD}}" style="padding:5px;display:block; cursor:pointer" target="_blank">{{COL_FIELD}}</a>'
            },
            {
                field: 'Status',
                minWidth: 100,
                displayName: $translate.instant('Status'),
                cellTooltip: true,
                cellTemplate: '<span  >{{grid.appScope.getVoucherStatus(row.entity.Status)}}</span>'
            },
            {
                field: 'Content',
                minWidth: 150,
                displayName: $translate.instant('Content'),
                cellTooltip: true
            },
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
            {
                field: 'Respondent',
                minWidth: 120,
                displayName: $translate.instant('Respondent'),
                cellTooltip: true},
            {
                field: 'ExtNO',
                minWidth: 80,
                displayName: $translate.instant('ExtNO'),
                cellTooltip: true
            },
            {
                field: 'Enterprise',
                displayName: $translate.instant('Enterprise'),
                minWidth: 80,
                cellTooltip: true
            },
            {
                field: 'ExpectIn',
                displayName: $translate.instant('ExpectIn'),
                minWidth: 150,
                cellTooltip: true
            },
            {
                field: 'InTime',
                displayName: $translate.instant('InTime'),
                minWidth: 150,
                cellTooltip: true
            },
            {
                field: 'Complete',
                displayName: $translate.instant('Complete'),
                minWidth: 150,
                cellTooltip: true
            },
            {
                field: 'OutTime',
                displayName: $translate.instant('OutTime'),
                minWidth: 150,
                cellTooltip: true
            },
            {
                field: 'ExpectOutTime',
                displayName: $translate.instant('GoodsExpectOut'),
                minWidth: 80,
                cellTooltip: true
            },
            {
                field: 'VehicleNo',
                displayName: $translate.instant('VehicleNO'),
                minWidth: 80,
                cellTooltip: true
            },
            {
                field: 'Stamp',
                displayName: $translate.instant('Stamp'),
                minWidth: 150,
                cellTooltip: true
            },
            {
                field: 'UserID',
                displayName: $translate.instant('UserID'),
                minWidth: 80,
                cellTooltip: true
            }];


            /**
             * Query Grid setting
             */
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
                    EngineApi.getTcodeLink().get({
                        'userid': Auth.username,
                        'tcode': 'FEPVGateGuestCreate'
                    }, function (linkres) {
                        if (linkres.IsSuccess) {
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
                        SearchList();
                    });
                }
            };
            /**
             *reset data function
             */
            $scope.reset= function(){
                $scope.recod={};
                $scope.guestItems = [];

                $('#myModal').modal('hide');
            }
            /**
             *search list function
             */
            function SearchList() {
                if ($scope.dateFrom == null && $scope.dateTo == null) {
                    Notifications.addError({'status': 'error', 'message': $translate.instant('dataError')});
                    return;
                }
                var query = {userID: '', des: ''};
                if ($scope.onlyOwner == true) {
                    query.userID = Auth.username;
                }
                else {
                    query.userID = '';
                }
                query.PageIndex = paginationOptions.pageNumber||'';
                query.PageSize = paginationOptions.pageSize||'';
                query.voucherID = $scope.VoucherID || '';
                query.status = $scope.status || '';
                query.enterprise = $scope.enterprise || '';
                query.dateFrom = $scope.dateFrom;
                query.dateTo = $scope.dateTo;
                query.region = $scope.region || '';
                query.guestType = $scope.guestType || '';
                return query;
            }

            /**
             *Search function
             */
            $scope.Search= function () {
                var query= SearchList();
                GateGuest.GuestBasic().getGuestsList(query).$promise.then(function (res) {
                    $scope.gridOptions.data = res.TableData;
                    $scope.gridOptions.totalItems = res.TableCount[0];
                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });
            }
            /**
             *Watch function Recod.start_code
             */
            $scope.$watch('recod.start_code', function (n) {
                if (n !== undefined && n!=='') {
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
                        $scope.recod.start_name = '';
                    }
                }
            });
            /**
             *Add Guest details
             */
            $scope.addGuestItem = function () {
                if ($scope.guest != null || $scope.guest != {}) {
                    $scope.guestItems.push($scope.guest);
                    $scope.guest = {};
                }
            };
            /**
             *Delete Guest item
             */
            $scope.deleteGuestItem = function (index) {
                $scope.guestItems.splice(index, 1);

            };

            var gridMenu = [{

                title: $translate.instant('Create'),
                action: function () {
                    $scope.reset();
                    $scope.recod.start_date = $filter('date')(new Date(), 'yyyy-MM-dd');
                    $scope.setEndDate();
                    $('#myModal').modal('show');
                },
                order: 1
            }, {
                title: $translate.instant('Update'),
                action: function () {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    if (resultRows.length == 1) {
                        if (resultRows[0].Status == 'N' && resultRows[0].UserID == Auth.username) {
                            var querypromise = loadGuestDetails(resultRows[0].VoucherID);
                            querypromise.then(function(){
                                $('#myModal').modal('show');
                            },function(error){
                                Notifications.addError({
                                    'status': 'error',
                                    'message': error
                                });
                            })
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
                action: function () {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    if (resultRows.length == 1) {
                        if (resultRows[0].Status == 'N' && resultRows[0].UserID == Auth.username) {
                            if (confirm($translate.instant('Delete_IS_MSG') + ':' + resultRows[0].VoucherID)) {
                                var updatepromise = updateStatusbyVoucherID(resultRows[0].VoucherID,'X');
                                updatepromise.then(function(){
                                    Notifications.addError({
                                        'status': 'info',
                                        'message': 'DELETE Succeed'
                                    });
                                },function(error){
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': error
                                    })
                                })
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

            }, {
                title: $translate.instant('PrintReport'),
                action: function () {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    if (resultRows.length == 1) {
                        var href = '#/gate/Guest/print/' + resultRows[0].VoucherID;
                        window.open(href);
                    }
                    else {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('Select_ONE_MSG')
                        });
                    }
                },
                order: 4
            }];
            /**
             *
             */
            $scope.getVoucher = function (obj) {
                var querypromise = loadGuestDetails(obj.entity.VoucherID);
                if (obj.entity.Status == 'N' && obj.entity.UserID == Auth.username) {
                    querypromise.then(function(){
                        $('#myModal').modal('show');
                    },function(error){
                        Notifications.addError({
                            'status': 'error',
                            'message': error
                        });
                    })
                }else{
                    querypromise.then(function(res){
                        $scope.details = res[0];
                        //  $scope.details
                        $scope.details.Status = $scope.getVoucherStatus($scope.details.Status);
                        $scope.details.GuestType = $scope.getVoucherGuestType($scope.details.GuestType);
                        $scope.details.Region = $scope.getVoucherRegion($scope.details.Region);
                        //$scope.details.ExpectIn=res[0].ExpectIn;
                        $scope.details.ExpectOutTime = res[0].ExpectOutTime;
                        $scope.detailsGuestItems = res[0].GuestItems;
                        $scope.details.VehicleNo = res[0].VehicleNo;
                        GateGuest.GetGateGuestPID().get({
                            VoucherID: obj.entity.VoucherID,
                            activityName: 'StartEvent_Create'
                        }).$promise.then(function (res) {

                            historyurl = '#/processlog/' + res.ProcessInstanceId;
                            $scope.$emit('historyurl', historyurl);

                        }, function (error) {
                            Notifications.addError({'status': 'error', 'message': error});
                        });
                    },function(error){
                        Notifications.addError({
                            'status': 'error',
                            'message': error
                        });
                    })
                }
            };
            $scope.checkErr = function () {
                var startDate = $scope.recod.start_date;
                var endDate = $scope.recod.ExpectOutTime;
                $scope.errMessage = '';
                if (new Date(startDate) > new Date(endDate)) {
                    $scope.isError=true;
                    $scope.errMessage = 'End Date should be greater than Start Date';
                    Notifications.addError({'status': 'error', 'message': $scope.errMessage});
                }

            };
            $scope.setEndDate = function () {
                $scope.recod.ExpectOutTime = $filter('date')(new Date($scope.recod.start_date), 'yyyy-MM-dd 17:00');
            };
            $scope.setdateTo = function () {
                $scope.dateTo = $filter('date')(new Date($scope.dateFrom), 'yyyy-MM-dd');
            }

        }])
})

