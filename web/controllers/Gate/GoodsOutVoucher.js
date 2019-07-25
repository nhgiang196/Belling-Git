/**
 * Created by ptanh on 4/12/2018.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createGoodVoucher', ['$filter', '$http',
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'uiGridConstants', 'EngineApi',
        'GateGoodsOut', '$translate', '$q', '$upload',
        function ($filter, $http, $routeParams,
            $resource, $location, $interval, Notifications, Forms, Auth, uiGridConstants,
            EngineApi,  GateGoodsOut, $translate, $q, $upload) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    var formVariables = [];
                    var historyVariable = [];
                    var variablesMap = {};
                    var details = {};

                    $scope.upAddition = function () {
                        $('#fileModal').modal('show');
                    };
                    $scope.reset = function (message) {

                        $scope.details = {};
                        $scope.GoodsItems = [];
                        $scope.details.GoodsItems = [];
                        $scope.files = [];
                        if (message != '' && message != undefined) {
                            $scope.Search(message);
                        } else {
                            $scope.Search();
                        }
                        $('#myModal').modal('hide');


                    }


                    $scope.toggleCustom = function () {
                        //   alert("0o");
                        $scope.menuBar = $scope.menuBar === false ? true : false;
                        $('.pinned').toggle(function () {
                            $(this).addClass('highlight');
                            $(this).next().fadeOut(1000);
                        }, function () {
                            $(this).removeClass('highlight');
                            $(this).next('div .content').fadeIn(1000);
                        });
                    };
                },
                templateUrl: './forms/vGateGoodOut/New.html'


            }


        }
    ]);

});