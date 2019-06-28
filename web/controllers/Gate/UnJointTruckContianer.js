/**
 * Create  Common truck's plan  by Container and orderNO
 * Container and OrderNo is ONLY ONE
 * valid Data To is pickdate  +30 day  ,when pickdate is null for current day
 * One time may select many rows ,a container for a voucherID 、a  PID
 *
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createContainer', ['$filter', '$http',
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'uiGridConstants', 'EngineApi', 'GateUnJointTruck',
        'GateGuest', 'GateJointTruck', '$translate', '$q',
        function ($filter, $http, $routeParams,
                  $resource, $location, $interval, Notifications, Forms, Auth, uiGridConstants,
                  EngineApi, GateUnJointTruck, GateGuest, GateJointTruck, $translate, $q) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    $scope.cc = {};
                    $scope.query = {};
                    $scope.query.EstimatedDate = $filter('date')(new Date(), 'yyyy-MM-dd');

                    $scope.cc.LinkMan = $scope.LineMan;
                    /**
                     * Query Container with IE System and delete  already exist
                     */
                    $scope.queryContainer = function () {
                        if (!$scope.query.OrderNO && !$scope.query.EstimatedDate) {
                            Notifications.addError({'status': 'error', 'message': 'it need have a condition'});
                        } else {
                            GateUnJointTruck.UnJointTruckBasic().getVehicleTransfer({
                                BLNo: $scope.query.OrderNO || '',
                                date: $filter('date')($scope.query.EstimatedDate, 'yyyy-MM-dd') || ''
                            }).$promise.then(function (data) {
                                    $scope.vouchergridOptions.data = data;
                                })
                        }
                    };
                    // Container Filed grid view
                    var vcol = [{
                        field: 'CompanyCode',
                        displayName: $translate.instant('Company Code'),
                        minWidth: 80,
                        cellTooltip: true
                    }
                        , {field: 'BLNo', displayName: $translate.instant("B/L NO"), minWidth: 120, cellTooltip: true},
                        {
                            field: 'ForwarderCompanyCH',
                            displayName: $translate.instant("Company"),
                            minWidth: 120,
                            cellTooltip: true
                        },
                        {
                            field: 'ContainerNo',
                            displayName: $translate.instant("Container No"),
                            minWidth: 80,
                            cellTooltip: true
                        },
                        {
                            field: 'ContType',
                            displayName: $translate.instant("Container Type"),
                            minWidth: 100,
                            cellTooltip: true
                        },
                        {
                            field: 'InnerGoodsCode',
                            displayName: $translate.instant("InnerGoodsCode"),
                            minWidth: 120,
                            cellTooltip: true
                        }
                        , {
                            field: 'TradeOfMaterial',
                            displayName: $translate.instant("Trade Of Material"),
                            minWidth: 120,
                            cellTooltip: true
                        }
                        , {
                            field: 'LoadMode',
                            displayName: $translate.instant("Load Mode"),
                            minWidth: 80,
                            cellTooltip: true
                        }
                        , {field: 'ETA', displayName: $translate.instant("ETA"), minWidth: 120, cellTooltip: true},
                        {
                            field: 'EstimatedPickUpDate',
                            displayName: $translate.instant("Estimated pick up date"),
                            minWidth: 180,
                            cellTooltip: true
                        }];
                    $scope.vouchergridOptions = {
                        columnDefs: vcol,
                        data: [],
                        multiSelect: true,
                        enableColumnResizing: true,
                        enableSorting: true,
                        showGridFooter: false,
                        enableGridMenu: true,
                        exporterMenuPdf: true,
                        enableSelectAll: true,
                        enableRowHeaderSelection: true,
                        enableRowSelection: true,
                        paginationPageSizes: [50, 100, 200],
                        paginationPageSize: 50,
                        onRegisterApi: function (ordergridApi) {
                            $scope.ordergridApi = ordergridApi;
                        }

                    };
                    /** define from field and history log field */
                    function paraField(result) {
                        var formVariables = [];
                        var historyVariable = [];
                        formVariables.push({name: 'IsChecker', value: 'NO'});
                        //formVariables.push({name: 'ChecherArray', value: leaderList    }); //不签核
                        formVariables.push({name: 'start_remark', value: result.VoucherID + '' + result.VehicleNO});
                        formVariables.push({name: 'JWUser', value: 'Guard'});
                        formVariables.push({name: 'VoucherID', value: result.VoucherID});// result.VoucherID});
                        /*injugde  : user need confirm check in and check out 
                         checkoutconfirm = YES ,initiator_confirm   var
                         formVariables.push({name: 'initiator_confirm', value: Auth.username});
                         */
                        formVariables.push({name: 'ValidTo', value: result.ValidatePeriod});
                        formVariables.push({name: 'checkinconfirm', value: 'NO'});//进厂确认
                        formVariables.push({name: 'checkoutconfirm', value: 'NO'});//出厂确认
                        historyVariable.push({name: 'VoucherID', value: result.VoucherID});
                        historyVariable.push({name: 'VehicleNO', value: result.VehicleNO});
                        historyVariable.push({name: 'Company', value: result.Manufacturer});
                        historyVariable.push({name: 'OrderNO', value: result.OrderNO});
                        historyVariable.push({name: 'Material', value: result.Material});
                        historyVariable.push({name: 'ExpectedIn', value: result.ExpectIn});
                        historyVariable.push({name: 'ValidTo', value: result.ValidatePeriod});
                        historyVariable.push({name: 'StorageNO', value: result.StorageNO});
                        historyVariable.push({name: 'Models', value: result.VehicleType});
                        historyVariable.push({name: 'Remark', value: result.Remark || ''});
                        historyVariable.push({name: 'PO', value: result.PO || ''});
                        historyVariable.push({name: 'checkoutconfirm', value: 'NO'});
                        return {'formVariables': formVariables, 'historyVariable': historyVariable}
                    }

                    $scope.close = function () {
                        $scope.cc = {};
                        $scope.Error = '';
                        $scope.vouchergridOptions.data = [];
                        $('#myModalContainer').modal('hide');
                        $scope.reset();
                    };

                    /**
                     * Save Data and submit
                     * @param {*} status  Voucher's Status
                     */
                    function SaveContainer(status) {
                        if ($scope.definitionID) {
                            var resultRows = $scope.ordergridApi.selection.getSelectedRows();
                            var deferred = $q.defer();
                            if (resultRows.length > 0) {
                                if (resultRows.length <= 6) {
                                    var containers = [];
                                    for (var i = 0; i < resultRows.length; i++) {
                                        var item = resultRows[i];
                                        var note = {};
                                        note.LinkMan = $scope.cc.LinkMan;
                                        note.LinkPhone = $scope.cc.LinkPhone;
                                        note.Remark = $scope.cc.Remark;
                                        note.PO = $scope.cc.PO;
                                        var nowdate = $filter('date')(new Date(), 'yyyy-MM-dd');
                                        if (!item.EstimatedPickUpDate) {
                                            note.ExpectIn = nowdate;
                                        } else {
                                            note.ExpectIn = moment(item.EstimatedPickUpDate).format('YYYY-MM-DD');
                                        }
                                        note.ValidatePeriod = moment(new Date(note.ExpectIn)).add(30, 'days').format('YYYY-MM-DD');
                                        note.Status = status;
                                        note.UserID = Auth.username;
                                        note.OrderNO = item.BLNo;
                                        note.VehicleNO = item.ContainerNo;
                                        note.StorageNO = item.ContType + '-' + item.ContainerNo;
                                        note.Manufacturer = item.CompanyCode;
                                        note.Material = item.TradeOfMaterial || '';
                                        note.ImportBatch= item.InnerGoodsCode || '';
                                        note.VehicleType = '19';
                                        containers.push(note);
                                    }
                                    console.log(containers);
                                    GateUnJointTruck.SaveUnJointList().save({Trucks: containers}).$promise.then(function (response) {
                                        $scope.Error = response.Error;
                                        deferred.resolve(response);
                                    }, function (errResponse) {
                                        deferred.reject(errResponse);
                                    });
                                } else {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': 'No row, or Cannot over 6 selected'
                                    });
                                }
                            } else {
                                deferred.reject('please selection Row');
                            }
                        } else {
                            deferred.reject('Donot get UserKEY');
                        }

                        return deferred.promise;
                    }

                    $scope.createVoucherandSumbit = function () {
                        var promise = SaveContainer('N');
                        promise.then(function (reslist) {
                            //submit 
                            var completeCount = 0;
                            var successCount = 0;


                            if (reslist.Error) {
                                Notifications.addError({'status': 'error', 'message': reslist.Error});
                                return;
                            }
                            if (reslist.Data.length > 0 && reslist.Data.length <= 6) {
                                var deferred = $q.defer();
                                angular.forEach(reslist.Data, function (voucher) {
                                    var formfiled = paraField(voucher);
                                    var variablesMap = Forms.variablesToMap(formfiled.formVariables);
                                    var _historyVariable = Forms.variablesToMap(formfiled.historyVariable);
                                    var datafrom = {
                                        formdata: variablesMap,
                                        businessKey: voucher.VoucherID,
                                        historydata: _historyVariable
                                    };
                                    EngineApi.doStart().start({'id': $scope.definitionID}, datafrom).$promise.then(function (processres) {
                                        if (processres.message) {
                                            $scope.Error = $scope.Error || '' + processres.message;
                                        } else {
                                            successCount++;
                                        }
                                        completeCount++;
                                        if (completeCount == reslist.Data.length) {
                                            deferred.resolve(successCount);
                                        }
                                    }, function (error) {
                                        completeCount++;
                                        if (completeCount == reslist.Data.length) {
                                            deferred.reject();
                                        }
                                    });

                                });
                                deferred.promise.then(function (results) {
                                    //query data
                                    Notifications.addMessage({
                                        'status': 'info',
                                        'message': results + ' rows: was created successfully '
                                    });
                                    $scope.vouchergridOptions.data = [];
                                    $('#myModalContainer').modal('hide');


                                }, function (error) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': 'Creating  failed: ' + error.message
                                    });
                                });
                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': 'No row, or Cannot over 6 selected'
                                });
                            }
                        }, function (error) {
                            Notifications.addError({'status': 'error', 'message': error});
                        })
                    }
                },
                templateUrl: './forms/GateUnjointTruck/createContainer.html'
            }


        }]);

});