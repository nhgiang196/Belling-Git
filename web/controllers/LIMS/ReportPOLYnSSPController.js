/**
 * Created by ntdung on 12/19/2017.
 */
/*eslint-env jquery*/
define(['myapp', 'angular', 'jquery'], function (myapp, angular, jquery) {
    myapp.controller('ReportPOLYnSSPController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', '$upload',
        '$translatePartialLoader', '$translate', 'LIMSService', 'LIMSBasic', '$q',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, $upload, $translatePartialLoader, $translate, LIMSService, LIMSBasic, $q) {
            var date = new Date();
            $scope.DateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.DateTo = $filter('date')(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2), 'yyyy-MM-dd');
            $scope.lang = window.localStorage.lang;
            $scope.isVisible = false;
            $scope.Month = false;
            /**
             * Auto load SampleName first
             */
            $q.all(LoadSampleName())
            {
            }
            /**
             * GetSampleName
             */
            function LoadSampleName() {
                var q_sample = {userid: Auth.username, TypeID: 2};
                LIMSBasic.GetSamplesByCategory(q_sample, function (data) {
                    console.log(data)
                    $scope.sampleList = data;
                });
            }
            /**
             * Get All LOT_NO in Material from SampleName
             * @param {Get SampleName} sampleName
             */
            function LoadMaterial(sampleName) {
                LIMSBasic.GetMaterial({
                    userid: Auth.username,
                    sampleName: sampleName,
                    query: '0'
                }, function (res) {
                    $scope.materialList = res;
                });
            }
            $scope.change_Material = function (sampleName) {
                LoadMaterial(sampleName);
            }
            $scope.isVisible = false;
            $scope.Search = function () {
                var params = {};
                var from = $scope.DateFrom;
                var to = $scope.DateTo;
                var lot_No = $scope.Material || null;
                var sampleName = $scope.SampleName || '0';
                var line = $scope.Line || 'all';
                var type = $scope.Monthly||false;

                window.open('#/Lims/ReportResult/'+from+'/'+to+'/'+ lot_No+'/'+sampleName+'/'+line+'/'+type);
            }
        }]);
});