define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("ContractorQuaDetailController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'GateGuest',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, GateGuest) {
            function parseArray(arrStr) {
                var tempKey = 'arr23' + new Date().getTime();//arr231432350056527
                var arrayJsonStr = '{"' + tempKey + '":' + arrStr + '}';
                var arrayJson;
                if (JSON && JSON.parse) {
                    arrayJson = JSON.parse(arrayJsonStr);
                } else {
                    arrayJson = eval('(' + arrayJsonStr + ')');
                }
                return arrayJson[tempKey];
            };
            ConQuaService.GetContractor().get({
                idCard: $routeParams.IdCard,
                EmployerId: $routeParams.EmployerId,
                Language: window.localStorage.lang
            }).$promise.then(function (res) {
                    $scope.note = res[0];
                    $scope.note.cers = res[0].Certificates;
                    $scope.note.inss = res[0].Insurances;
                    $scope.note.IdCard = $routeParams.IdCard;
                    $scope.note.ValidTo = $filter('date')($scope.note.ValidTo, 'yyyy-MM-dd');
                    $scope.note.TTValidTo = $filter('date')($scope.note.TTValidTo, 'yyyy-MM-dd');
                    $scope.note.MIValidTo = $filter('date')($scope.note.MIValidTo, 'yyyy-MM-dd');
                    $scope.PersonalEquipment = parseArray(res[0].PersonalEquipment);
                    $scope.note.Employer = res[0].Employer;
                    $scope.trainFile = JSON.parse(res[0].TTFile);
                    $scope.healthFile = JSON.parse(res[0].MIFile);
                    $scope.note.PersonalEquip = "";
                    ConQuaService.GetEquipmentList().get({Language: window.localStorage.lang}).$promise.then(function (res) {
                        $scope.equips = res;
                        for (var i = 0; i < $scope.PersonalEquipment.length; i++) {
                            if ($scope.PersonalEquipment[i] != null && $scope.PersonalEquipment[i] != "false") {
                                for (var j = 0; j < $scope.equips.length; j++) {
                                    var eq = $scope.equips[j]
                                    if (eq.ID == $scope.PersonalEquipment[i]) {
                                        if ($scope.note.PersonalEquip == "") {
                                            $scope.note.PersonalEquip = eq.Equipment;
                                        }
                                        else {
                                            $scope.note.PersonalEquip = $scope.note.PersonalEquip + "/" + eq.Equipment;
                                        }
                                    }
                                }
                            }

                        }
                        //$scope.checkboxes = new Array($scope.equips.length);
                    }, function (errResponse) {
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    });
                }, function (errResponse) {
                    Notifications.addError({'status': 'error', 'message': errResponse});
                });
            $scope.btSelect = function (p) {
                if (p === "YES") {
                    $scope.formVariables.push({name: "agree", value: "YES"});
                } else {
                    $scope.formVariables.push({name: "agree", value: "NO"});
                }
            };
        }
    ])
});