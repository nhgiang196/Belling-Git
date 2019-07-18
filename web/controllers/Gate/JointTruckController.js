/**
 * Created by wangyanyan on 2016-08-19.
 */
define(['myapp','controllers/Gate/GuestUserController','controllers/Gate/JointTruckVoucher', 'angular'], function (myapp,angular) {
    myapp.controller('JointTruckController',  ['$rootScope', '$scope', '$filter', '$http', '$compile',
        '$routeParams', '$resource', '$location', '$interval', 'Notifications', 'Forms', 'Auth',
        'uiGridConstants', 'EngineApi', 'GateUnJointTruck', 'GateGuest', 'GateJointTruck', '$translate', '$q',
        function ($rootScope, $scope, $filter, $http, $compile, $routeParams, $resource,
            $location, $interval, Notifications, Forms, Auth, uiGridConstants, EngineApi, GateUnJointTruck, GateGuest, GateJointTruck, $translate, $q) {
            var lang = window.localStorage.lang||'EN';
            $scope.flowkey = 'FEPVJointTruck';
            $scope.bpmnloaded = false;
            $scope.IsReady=false;
            $scope.showPng = function () {
                if ($scope.bpmnloaded == true) {
                    $scope.bpmnloaded = false;
                } else {
                    $scope.bpmnloaded = true;
                }
            };
            $scope.onlyOwner = true;
            $scope.dateFrom = $filter('date')(new Date(), 'MM/dd/yyyy');
            $scope.dateTo = $filter('date')(new Date(), 'MM/dd/yyyy');
            $scope.note = {};
            $scope.CompanyCodeList =[
                {
                    'name': 'Dyeing',
                    'value': 'VC'
                },
                {
                    'name':'Fiber',
                    'value':'VH'
                }
            ]
            $scope.so = {};
            var paginationOptions = {
                pageNumber: 1,
                pageSize: 50,
                sort: null
            };
            //发货单类型
            $scope.trantypes = [{
                'name': $translate.instant('ShipType1'),
                'value':'1'
            }, {
                'name': $translate.instant('ShipType2'),
                'value': '2'}];
            $scope.Trantype = '1';
            $scope.note.ValidatePeriod = $scope.note.ExpectIn = $filter('date')(new Date(), 'yyyy-MM-dd');
            /**
             *
             * loadGateStatus( ctype, language,flag)
             */
            function loadGateStatus(){
                var deferred = $q.defer();
                GateGuest.GetQueryStatus().get({ctype: 'Truck', language: lang, flag: '1'}).$promise.then(function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }
            /**
             *
             * loadVehicleTypes( language,type)
             */
            function loadVehicleTypes(){
                var deferred = $q.defer();
                GateUnJointTruck.UnJointTruckBasic().getVehicleTypes({
                    Language: lang,
                    Type: 'JointTruck'
                }).$promise.then(function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });
                return   deferred.promise;
            }

            /**
             * loadTruckCompany(language)
             */
            function loadTruckCompany(){
                var deferred = $q.defer();
                GateJointTruck.JointTruckBasic().getTruckCompany({Language: lang}).$promise.then(function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;

            }
            /**
             * loadMaterialType(language,type)
             */
            function loadMaterialType(){
                var deffered = $q.defer();
                GateJointTruck.JointTruckBasic().getMaterialTypes({
                    Language: lang,
                    Type: 'JointTruck'
                }).$promise.then(function (res) {
                
                    deffered.resolve(res);
                }, function (error) {
                    deffered.reject(error);
                });
                return deffered.promise;
            }

            EngineApi.getMemberInfo().get({userid: Auth.username}, function (res) {
                $scope.userinfo=res;
            });
            /**
             * initial data
             */
            $q.all([loadGateStatus(),loadVehicleTypes(),loadTruckCompany(),loadMaterialType(),]).then(function(result){
                $scope.StatusList= result[0];
                $scope.Shape= result[1];
                $scope.transfer=result[2];
                $scope.material=result[3];
            },function(error) {
                Notifications.addError({'status': 'Failed', 'message': 'Loading failed: ' + error});
            });
            /**
             * binding Voucher's status
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
             *binding Company Transfer
             */
            $scope.getTransferCompany = function (ID) {
                var statLen = $filter('filter')($scope.transfer, {'ID': ID});
                if (statLen.length > 0) {
                    return statLen[0].Spec;
                } else {
                    return ID;
                }
            };
            $scope.getMaterial = function (ID) {
                var statLen = $filter('filter')($scope.material, {'ID': ID});
                if (statLen.length > 0) {
                    return statLen[0].Spec;
                } else {
                    return ID;
                }
            };
            /**
             *binding kinds of vehicle
             */
            $scope.getVehicleShape = function (ID) {
                var statLen = $filter('filter')($scope.Shape, {'ID': ID});
                if (statLen.length > 0) {
                    return statLen[0].Spec;
                } else {
                    return ID;
                }
            };
            $scope.getCompanyCodeName= function(Name){
                if(Name=='VC'){
                    return 'Dyeing';
                }if(Name=='VH'){
                    return 'Fiber';
                }
            }
            /**
             * ExpectIn trigger event ng-Change
             */
            $scope.selecteddate = function () {
                $scope.note.ValidatePeriod = $scope.note.ExpectIn;
            };
            /**
             * ValidatePeriod trigger event ng-Change
             */
            $scope.selecteddateValidatePeriod = function () {
                if ($filter('date')(new Date($scope.note.ValidatePeriod), 'MM/dd/yyyy') < $filter('date')(new Date($scope.note.ExpectIn), 'MM/dd/yyyy')) {
                    $scope.note.ValidatePeriod='';
                    Notifications.addError({
                        'status': 'error',
                        'message': $translate.instant('ErrorDate')
                    });

                }
            };

            $scope.updateSelection=function($event){
                var checkbox = $event.target;
                if(checkbox.checked){
                    document.getElementById('ValidatePeriod').disabled = false;
                   
                }else{
                    document.getElementById('ValidatePeriod').disabled = true;
                   
                }
            }
            /**
             *get define key by flow key
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
             * get JointTruck by Voucherid
             * @param {*} voucherid 
             */
            function getVoucher(voucherid){
                var deferred=$q.defer();
                GateJointTruck.JointTruckBasic().jointTruckByVoucherID({voucherid: voucherid}).$promise.then(function (res) {
                    console.log(res);
                    if(res.VoucherID){
                        deferred.resolve(res);
                    }else{
                        deferred.reject('get Voucher  failed.');
                    }
                }, function (errResponse) {
                    deferred.reject(errResponse);
                });
                return deferred.promise;
            }
            /**
             * column of Search grid
             */
            var col = 
            [{
                field: 'VoucherID',
                displayName: $translate.instant('VoucherID'),
                minWidth: 140,
                cellTooltip: true,
                cellTemplate: '<a href="#/gate/JointTruck/{{COL_FIELD}}" target="_blank">{{COL_FIELD}}</a>'
            }, {
                field: 'StatusSpec',
                displayName: $translate.instant('Status'),
                minWidth: 150,
                cellTemplate: '<span  >{{grid.appScope.getVoucherStatus(row.entity.Status)}}</span>',
                cellTooltip: true
            },{
                field: 'ShippingOrder',
                displayName: $translate.instant('ShippingOrder'),
                minWidth: 200,
                cellTooltip: true
            }, {
                field: 'TransferCompanySpec',
                displayName: $translate.instant('TransferCompany'),
                minWidth: 200,
                cellTooltip: true,
                cellTemplate: '<span  >{{grid.appScope.getTransferCompany(row.entity.TransferCompany)}}</span>'
            }, {field: 'VehicleNO', displayName: $translate.instant('VehicleNO'), minWidth: 100, cellTooltip: true}, {
                field: 'MaterielTypeSpec',
                displayName: $translate.instant('Material'),
                minWidth: 80,
                cellTooltip: true,
                cellTemplate: '<span  >{{grid.appScope.getMaterial(row.entity.MaterielType)}}</span>'
            },{
                field: 'VehicleShapeSpec',
                displayName: $translate.instant('Models'),
                minWidth: 80,
                cellTooltip: true,
                cellTemplate: '<span  >{{grid.appScope.getVehicleShape(row.entity.VehicleShape)}}</span>'
            },{
                field: 'Remark',
                displayName: $translate.instant('Remark'),
                minWidth: 80,
                cellTooltip: true
            },{
                field: 'ExpectIn',
                displayName: $translate.instant('ExpectedIn'),
                minWidth: 180,
                cellTooltip: true
            },{
                field: 'ValidatePeriod',
                displayName: $translate.instant('ValidTo'),
                minWidth: 180,
                cellTooltip: true
            },{
                field: 'Driver',
                displayName: $translate.instant('Driver'),
                minWidth: 120,
                cellTooltip: true
            },{
                field: 'DriverPhone',
                displayName: $translate.instant('DriverPhone'),
                minWidth: 80,
                cellTooltip: true
            }, {
                field: 'FirstWeight',
                displayName: $translate.instant('FirstWeight'),
                minWidth: 80,
                cellTooltip: true
            },{
                field: 'FirstTime',
                displayName: $translate.instant('FirstTime'),
                minWidth: 180,
                cellTooltip: true
            },{
                field: 'SecondWeight',
                displayName: $translate.instant('SecondWeight'),
                minWidth: 80,
                cellTooltip: true
            },{
                field: 'SecondTime',
                displayName: $translate.instant('SecondTime'),
                minWidth: 180,
                cellTooltip: true
            },{
                field: 'InTime',
                displayName: $translate.instant('InTime'),
                minWidth: 180,
                cellTooltip: true
            },{
                field: 'OutTime',
                displayName: $translate.instant('OutTime'),
                minWidth: 180,
                cellTooltip: true
            }, {
                field: 'Complete',
                displayName: $translate.instant('Complete'),
                minWidth: 180,
                cellTooltip: true
            },{
                field: 'Stamp',
                displayName: $translate.instant('Stamp'),
                minWidth: 180,
                cellTooltip: true
            }, {
                field: 'Message',
                displayName: $translate.instant('ErrorMsg'),
                minWidth: 180,
                cellTooltip: true
            },{
                field: 'Reason',
                displayName: $translate.instant('ErrorReason'),
                minWidth: 180,
                cellTooltip: true
            },{
                field: 'Status',
                displayName: $translate.instant('Status'),
                minWidth: 80,
                cellTooltip: true
            },{
                field: 'UserID',
                displayName: $translate.instant('UserID'),
                minWidth: 180,
                cellTooltip: true
            },{
                field: 'CompanyCode',
                displayName: $translate.instant('CompanyCode'),
                minWidth: 180,
                cellTemplate: '<span  >{{grid.appScope.getCompanyCodeName(row.entity.CompanyCode)}}</span>',
                cellTooltip: true
            }];

        
            /**
             *grid setting
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
                paginationPageSizes: [50, 100, 150, 200],
                paginationPageSize: 50,
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({
                        'userid': Auth.username,
                        'tcode': $scope.flowkey
                    }, function (linkres) {
                        if (linkres.IsSuccess) {
                            var keypromise = loadDefineKey();
                            keypromise.then(function (keyres) {
                                $scope.definitionID = keyres;
                                gridApi.core.addToGridMenu(gridApi.grid, gridMenu);
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
                        Search();
                    });
                }
            };
            /**
             *grid menu
             */

            var gridMenu = [{
                title: $translate.instant('Create'),
                action: function () {
                    $scope.onReset();
                    $scope.IsReady=false;
                    if($scope.userinfo.Company)
                    {
                        if($scope.userinfo.Company=='VH')
                        {
                            $scope.vouchergridOptions.columnDefs=vhCol;
                            $scope.material=   $filter('filter')( $scope.material, {
                                'CompanyCode': $scope.userinfo.Company
                            });

                        }else{
                            $scope.vouchergridOptions.columnDefs=vcVcol;
                        }
                        $('#myModal').modal('show');
                    }else{
                        Notifications.addError({
                            'status': 'error',
                            'message': 'IT set CompanyCode'
                        });
                    }
                   
                },
                order: 1
            }, {
                title: $translate.instant('Update'),
                action: function () {
                    $scope.onReset();
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    if (resultRows[0].Status == 'Q' || resultRows[0].Status == 'I' || resultRows[0].Status == 'Y' || resultRows[0].Status == 'N') {
                        if (Auth.username != resultRows[0].UserID.toUpperCase()&&Auth.username != resultRows[0].UserID) {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('ModifyNotBelongUserID')
                            });
                            return;
                        }
                        if (resultRows.length == 1) {
                            //是否能编辑，删除了不能修改，进厂后，车行车号不能修改，
                            GateJointTruck.JointTruckBasic().isCanUpdate({
                                userID: Auth.username,
                                voucherID: resultRows[0].VoucherID
                            }).$promise.then(function (res) {
                                console.log(res);
                                if (res.msg != '') {
                                    Notifications.addError({'status': 'error', 'message': res.msg});
                                    return;
                                }
                                var voucherpromise =getVoucher(resultRows[0].VoucherID);
                                voucherpromise.then(function(voucher){
                                    $scope.note = voucher;
                                    var   status = voucher.Status;
                                    if (status != 'N') {
                                        $scope.IsReady=true;
                                    } else{
                                        $scope.IsReady=false;
                                    }
                                    if($scope.userinfo.Company=='VH')
                                    {

                                        $scope.vouchergridOptions.columnDefs=vhCol;
                                        $scope.vouchergridOptions.data = voucher.JointTruckItems;

                                    }else{
                                        $scope.vouchergridOptions.columnDefs=vcVcol;
                                        $scope.vouchergridOptions.data = voucher.JointTruckItems;
                                    }
                                    $scope.note.ExpectIn = $filter('date')($scope.note.ExpectIn, 'MM/dd/yyyy');
                                    $scope.note.InTime = $filter('date')($scope.note.InTime, 'MM/dd/yyyy HH:mm:ss');
                                    $scope.note.FirstTime = $filter('date')($scope.note.FirstTime, 'MM/dd/yyyy HH:mm:ss');
                                    $scope.note.SecondTime = $filter('date')($scope.note.SecondTime, 'MM/dd/yyyy HH:mm:ss');
                                    $scope.note.OutTime = $filter('date')($scope.note.OutTime, 'MM/dd/yyyy');
                                    $scope.note.ValidatePeriod = $filter('date')($scope.note.ValidatePeriod, 'MM/dd/yyyy');


                                    $('#myModal').modal('show');
                                },function(error){
                                    Notifications.addError({'status': 'error', 'message': error});
                                })
                             

                                // var href = '#/gate/JointTruck/' + resultRows[0].VoucherID + '/update';
                                // window.open(href);
                                // $location.url("/gate/JointTruck/" + resultRows[0].VoucherID + "/update");
                            }, function (errormessage) {
                                Notifications.addError({'status': 'error', 'message': errormessage});
                            });
                        } else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('Select_ONE_MSG')
                            });
                        }
                    } else {
                        Notifications.addError({'status': 'error', 'message': $translate.instant('ErrorModify')});
                    }
                },
                order: 2
            },
            {
                title: $translate.instant('Delete'),
                icon: 'ui-grid-icon-cancel',
                action: function () {
                    var selectRows = $scope.gridApi.selection.getSelectedGridRows();
                    var delshippingNo = selectRows[0].entity.ShippingOrder;
                    var delvehicleNO = selectRows[0].entity.VehicleNO;
                    var delVoucherid = selectRows[0].entity.VoucherID;
                    if (confirm(delshippingNo + '|' + delvehicleNO + $translate.instant('Delete_IS_MSG'))) {
                        GateJointTruck.JointTruckBasic().deleteJointTruck({
                            userId: Auth.username,
                            voucherId: delVoucherid
                        }, {}).$promise.then(function (res) {
                            if (res.msg) {
                                Notifications.addMessage({'status': 'error', 'message': res});
                            } else {
                                Search();
                                Notifications.addMessage({
                                    'status': 'info',
                                    'message': $translate.instant('Delete_Succeed_Msg')
                                });
                            }
                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });
                    }
                },
                order: 4
            },
            {
                title: $translate.instant('AddGuest'),
                action: function () {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    if (resultRows.length < 1) {
                        Notifications.addMessage({'status': 'information', 'message': 'Please Select VoucherID!'});
                        return;
                    }
                    $('#myGuestModal').modal('show');
                    $scope.SetGuest(resultRows[0].ExpectIn, resultRows[0].VehicleNO,
                        resultRows[0].LinkPhone, resultRows[0].TransferCompany);
                },
                order: 3
            }];
            /**
             *Add Guest function
             */
            $scope.addGuest = function () {
                $('#myGuestModal').modal('show');
                $scope.SetGuest($scope.note.ExpectIn, $scope.note.VehicleNO,
                    $scope.note.LinkPhone, $scope.note.Manufacturer);
                $scope.reset();
                $('#myModal').modal('hide');
            };
            /**
             *Search function
             */
            function Search() {
                var query = {};
                query.userID = '';
                if ($scope.onlyOwner == true) {
                    query.userID = Auth.username;
                }
                query.PageIndex = paginationOptions.pageNumber || '1';
                query.PageSize = paginationOptions.pageSize || '50';
                query.des = '';
                query.voucherID = $scope.VoucherID || '';
                query.status = $scope.status || '';
                query.vehicleNO = $scope.VehicleNO || '';
                query.dateFrom = $scope.dateFrom || '';
                query.dateTo = $scope.dateTo || '';
                query.CompanyCode=$scope.CompanyCode||'';
                getPage(query);
            }
            /**
             * Search function
             */
            $scope.Search = function () {
                Search();
            };
            var getPage = function (query) {
                GateJointTruck.JointTruckBasic().getJointTrucks(query).$promise.then(function (res) {
                    $scope.gridOptions.data = res.TableData;
                    $scope.gridOptions.totalItems = res.TableCount[0];
                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });
            };


            /**
             * Reset funtionc
             */
            $scope.reset = function () {
                $scope.onReset();
                $('#myModal').modal('hide');
            };

            var vhCol=[{field: 'ShippingOrder', displayName: 'VBELN', minWidth: 120, cellTooltip: true},
                {field: 'MaterialSpc', displayName: 'AB', minWidth: 80, cellTooltip: true},
                {field: 'STREET', displayName: 'STREET', minWidth: 100, cellTooltip: true},
                {field: 'CustomerName', displayName: 'CustomerName', minWidth: 100, cellTooltip: true},
                {field: 'Plant', displayName: 'Plant', minWidth: 100, cellTooltip: true},
                {field: 'CenterID', displayName: 'CenterID', minWidth: 100, cellTooltip: true},
                {field: 'WADAT', displayName: 'WADAT', minWidth: 120, cellTooltip: true},
                {field: 'Direction', displayName: 'Direction', minWidth: 120, cellTooltip: true},
                {field: 'DirectionSPC', displayName: 'DirectionSPC', minWidth: 120, cellTooltip: true}
            ]
            /**
             * Shipping grid
             */
            var vcVcol = [{  field: 'ShippingOrder', displayName: $translate.instant('ShippingOrder'),  minWidth: 120,  cellTooltip: true  },
                {  field: 'Direction', displayName: $translate.instant('Direction'), minWidth: 80, cellTooltip: true },
                {  field: 'MaterialSpc', displayName: $translate.instant('MaterialSpc'),minWidth: 100, cellTooltip: true },
                { field: 'PRquan', displayName: $translate.instant('PRquan'), minWidth: 100, cellTooltip: true },
                {   field: 'Requan', displayName: $translate.instant('Requan'), minWidth: 100,cellTooltip: true},
             
               
               
                
            {
                field: 'Unit',
                displayName: $translate.instant('Unit'),
                minWidth: 100,
                cellTooltip: true},
            {
                field: 'Isprn',
                displayName: $translate.instant('Isprn'),
                minWidth: 120,
                cellTooltip: true}
            ];
          
            /**
             *Shipping grid setting
             */
            $scope.vouchergridOptions = {
                // columnDefs: vcol,
                data: [],
                enableColumnResizing: true,
                showGridFooter: false,
                enableGridMenu: true,
                exporterMenuPdf: false,
                enableSelectAll: false,
                enableRowHeaderSelection: true,
                enableRowSelection: true,
                multiSelect: false,
                paginationPageSizes: [20, 30, 40],
                paginationPageSize: 20,
                onRegisterApi: function (ordergridApi) {
                    $scope.ordergridApi = ordergridApi;
                    ordergridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.selectedVoucherid = row.entity.VoucherID;
                    })
                }
            };
            /**
             *binding guest data
             */
            $scope.SetGuest = function (ExpectIn, VehicleNO, LinkPhone, Manufacturer) {
                $scope.recod.start_code = Auth.username;
                $scope.guestItems.length = 0;
                $scope.recod.start_date = ExpectIn;
                $scope.recod.ExpectOutTime = $filter('date')(new Date(), 'MM/dd/yyyy 17:00');
                $scope.recod.VehicleNo = VehicleNO;
                $scope.recod.start_phone = LinkPhone;
                $scope.recod.start_company =$scope.transfer[Manufacturer - 1].Spec;
                $scope.recod.start_reason = $translate.instant('FEPVUnJointTruck') + '-' + $scope.kind[1].GuestType;
            };
        }
    ]);


});
