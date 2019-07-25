/**
 * create common truck
 * create truck guest when submit success
 * it need leader checker ,but truck guest don't need chcker
 * we must write description ,
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createUnjointVoucher', ['$filter', '$http',
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'uiGridConstants', 'EngineApi', 'GateUnJointTruck',
        'GateGuest', 'GateJointTruck', '$translate', '$q',
        function ($filter, $http, $routeParams,
                  $resource, $location, $interval, Notifications, Forms, Auth, uiGridConstants,
                  EngineApi, GateUnJointTruck, GateGuest, GateJointTruck, $translate, $q) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    $scope.ShowSave = true;
                    /**
                     * check this truck in black list
                     */
                    function IsBlackList() {
                        var deferred = $q.defer();
                        GateJointTruck.JointTruckBasic().isInBlackList({vehicle: $scope.note.VehicleNO, type: 'Truck'}).
                            $promise.then(function (res) {
                                if (res.msg) {
                                    deferred.reject(res.msg);
                                } else {
                                    deferred.resolve();
                                }

                            }, function (error) {
                                deferred.reject(error);
                            });
                        return deferred.promise;
                    }

                    /**
                     * save UnjointTruck plan
                     * @param {* N draf and F check} Status
                     */
                    function SaveUnJointCommonVoucher(Status) {
                        var deferred = $q.defer();
                        var query = {};
                        query = $scope.note;
                        query.Status = Status;
                        query.UserID = Auth.username;
                        query.OrderNO = $scope.note.OrderNO || '';
                        query.ImportBatch== $scope.note.OrderNO || "";
                        GateUnJointTruck.SaveUnJointTruck().save(query).$promise.then(function (res) {
                            var voucherid = res.VoucherID;
                            if (voucherid) {
                                deferred.resolve(voucherid);
                            } else {
                                deferred.reject('No voucherID');
                            }
                        }, function (errResponse) {
                            deferred.reject(errResponse);
                        });
                        return deferred.promise;
                    }

                    /**
                     * bpm field and history filed
                     */
                    function CommonParastFiled() {
                        var formVariables = [];
                        var historyVariable = [];
                        formVariables.push({name: 'IsChecker', value: 'YES'});//需要签核
                        formVariables.push({name: 'ChecherArray', value: $scope.checkList});
                        formVariables.push({
                            name: 'start_remark',
                            value: $scope.note.VoucherID + '' + $scope.note.VehicleNO
                        });
                        formVariables.push({name: 'checkoutconfirm', value: 'NO'});
                        formVariables.push({name: 'checkinconfirm', value: 'NO'});//进厂确认
                        formVariables.push({name: 'JWUser', value: 'Guard'});
                        formVariables.push({name: 'VoucherID', value: $scope.note.VoucherID});
                        formVariables.push({name: 'ValidTo', value: $scope.note.ValidatePeriod});
                        historyVariable.push({name: 'VoucherID', value: $scope.note.VoucherID});
                        historyVariable.push({name: 'VehicleNO', value: $scope.note.VehicleNO});
                        historyVariable.push({name: 'Company', value: $scope.note.Manufacturer});
                        historyVariable.push({name: 'OrderNO', value: $scope.note.OrderNO});
                        historyVariable.push({name: 'Material', value: $scope.note.Material});
                        historyVariable.push({name: 'ExpectedIn', value: $scope.note.ExpectIn});
                        historyVariable.push({name: 'ValidTo', value: $scope.note.ValidatePeriod});
                        historyVariable.push({name: 'StorageNO', value: $scope.note.StorageNO});
                        historyVariable.push({name: 'Models', value: $scope.note.VehicleType});
                        historyVariable.push({name: 'Remark', value: $scope.note.Remark});
                        historyVariable.push({name: 'checkoutconfirm', value: 'NO'});
                        return {'formVariables': formVariables, 'historyVariable': historyVariable}
                    }

                    $scope.saveDraft = function () {
                        var promise = saveDraft('N');
                        promise.then(function (result) {
                            Notifications.addMessage({'status': 'info', 'message': 'Success:' + result});
                        }, function (reason) {

                            Notifications.addError({'status': 'error', 'message': reason});
                        })
                    };
                    /**
                     * save plan draft
                     * @param {*plan status} status
                     */
                    function saveDraft(status) {
                        var deferred = $q.defer();
                        var promise = IsBlackList();
                        promise.then(function () {
                            var savepromise = SaveUnJointCommonVoucher(status);
                            savepromise.then(function (voucherid) {
                                $scope.note.VoucherID = voucherid;
                                deferred.resolve(voucherid);
                            }, function (savereason) {
                                deferred.reject(savereason);
                            })

                        }, function (reason) {
                            deferred.reject(reason);
                        });
                        return deferred.promise;
                    }

                    /**
                     * save and sumbit ,the save draft and sumbit create flow ,
                     * ,update status for leader checking  'F'
                     */
                    $scope.submitCommonTruck = function () {

                        if ($scope.checkList.length <= 0) {
                            Notifications.addError({'status': 'error', 'message': $translate.instant('Leader_NO_MSG')});
                            return;
                        }
                        var promise = saveDraft('N');
                        promise.then(function (result) {
                            var submitPromise = submitCommonTruck(result);
                            submitPromise.then(function (submitResult) {
                                if(submitResult){
                                    Notifications.addError({'status': 'info', 'message': 'Create Success'});
                                    $scope.ShowSave = false;
                                }
                            }, function (submitReason) {
                                Notifications.addError({'status': 'error', 'message': submitReason});
                            })
                        }, function (reason) {
                            Notifications.addError({'status': 'error', 'message': reason});
                        })
                    };
                    $scope.ContainerTruckUpdate = function () {
                        if ($scope.note.VehicleType == '19') {
                            GateUnJointTruck.UnJointTruckBasic().updateUnJointTruckVehicleNo({
                                'VoucherID': $scope.note.VoucherID,
                                'VehicleNO': $scope.note.VehicleNO||'',
                                'Container': $scope.note.NewContainerNO||'',
                                'Remark': $scope.note.Remark + Auth.username||'Modify by '+ Auth.username +' at:  '+ $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss')
                            }, {}).$promise.then(function () {
                                    $('#myEditContainer').modal('hide');
                                    $scope.note = {};
                                    $scope.Search('Update successfully');
                                }, function (uerrResponse) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': uerrResponse + 'Update status Failed ,please link IT'
                                    });
                                });
                        }
                    }

                    $scope.addGuest = function () {
                        if (!$scope.note.VoucherID) {
                            Notifications.addMessage({status: 'info', message: 'Please Create Application First.'});
                            return;
                        }
                        $('#myGuestModal').modal('show');
                        $scope.SetGuest($scope.note.ExpectIn, $scope.note.VehicleNO,
                            $scope.note.LinkPhone, $scope.note.Manufacturer);
                        $scope.note = {};
                        $scope.reset();
                        $('#myModal').modal('hide');

                    };
                    $scope.closeCommon = function () {

                        $('#myModal').modal('hide');
                        $('#myEditContainer').modal('hide');
                        $scope.note = {};
                        $scope.reset();
                    };
                    /**
                     * submit data and create a  processing of workflow
                     * @param {*voucherid for bussiness key ,it is only one} voucherID
                     */
                    function submitCommonTruck(voucherID) {
                        var formfiled = CommonParastFiled();
                        var variablesMap = Forms.variablesToMap(formfiled.formVariables);
                        var _historyVariable = Forms.variablesToMap(formfiled.historyVariable);
                        var datafrom = {
                            formdata: variablesMap,
                            businessKey: voucherID,
                            historydata: _historyVariable
                        };
                        var deferred = $q.defer();
                        EngineApi.doStart().start({'id': $scope.definitionID}, datafrom).$promise.then(function (processres) {
                            if (processres.message) {
                                deferred.reject(processres.message);
                            } else {
                                deferred.resolve(voucherID);
                            }

                        }, function (error) {
                            deferred.reject(error);
                        });
                        return deferred.promise;
                    }

                    $scope.$watch('note.ExpectIn', function (n) {
                        if (n !== undefined && $scope.note.ExpectIn !== null) {
                            $scope.note.ValidatePeriod = moment(new Date(n)).add(2, 'days').format('YYYY-MM-DD');
                        }
                    })


                },
                templateUrl: './forms/GateUnjointTruck/createTruckModel.html'


            }


        }]);

});