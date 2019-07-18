/**
 * Created by CSP-2015 on 2018-7-20.
 */
define(['myapp', 'angular', 'jquery'], function (myapp, angular, jquery) {
    myapp.controller('CurrentGradeController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'LIMSService', 'LIMSBasic',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, LIMSService, LIMSBasic) {
            $scope.note = {};
            $scope.lang = window.localStorage.lang || 'EN';
            var q_category = {userid: Auth.username, Language: $scope.lang};
            LIMSBasic.GetCategorys(q_category, function (data) {
                console.log(data)
                $scope.CategoryList = data;
            });
            //UI for query
            $scope.$watch('note.TypeID', function (n) {
                if (n != null) {
                    var q_sample = {userid: Auth.username, TypeID: $scope.note.TypeID};
                    LIMSBasic.GetSamplesByCategory(q_sample, function (data) {
                        console.log(data)
                        $scope.SampleList = data;
                    });
                    $scope.note.SampleName=null;
                }
            });

            $scope.Search = function () {
                Query();
            }
            function Query() {
                var query = {};
                query.sampleName = $scope.note.SampleName;
                query.language = $scope.lang;
                LIMSService.gradeVersion.GetCurrentPropertyValue(query).$promise.then(function (res) {
                    console.log(res);

                    $scope.plansHeader = [];
                    if (res.length > 0) {
                        $scope.plansList = res;
                        var plansHeader = [];
                        for (var key in res[0]) {
                            if (key.indexOf('$') < 0) {
                                plansHeader.push(key)
                            }
                        }
                        $scope.plansHeader = plansHeader;
                    }
                })
            }
        }])
    ;
})
