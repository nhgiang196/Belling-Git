/**
 * Created by phkhoi on 07-Sep-17.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("MealDetailsController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'OAServices',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, OAServices) {
            console.log($routeParams.all);
            $scope.dateFrom = $routeParams.code;
            $scope.dateTo = $routeParams.oprea;
            $scope.DepartmentID = $routeParams.dept;
            $scope.IncludeOTUser = $routeParams.all;

            if ($routeParams.dept = 'All')
                $scope.DepartmentID = '';
            $scope.note = {};
            $scope.flowkey = "GateMisUser";
            $scope.query = {};

            OAServices.getInformation.getInfo({
                IncludeOTUser: $scope.IncludeOTUser,
                DateB: $scope.dateFrom,
                DateE: $scope.dateTo,
                UserID: Auth.username,
                DepartmentID: $scope.DepartmentID

            }).$promise.then(function (res) {
                    console.log(res);
                    $scope.note = res;
                    $scope.Lunch = 0;
                    $scope.Dinner = 0;
                    $scope.Night = 0;
					$scope.Breakfast = 0;
                    $scope.Total = 0;
                    for (var i = 0; i < res.length; i++) {
						 $scope.Breakfast += parseInt(res[i].Breakfast);
                        $scope.Lunch += parseInt(res[i].Lunch);
                        $scope.Dinner += parseInt(res[i].Dinner);
                        $scope.Night += parseInt(res[i].Night);
                        $scope.Total += parseInt(res[i].Total);
                    }

                    //$scope.gridOptions.data = res;
                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });
        }])
    ;
})
;