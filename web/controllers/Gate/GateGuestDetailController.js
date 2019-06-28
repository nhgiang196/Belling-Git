/**
 * Created by phkhoi on 23-Sep-17.
 */
/**
 * Created by wangyanyan on 2016-10-11.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("GateGuestDetailController", ['$scope', 'EngineApi', '$http', 'IO_BARCODE_TYPES', 'Notifications', '$upload', '$compile', '$filter', 'Auth', 'GateGuest', '$resource', '$routeParams', 'Forms', '$location', 'GateGoodsOut', '$translate',
        function ($scope, EngineApi, $http, IO_BARCODE_TYPES, Notifications, $upload, $compile, $filter, Auth, GateGuest, $resource, $routeParams, Forms, $location, GateGoodsOut, $translate) {
     //       $scope.dateFrom = $filter('date')(new Date(), "yyyy-MM-dd");
            $scope.date = $filter('date')(new Date(), "yyyy-MM-dd");
            var lang = window.localStorage.lang;
            $scope.VoucherID = $routeParams.code;
            $scope.details = {};
            $scope.guestItems = [];
            GateGuest.GuestBasic().getGuestType({language: lang}).$promise.then(function (res) {
                $scope.kind = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            GateGuest.GuestBasic().getGuestRegions({language: lang}).$promise.then(function (res) {
                $scope.regions = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            GateGuest.GetQueryStatus().get({ctype: 'Guest', language: lang, flag: '1'}).$promise.then(function (res) {
                $scope.StatusList = res;

            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });


            $scope.getVoucherStatus = function (Status) {
                var statLen = $filter('filter')($scope.StatusList, {"Status": Status});
                if (statLen.length > 0) {
                    return statLen[0].Remark;
                } else {
                    return Status;
                }
            };

            $scope.getVoucherGuestType = function (GuestType) {
                var statLen = $filter('filter')($scope.kind, GuestType);
                if (statLen.length > 0) {
                    return statLen[0].GuestType;
                } else {
                    return GuestType;
                }
            };
            $scope.getVoucherRegion = function (Region) {
                var statLen = $filter('filter')($scope.regions, Region);
                if (statLen.length > 0) {
                    return statLen[0].Region;
                } else {
                    return Region;
                }
            };

                GateGuest.GuestBasic().getGuest({
                    VoucherID: $scope.VoucherID,
                    Language: lang
                }).$promise.then(function (res) {
                    $scope.details = res[0];
                        $scope.details.Status = $scope.getVoucherStatus($scope.details.Status);
                        $scope.details.GuestType = $scope.getVoucherGuestType($scope.details.GuestType);
                        $scope.details.Region = $scope.getVoucherRegion($scope.details.Region);
                        $scope.guestItems = res[0].GuestItems;
                    console.log(res);
                        var query = {};
                        query.UserID = Auth.username;
                        query.EmployeeID =res[0].Respondent;
                        // Get Name Creator
                        GateGuest.GuestBasic().getNameByEmployeeID(query).$promise.then(function (name) {
                                $scope.RespondentName = name[0].Name;
                            $scope.DepartmentSpc = name[0].Specification;
                            console.log( name);
                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });
                        var Creator = {};
                        Creator.EmployeeID = $scope.details.UserID;
                        Creator.UserID = Auth.username;

                        GateGuest.GuestBasic().getNameByEmployeeID(Creator).$promise.then(function (name1) {
                            $scope.CreateName = name1[0].Name;
                            console.log( name1);
                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });
                        GateGuest.GetGateGuestPID().get({
                            VoucherID:$scope.VoucherID,
                            activityName: "StartEvent_Create"
                        }).$promise.then(function (res) {
                                console.log(res);
                                $scope.processInstanceId = res.ProcessInstanceId;

                                EngineApi.getProcessLogs.getList({"id": $scope.processInstanceId, "cId": ""}, function (data) {
                                    console.log(data);
                                    if (data.length === 0) {
                                        $scope.processLogs = "";
                                    } else {
                                        $scope.processLogs = data[0];
                                        var checkList = $filter('filter')($scope.processLogs.Logs, "Leader check");
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
                    }, function (errormessage) {
                        Notifications.addError({'status': 'error', 'message': errormessage});
                    });


         //   };
        }])
});