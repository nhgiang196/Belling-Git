define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createWasteItem', ['$filter', '$http',
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'uiGridConstants', 'EngineApi',
        'GateGuest', '$translate', '$q', 'WasteItemService', '$timeout',
        function ($filter, $http, $routeParams,
            $resource, $location, $interval, Notifications, Forms, Auth, uiGridConstants,
            EngineApi, GateGuest, $translate, $q, WasteItemService, $timeout) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    $scope.username = Auth.username;
                    /**
                     * Init Data to save
                     */
                    function saveInitData() {
                        var note = {};
                        note = $scope.recod;
                        note.Status = $scope.recod.status || '1';
                        return note;
                    }

                    function updateByID(data) {
                        WasteItemService.GetInfoBasic.updateEntity(data, function (res) {
                            $scope.MessageReturn(res, 'Update');
                        })
                    }

                    function SaveItem(data) {
                        WasteItemService.GetInfoBasic.createEntity(data, function (res) {
                            $scope.MessageReturn(res, 'Save');
                        })
                    }

                    $scope.savesubmit = function () {
                        var note = saveInitData();
                        var status = $scope.status;
                        switch (status) {
                            case 'N':
                                SaveItem(note);
                                break;
                            case 'M':
                                updateByID(note);
                                break;
                            default:
                                SaveItem(note);
                                break;
                        }

                    };

                    $scope.MessageReturn = function (messg, messg_signal) {
                        if (messg.Success) {
                            $('#myModal').modal('hide');
                            $('#messageModal').modal('hide');
                            $('#nextModal').modal('hide');
                            Notifications.addMessage({
                                'status': 'information',
                                'message': $translate.instant(messg_signal + '_Success_MSG') + ' ' + messg.Data
                            });
                            $timeout(function () {
                                $scope.Search();
                            }, 1500);
                        } else Notifications.addError({
                            'status': 'error',
                            'message': messg_signal + ' Error' + messg.Message
                        });
                    }

                },
                templateUrl: './forms/EHS/WasteItem/createWasteItem.html'
            }
        }
    ]);
});