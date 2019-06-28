/**
 * Created by ptanh on 4/13/2018.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createPtaEgTruckVoucher', ['$filter', '$http',
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'uiGridConstants', 'EngineApi','GateJointTruck',
        'GateGuest', 'GatePtaEg', '$translate', '$q',
        function ($filter, $http, $routeParams,
            $resource, $location, $interval, Notifications, Forms, Auth, uiGridConstants,
            EngineApi,GateJointTruck,  GateGuest, GatePtaEg, $translate, $q) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    var formVariables = [];
                    var historyVariable = [];
                    var variablesMap = {};
                    $scope.note = {};
                    $scope.note.ExpectIn = $filter('date')(new Date(), 'yyyy-MM-dd');
                    $scope.note.ValidatePeriod = $filter('date')(new Date(), 'yyyy-MM-dd');

                    /**
                     * Check Black List truck
                     */
                    function checkBlackList(vehicleNO){
                        var deferred = $q.defer();
                        GateJointTruck.JointTruckBasic().isInBlackList({
                            vehicle: vehicleNO,
                            type: 'Truck'
                        }).$promise.then(function (res) {
                            if(res.msg){
                                deferred.reject(res.msg);
                            }else{
                                deferred.resolve();
                            }
                        },function(error){
                            deferred.reject(error)
                        })
                        return deferred.promise;

                    }
                    /**
                     * bpm field and history filed
                     */
                    function CommonParastFiled() {
                        formVariables = [];
                        historyVariable = [];
                        formVariables.push({name: 'IsChecker', value: 'NO'});//不签核
                        formVariables.push({name: 'ChecherArray', value: []});
                        formVariables.push({
                            name: 'start_remark',
                            value: $scope.note.VoucherID + ''  + $scope.note.VehicleNO
                        });
                        formVariables.push({name: 'VoucherID', value: $scope.note.VoucherID});
                        historyVariable.push({name: 'VehicleNO', value: $scope.note.VehicleNO});
                        historyVariable.push({name: 'Models', value: $scope.note.PtaEg});
                        historyVariable.push({name: 'ExpectedIn', value: $scope.note.ExpectIn});
                        historyVariable.push({name: 'ValidTo', value: $scope.note.ValidatePeriod});
                        historyVariable.push({name: 'LinkMan', value: $scope.note.LinkMan});
                        return {'formVariables': formVariables, 'historyVariable': historyVariable}
                    }
                    function saveVoucher(status){
                        var deferred =$q.defer();
                        var query = {};
                        query = $scope.note;
                        query.OrderNO = $scope.note.OrderNO || '';
                        query.UserID = Auth.username;
                        query.Status = status;
                        query.PtaEg= $scope.note.PtaEg.ID||'';
                        GatePtaEg.GatePtgEgTruckBasic().savePtaEgTruck(query).$promise.then(function (res) {
                            $scope.note.VoucherID=res.VoucherID;
                            deferred.resolve(res.VoucherID);

                        },function(error){
                            deferred.reject(error);
                        })
                        return deferred.promise;
                    }
                    function submitPtaEgTruck(voucherID) {
                        var formfiled = CommonParastFiled();
                        variablesMap={};
                        variablesMap = Forms.variablesToMap(formfiled.formVariables);
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
                    $scope.savesubmit = function () {
                        var backListpromise = checkBlackList($scope.note.VehicleNO);
                        backListpromise.then(function(){
                            var savepromise = saveVoucher('N');
                            savepromise.then(function(result){
                                var submitpormise= submitPtaEgTruck(result);
                                submitpormise.then(function(res){
                                    if(res){
                                        Notifications.addError({'status': 'info', 'message': 'Create Success'});
                                    }
                                },function(error){
                                    Notifications.addError({'status': 'error', 'message': error});
                                })
                            },function(error){
                                Notifications.addError({'status': 'error', 'message': error});
                            })
                        },function(error){
                            Notifications.addError({'status': 'error', 'message': error});

                        })

                    }
                },
                templateUrl: './forms/GatePtaEgTruck/createPtaEgTruckVoucher.html'
            }
        }]);

});