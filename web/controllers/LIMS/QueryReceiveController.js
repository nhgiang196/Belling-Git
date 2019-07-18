/**
 * Created by phkhoi on 12/14/2017.
 */
/*eslint-env jquery*/
define(['myapp', 'angular', 'jquery'], function (myapp, angular, jquery) {
    myapp.controller('QueryReceiveController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'LIMSService', 'LIMSBasic',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, LIMSService, LIMSBasic) {

            $scope.note = {};
            $scope.flowkey = 'PVLIMS-010';
            $scope.lang = window.localStorage.lang;
            $scope.note.DateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.note.DateTo = $filter('date')(new Date(), 'yyyy-MM-dd');
            // Get SampleName
            var q_category = {userid: Auth.username, Language: $scope.lang};
            LIMSBasic.GetCategorys(q_category, function (data) {
                console.log(data)
                $scope.CategoryList = data;
                $scope.note.TypeID=5;
            });
            //UI for query
            $scope.$watch('note.TypeID', function (n) {
                if (n != null) {
                    var q_sample = {userid: Auth.username, TypeID: $scope.note.TypeID};
                    LIMSBasic.GetSamplesByCategory(q_sample, function (data) {
                        console.log(data)
                        $scope.SampleList = data;
                    });
                }
            });

            $scope.getSampleName = function (sample) {
                var statLen = $filter('filter')($scope.SampleList, {'SampleName': sample});
                if (statLen.length > 0) {
                    return statLen[0]['Description_'+$scope.lang];
                } else {
                    return sample;

                }

            };
            $scope.Search = function () {
                Query();
            }
            function Query() {
                var query = {};
                query.B = $scope.note.DateFrom || '';
                query.E = $scope.note.DateTo || '';
                query.SampleName = $scope.note.SampleName || '';
                LIMSService.Entrusted.queryReceives(query).$promise.then(function (res) {
                    console.log(res);
                    $scope.gridOptions.data = res;
                })
            }
          
            var col = [
                {
                    field: 'VoucherID',
                    displayName: $translate.instant('VoucherID'),
                    cellTemplate: '<a ng-click="grid.appScope.getVoucher(row)"  style="padding:5px;display:block; cursor:pointer">{{COL_FIELD}}</a>',
                    minWidth: 120,
                    cellTooltip: true
                },
                {
                    field: 'SampleName',
                    displayName: $translate.instant('SampleName'),
                    minWidth: 150,
                    cellTooltip: true,
                    cellTemplate: '<span  >{{grid.appScope.getSampleName(row.entity.SampleName)}}</span>'
                },
                { field: 'PO_NO', displayName: $translate.instant('PO_NO'), minWidth: 100, cellTooltip: true },
                { field: 'Vendor', displayName: $translate.instant('Vendor'), minWidth: 100, cellTooltip: true },
                { field: 'Quatity', displayName: $translate.instant('Quatity'), minWidth: 100, cellTooltip: true },
                { field: 'Unit', displayName: $translate.instant('Unit'), minWidth: 100, cellTooltip: true },
                { field: 'ProdDate', displayName: $translate.instant('ProdDate'), minWidth: 100, cellTooltip: true },
                { field: 'Remark', displayName: $translate.instant('Remark'), minWidth: 100, cellTooltip: true },
                { field: 'State', displayName: $translate.instant('Status'), minWidth: 100, cellTooltip: true },
            ]
            $scope.gridOptions = {
                columnDefs: col,
                data: [],
                enableColumnResizing: true,
                enableSorting: true,
                showGridFooter: true,
                enableGridMenu: true,
                exporterOlderExcelCompatibility: true,
                enableSelectAll: false,
                enableRowHeaderSelection: true,
                enableRowSelection: true,
                multiSelect: true,
                paginationPageSizes: [50, 100, 200, 500],
                paginationPageSize: 50,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true

            };

            $scope.getVoucher = function (obj) {
                $('#myModal').modal('show')
                var id = obj.entity.VoucherID;
                $scope.Remark = obj.entity.Remark;
                console.log($scope.Remark);
                LIMSService.Entrusted.ReceiveDetailsByVoucherID({ VoucherID: id }).$promise.then(function (res) {
                    console.log(res);

                    $scope.plansHeader = [];
                    if (res.length > 0) {
                        $scope.plansList = res;
                        var plansHeader = [];
                        for (var key in res[0]) {
                            if (key.indexOf('$') < 0 && key.indexOf('VoucherID')) {
                                plansHeader.push(key)
                            }
                        }
                        $scope.plansHeader = plansHeader;

                    }
                    //res.push($scope.Remark)
                    //$scope.gridOptions1.data= res;

                }, function (errormessage) {
                    Notifications.addError({ 'status': 'error', 'message': errormessage });
                });



            }
        }])
    ;
})