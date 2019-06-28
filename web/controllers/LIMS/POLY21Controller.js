/**
 * Created by ntdung on 12/11/2017.
 */
/*eslint-env jquery*/
define(['myapp', 'angular','jquery'], function (myapp, angular,jquery) {
    myapp.controller('POLY21Controller', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate','LIMSService',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate,LIMSService)
        {
            //$scope.flowkey = "GateMisUser";
            var date = new Date();
            $scope.DateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.DateTo   = $filter('date')(new Date( date.getFullYear(), date.getMonth(), date.getDate()+ 2), 'yyyy-MM-dd');
            $scope.lang = window.localStorage.lang;

            LIMSService.POLY21Controller.getPOLY21Material({},function(res)
            {
                $scope.materialList =res;
                console.log(res)
            });

            $scope.getMonthly = function(checked){
                if (checked) {
                    $scope.Month = 1;
                }
                else {
                    $scope.Month = 0;
                }
            }

            $scope.Search = function(){
                var params = {};
                params.beginTime = $scope.DateFrom;
                params.endTime = $scope.DateTo;
                params.lot_No = $scope.Material||'all';
                params.interval = $scope.Interval||'0';
                params.month = $scope.Month||'0';
                var href = '#/Lims/POLY21Report/'+ $scope.DateFrom + '/' + $scope.DateTo +'/'+  params.lot_No +'/'+ params.interval+'/'+params.month;
                window.open(href);
            }

        }])
    ;
})
;