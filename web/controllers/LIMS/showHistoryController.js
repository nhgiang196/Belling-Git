/**
 * Created by ptanh on 1/18/2018.
 */
define(['myapp', 'angular'], function (myapp) {
    myapp.controller('showHistoryController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location',
        'i18nService', 'Notifications', 'Auth', 'uiGridConstants', '$http',
        '$translatePartialLoader', '$translate', 'LIMSBasic', 'LIMSService', 'EngineApi',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications
        , Auth, uiGridConstants, $http, $translatePartialLoader, $translate
        ,LIMSBasic, LIMSService, EngineApi) {
            $scope.bpmnloaded=false;
            $scope.dataTest={
                'sampleName': 'S01020002',
                'lotNo': 'CB-600',
                'grades': '00'};
            $scope.showPng = function () {
                if ($scope.bpmnloaded == true) {
                    $scope.bpmnloaded = false;
                } else {
                    $scope.bpmnloaded = true;
                }
            }
            console.log('asdfas'+ $scope.GradeMaterial);
                $scope.modalCancel= function(){
                    $('#showPropertyDetails').modal('hide');
                }




        }]);
});
