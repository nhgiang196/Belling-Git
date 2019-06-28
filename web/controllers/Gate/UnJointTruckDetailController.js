/**
 * Created by wangyanyan on 2017/3/17.
 */
define(['myapp', 'angular'], function (myapp, angular) {

    myapp.controller("UnJointTruckDetailController", ['$scope', 'EngineApi', '$http', '$timeout', 'Notifications', '$upload', '$compile', '$filter', 'Auth', '$resource', '$routeParams',  'Forms', '$location', 'GateUnJointTruck', 'GateGuest', 'GateJointTruck',
        function ($scope, EngineApi, $http, $timeout, Notifications, $upload, $compile, $filter, Auth, $resource, $routeParams, Forms, $location, GateUnJointTruck, GateGuest, GateJointTruck) {

            var lang = window.localStorage.lang;
            if ($routeParams.code) {
                var voucherid = $routeParams.code;


                GateUnJointTruck.GetGateUnjointTruckPID().get({
                    VoucherID: voucherid,
                    activityId: "StartUnjointTruck"
                }).$promise.then(function (res) {
                        $scope.processInstanceId =  res.ProcessInstanceId;
                    }, function (errormessage) {
                        Notifications.addError({'status': 'error', 'message': errormessage});
                    });
                GateUnJointTruck.UnJointTruckBasic().unJointTruckByVoucherID({voucherid: voucherid}).$promise.then(function (res) {
                    $scope.note = res;
                    $scope.note.ExpectIn = $filter('date')($scope.note.ExpectIn, 'yyyy-MM-dd');
                    $scope.note.ValidatePeriod = $filter('date')($scope.note.ValidatePeriod, 'yyyy-MM-dd');
                    GateUnJointTruck.UnJointTruckBasic().getVehicleTypes({Language:lang,Type:"UnJointTruck"}).$promise.then(function (sharpres) {
                        $scope.note.VehicleTypeRemark = $filter('filter')(sharpres, {"ID": $scope.note.VehicleType})[0].Spec;

                    }, function (errResponse) {
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    });

                }, function (errResponse) {
                    Notifications.addError({'status': 'error', 'message': errResponse});
                });


            }
        }])

})