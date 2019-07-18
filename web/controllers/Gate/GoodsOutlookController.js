/**
 * Created by wangyanyan on 2016-10-11.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("GoodsOutlookController", ['$scope', 'EngineApi', '$http', 'IO_BARCODE_TYPES', 'Notifications', '$upload', '$compile', '$filter', 'Auth', 'GateGuest', '$resource', '$routeParams', 'Forms', '$location', 'GateGoodsOut', '$translate',
        function ($scope, EngineApi, $http, IO_BARCODE_TYPES, Notifications, $upload, $compile, $filter, Auth, GateGuest, $resource, $routeParams, Forms, $location, GateGoodsOut, $translate) {

            $scope.VoucherID = $routeParams.code;
            var lang = window.localStorage.lang;
            $scope.types = IO_BARCODE_TYPES;
            $scope.type = 'CODE128B';
            $scope.options = {
                width: 2,
                height: 70,
                textAlign: 'center',
                fontSize: 15,
                backgroundColor: '#ffffff',
                lineColor: '#000000'
            };
            $scope.details = {};
            GateGoodsOut.GoodBasic().getGoodByVoucherID({
                VoucherID: $scope.VoucherID,
                language: lang
            }).$promise.then(function (res) {
                console.log(res);
                $scope.details = res[0];
                $scope.details.IsBackinfo = $scope.details.IsBack == true ? $translate.instant('GoodsBack') : $translate.instant('GoodsBackNO')
                $scope.details.ExpectOut = $filter('date')($scope.details.ExpectOut, 'yyyy-MM-dd');
                $scope.details.ExpectBack = $filter('date')($scope.details.ExpectBack, 'yyyy-MM-dd');

                $scope.details.GoodsItems = res[0].GoodsItems || [];
                $scope.filedata = JSON.parse(res[0].FileNames) || [];
                console.log($scope.filedata)
                GateGoodsOut.GetGateGoodsOutPID().get({
                    VoucherID: $scope.VoucherID,
                    activityName: "StartEvent_1"
                }).$promise.then(function (res) {
                        $scope.processInstanceId = res.ProcessInstanceId;
                        //得到日志
                        EngineApi.getProcessLogs.getList({"id": $scope.processInstanceId, "cId": ""}, function (data) {
                            if (data.length === 0) {
                                $scope.processLogs = "";
                            } else {
                                $scope.processLogs = data[0];
                                var checkList = $filter('filter')($scope.processLogs.Logs, "Section manager check");
                                console.log(checkList)
                                for (var i = 0; i < checkList.length; i++) {
                                    if (checkList[i].HistoryField[0].Value == "Offline") {
                                        document.getElementById("check").style.display = "";
                                    }
                                }
                            }
                        });

                    }, function (errormessage) {
                        console.log("no processInstanceId")
                        console.log(errormessage);
                     //   Notifications.addError({'status': 'error', 'message': errormessage});
                    });
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });


            $scope.toggleCustom = function () {
                //   alert("0o");
                $scope.menuBar = $scope.menuBar === false ? true : false;
                $(".pinned").toggle(function () {
                    $(this).addClass("highlight");
                    $(this).next().fadeOut(1000);
                }, function () {
                    $(this).removeClass("highlight");
                    $(this).next("div .content").fadeIn(1000);
                });
            };


            /*   if (voucherStatus.length > 0) {
             GateGoodsOut.GetGateGoodsOutPID().get({
             VoucherID: $routeParams.code,
             activityName: "StartEvent_1"
             }).$promise.then(function (res) {
             $scope.processInstanceId = res.ProcessInstanceId;

             //得到日志
             EngineApi.getProcessLogs.getList({
             "id": $scope.processInstanceId,
             "cId": ""
             }, function (data) {
             if (data.length === 0) {
             $scope.processLogs = "";
             } else {
             $scope.processLogs = data[0];
             }
             });

             }, function (errormessage) {
             Notifications.addError({'status': 'error', 'message': errormessage});
             });
             }*/
        }])
});