/**
 * Created by wangyanyan on 2016-10-09.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('JointTruckUpdateController', ['$scope', 'EngineApi', '$http', '$timeout', 'Notifications', '$upload', '$compile', '$filter', 'Auth', '$resource', '$routeParams', 'IO_BARCODE_TYPES', 'Forms', '$location', 'GateJointTruck', 'GateGuest', 'GateUnJointTruck', '$translate', 'GateGuest', '$q',
        function ($scope, EngineApi, $http, $timeout, Notifications, $upload, $compile, $filter, Auth, $resource, $routeParams, IO_BARCODE_TYPES, Forms, $location, GateJointTruck, GateGuest, GateUnJointTruck, $translate, GateGuest, $q) {
            console.log($routeParams.code);
            $scope.pagestatus = $location.path().substring($location.path().length, $location.path().lastIndexOf('/') + 1);
            console.log($location.path());
            var status = '';
            var formVariables = [];
            var historyVariable = [];
            var variablesMap = {};
            var shippingorder = [];
            var lang = window.localStorage.lang || 'EN';
            /**
             *
             * loadGateStatus( ctype, language,flag)
             */
            function loadGateStatus() {
                var deferred = $q.defer();
                GateGuest.GetQueryStatus().get({
                    ctype: 'Truck',
                    language: lang,
                    flag: '1'
                }).$promise.then(function (res) {
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
            function loadVehicleTypes() {
                var deferred = $q.defer();
                GateUnJointTruck.UnJointTruckBasic().getVehicleTypes({
                    Language: lang,
                    Type: 'JointTruck'
                }).$promise.then(function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }
            /**
             * loadTruckCompany(language)
             */
            function loadTruckCompany() {
                var deferred = $q.defer();
                GateJointTruck.JointTruckBasic().getTruckCompany({
                    Language: lang
                }).$promise.then(function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;

            }
            /**
             * loadMaterialType(language,type)
             */
            function loadMaterialType() {
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

            $scope.flowkey = 'FEPVJointTruck';
            $scope.trantypes = [{
                'name': $translate.instant('ShipType1'),
                'value': '1'
            }, {
                'name': $translate.instant('ShipType2'),
                'value': '2'
            }];
         
            var vhCol = [{
                    field: 'ShippingOrder',
                    displayName: 'VBELN',
                    minWidth: 120,
                    cellTooltip: true
                },
                {
                    field: 'AB',
                    displayName: 'AB',
                    minWidth: 80,
                    cellTooltip: true
                },
                {
                    field: 'STREET',
                    displayName: 'STREET',
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'CustomerName',
                    displayName: 'CustomerName',
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'Plant',
                    displayName: 'Plant',
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'CenterID',
                    displayName: 'CenterID',
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'WADAT',
                    displayName: 'WADAT',
                    minWidth: 120,
                    cellTooltip: true
                },
                {
                    field: 'Direction',
                    displayName: 'Direction',
                    minWidth: 120,
                    cellTooltip: true
                },
                {
                    field: 'DirectionSPC',
                    displayName: 'DirectionSPC',
                    minWidth: 120,
                    cellTooltip: true
                }
            ]
            /**
             * Shipping grid
             */
            var vcVcol = [{
                    field: 'ShippingOrder',
                    displayName: $translate.instant('ShippingOrder'),


                    minWidth: 120,
                    cellTooltip: true
                },
                {
                    field: 'Direction',
                    displayName: $translate.instant('Direction'),
                    minWidth: 80,
                    cellTooltip: true
                },
                {
                    field: 'MaterialSpc',
                    displayName: $translate.instant('MaterialSpc'),
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'PRquan',
                    displayName: $translate.instant('PRquan'),
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'Requan',
                    displayName: $translate.instant('Requan'),
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'Unit',
                    displayName: $translate.instant('Unit'),
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'Isprn',
                    displayName: $translate.instant('Isprn'),
                    minWidth: 120,
                    cellTooltip: true
                }
            ];

            $scope.getStatus = function (status) {
                var StatusList;

                for (var i = 0; i < $scope.StatusList.length; i++) {

                    if ($scope.StatusList[i].Status == status) {

                        return StatusList = $scope.StatusList[i].Remark;

                    } else {
                        StatusList = status;
                    }
                }
                return StatusList;
            };
            $scope.getTransferCompany = function (id) {
                var transfer;
                for (var i = 0; i < $scope.transfer.length; i++) {
                    if ($scope.transfer[i].ID == id) {
                        return transfer = $scope.transfer[i].Spec;
                    } else {
                        transfer = id;
                    }
                }
                $scope.note.TransferCompany = transfer;
                return transfer;
            };
            $scope.getMaterielType = function (id) {
                var material;
                for (var i = 0; i < $scope.material.length; i++) {
                    if ($scope.material[i].ID == id) {
                        return material = $scope.material[i].Spec;
                    } else {
                        material = id;
                    }
                }
                $scope.note.MaterielType = material;
                return material;
            };
            $scope.getVehicleShape = function (id) {
                var Shape;
                for (var i = 0; i < $scope.Shape.length; i++) {
                    if ($scope.Shape[i].ID == id) {
                        return Shape = $scope.Shape[i].Spec;

                    } else {
                        Shape = id;
                    }
                }
                $scope.note.VehicleShape = Shape;
                return Shape;
            };
            /**
             * initial data
             */
            $q.all([loadGateStatus(), loadVehicleTypes(), loadTruckCompany(), loadMaterialType(), ]).then(function (result) {
                $scope.StatusList = result[0];
                $scope.Shape = result[1];
                $scope.transfer = result[2];
                $scope.material = result[3];

            }, function (error) {
                Notifications.addError({
                    'status': 'Failed',
                    'message': 'Loading failed: ' + error
                });
            });
            $scope.updateSelection = function ($event) {
                var checkbox = $event.target;
                if (checkbox.checked) {
                    document.getElementById('ValidatePeriod').disabled = false;
                    document.getElementById('ValidatePeriod').readOnly = false;
                } else {
                    document.getElementById('ValidatePeriod').disabled = true;
                    document.getElementById('ValidatePeriod').readOnly = true;
                }
            }

            setTimeout(function () {
                GateJointTruck.JointTruckBasic().jointTruckByVoucherID({
                    voucherid: $routeParams.code
                }).$promise.then(function (res) {
                    console.log(res);
                    $scope.note = res;
                    status = res.Status;
                    if (res.Status != 'N') {
                        if ($scope.pagestatus == 'update') {
                            document.getElementById('VehicleShape').disabled = true;
                            document.getElementById('TransferCompany').disabled = true;
                            document.getElementById('Remark').readOnly = true;
                            document.getElementById('DriverPhone').readOnly = true;
                            document.getElementById('Driver').readOnly = true;
                            document.getElementById('VehicleNO').readOnly = true;
                            document.getElementById('ExpectIn').readOnly = true;
                            document.getElementById('ValidatePeriod').disabled = true;
                            document.getElementById('MaterielType').disabled = true;
                            // document.getElementById('ComeTime').readOnly = true;
                        } else {
                            $scope.note.VehicleShape = $scope.getVehicleShape(res.VehicleShape);
                            $scope.note.TransferCompany = $scope.getTransferCompany(res.TransferCompany);
                            $scope.note.MaterielType = $scope.getMaterielType(res.MaterielType);
                        }
                    }
                    $scope.note.Status = $scope.getStatus(status);
                    $scope.note.ExpectIn = $filter('date')($scope.note.ExpectIn, 'yyyy-MM-dd');
                    $scope.note.InTime = $filter('date')($scope.note.InTime, 'yyyy-MM-dd HH:mm:ss');
                    $scope.note.FirstTime = $filter('date')($scope.note.FirstTime, 'yyyy-MM-dd HH:mm:ss');
                    $scope.note.SecondTime = $filter('date')($scope.note.SecondTime, 'yyyy-MM-dd HH:mm:ss');
                    $scope.note.OutTime = $filter('date')($scope.note.OutTime, 'yyyy-MM-dd');
                    $scope.note.ValidatePeriod = $filter('date')($scope.note.ValidatePeriod, 'yyyy-MM-dd');
                    if (res.ShippingOrder != '' && res.ShippingOrder != undefined) {
                        shippingorder = res.ShippingOrder.split(',');
                    }
              
                    $scope.vouchergridOptions.data = res.JointTruckItems;
                    if (res.CompanyCode == 'VH') {
                   
                        $scope.vouchergridOptions.columnDefs = vhCol;
                    } else {
                        $scope.vouchergridOptions.columnDefs = vcVcol;
                   }

                }, function (errResponse) {
                    Notifications.addError({
                        'status': 'error',
                        'message': errResponse
                    })
                });
            }, 500);
            $scope.vouchergridOptions = {
                columnDefs: vhCol,
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
        }
    ])

});