/**
 * Created by wangyanyan on 2016-09-18.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("PtaEgTruckDetailController", ['$scope', 'EngineApi', '$http', '$timeout', 'Notifications', '$upload', '$compile', '$filter', 'Auth', '$resource', 'uiGridConstants', '$location', '$routeParams', 'GatePtaEg','GateGuest',
        function ($scope, EngineApi, $http, $timeout, Notifications, $upload, $compile, $filter, Auth, $resource, uiGridConstants, $location, $routeParams, GatePtaEg,GateGuest) {

            var lang = window.localStorage.lang;
            if ($routeParams.code) {
                var voucherid = $routeParams.code;
                console.log(voucherid)
                GatePtaEg.GetGatePtaEgTruckPID().get({
                    VoucherID: voucherid,
                    activityId: "StartEvent_create"
                }).$promise.then(function (res) {
                        $scope.processInstanceId = res.ProcessInstanceId;
                    }, function (errormessage) {
                        Notifications.addError({'status': 'error', 'message': errormessage});
                    });
                GatePtaEg.GatePtgEgTruckBasic().ptaEgTruckByVoucherID({voucherid: $routeParams.code}).$promise.then(function (res) {
                    console.log(res);
                    $scope.note = res;
                    $scope.note.ExpectIn = $filter('date')($scope.note.ExpectIn, 'yyyy-MM-dd');
                    $scope.note.ValidatePeriod = $filter('date')($scope.note.ValidatePeriod, 'yyyy-MM-dd');
                    $scope.note.Stamp = $filter('date')($scope.note.Stamp, 'yyyy-MM-dd');
                    GatePtaEg.GatePtgEgTruckBasic().getPtaEgTypes({
                        Language: lang,
                        Type: "PtaEgTruck"
                    }).$promise.then(function (res) {
                            $scope.material = res;
                            $scope.note.PtaEgRemark = $filter('filter')($scope.material, {"ID": $scope.note.PtaEg})[0].Spec;
                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });
                    GateGuest.GetQueryStatus().get({ctype: 'Truck', language: lang, flag: '1'}).$promise.then(function (res) {
                        $scope.StatusList = res;
                        $scope.note.StatusRemark = $filter('filter')($scope.StatusList, {"Status": $scope.note.Status})[0].Remark;
                    }, function (errResponse) {
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    });

                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });
            }


        }])
})