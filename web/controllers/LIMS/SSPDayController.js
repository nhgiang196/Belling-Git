/**
 * Created by ntdung on 12/19/2017.
 */
/*eslint-env jquery*/
define(['myapp', 'angular','jquery'], function (myapp, angular,jquery) {
    myapp.controller('SSPDayController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http','$upload', '$translatePartialLoader', '$translate','LIMSService',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, $upload, $translatePartialLoader, $translate,LIMSService)
        {
            var date = new Date();
            $scope.DateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.DateTo   = $filter('date')(new Date( date.getFullYear(), date.getMonth(), date.getDate()+ 2), 'yyyy-MM-dd');
            $scope.lang = window.localStorage.lang;

            LIMSService.SSPDayController.getSSPMaterial({},function(res){
                console.log(res);
                $scope.materialList = res;
            });

            $scope.getMonth = function(Monthly){
                if(Monthly)
                {
                    $scope.Month = 1;
                }else
                {
                    $scope.Month = 0;
                }
            }

            $scope.Search = function(){
                var params = {};
                params.beginTime = $scope.DateFrom;
                params.endTime = $scope.DateTo;
                params.lot_No = $scope.Material||'all';
                params.interval = $scope.Interval||'0';
                params.Line = $scope.Line || 'all';
                params.month = $scope.Month||'0';
                var href = '#/Lims/SSPDayReport/'+ $scope.DateFrom + '/' + $scope.DateTo +'/'+  params.lot_No +'/'+params.Line+'/'+ params.interval +'/'+ params.month;
                window.open(href);


            }

        }])
    ;
})
;