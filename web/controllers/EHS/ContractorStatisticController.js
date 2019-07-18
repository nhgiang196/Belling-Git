/**
 * Created by wangyanyan on 2017/5/10.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("ContractorStatisticController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'GateGuest','uiGridConstants',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, GateGuest,uiGridConstants) {
            var DepartmentList = [];
            EngineApi.getDepartment().getList({userid: Auth.username, ctype: ""}, function (res) {
                $scope.CDepartmentList = res;
                for(var i = 0;i<res.length;i++)
                {
                    var depart = {}
                    depart.value =  res[i].DepartmentID;
                    depart.label = res[i].Specification;
                    DepartmentList.push(depart)
                }
            });
            $scope.note = {};
            $scope.note.SDate = $filter('date')(new Date(), "yyyy-MM-dd");
            var query = {};
            query.Language = window.localStorage.lang;
            query.employer = "";
            query.cType = "";
            query.departmentID = "";
            ConQuaService.GetContractorQualification().get(query).$promise.then(function (res) {
                $scope.EmployerList = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            $scope.getDepartment = function (row) {
                console.log(row)
                var statLen = $filter('filter')($scope.CDepartmentList, {"DepartmentID": row});
                if (statLen.length > 0) {
                    return row +"-"+ statLen[0].Specification;
                } else {
                    return row;
                }
            }
            $scope.showLogDetail = function(employer){
                console.log(employer)
                $('#Modal').modal('show')
                ConQuaService.ContractorStatisticDetail().get({
                    date: $scope.note.SDate || "",
                    employerId:  "",
                    employer: employer.entity.Empolyer ||""
                }).$promise.then(function (res) {
                       console.log(res)
                        for(var i = 0;i<res.length;i++)
                        {
                            res[i].Operate = (res[i].Operate == "1") ? $translate.instant('OutOperate') : $translate.instant('InOperate');
                        }
                        $scope.DetailList = res
                    }, function (errResponse) {
                        Notifications.addError({
                            'status': 'error',
                            'message': errResponse
                        });
                    });
            }
            var col = [
                {
                    field: 'DepartmentID',
                    displayName: $translate.instant("ConQua_paraDepartment"),
                    minWidth: 250,
                    cellTooltip: true,
                    cellTemplate: ' <span  >{{grid.appScope.getDepartment(row.entity.DepartmentID)}}</span>'
                },
                {
                    field: 'Empolyer',
                    displayName: $translate.instant("ConQua_Employer"),
                    minWidth: 100,
                    cellTooltip: true,
                    enableFiltering: false,
                    cellTemplate: '<a ng-click="grid.appScope.showLogDetail(row)"  style="padding:5px;display:block; cursor:pointer">{{COL_FIELD}}</a>'
                },
                {
                    field: 'DateForm',
                    displayName: $translate.instant("date"),
                    minWidth: 100,
                    cellTooltip: true,
                    enableFiltering: false
                },

                {
                    field: 'PeopleCount',
                    displayName: $translate.instant("PeopleCount"),
                    minWidth: 80,
                    cellTooltip: true,
                    enableFiltering: false
                },
                {
                    field: 'FactoryCount',
                    displayName: $translate.instant("FactoryCount"),
                    minWidth: 80,
                    cellTooltip: true,
                    enableFiltering: false
                },
                {
                    field: 'InCount',
                    displayName: $translate.instant("InCount"),
                    minWidth: 80,
                    cellTooltip: true,
                    enableFiltering: false
                },
                {
                    field: 'OutCount',
                    displayName: $translate.instant("OutCount"),
                    minWidth: 80,
                    cellTooltip: true,
                    enableFiltering: false
                },
                {
                    field: 'InvialCount',
                    displayName: $translate.instant("invial"),
                    minWidth: 80,
                    cellTooltip: true,
                    enableFiltering: false
                }
            ];
            $scope.QueryInfo = function () {
                var employerSpec = "";
                if ($scope.note.EmployerID != "" && $scope.note.EmployerID != null) {
                    employerSpec = $filter('filter')($scope.EmployerList, {"EmployerId": $scope.note.EmployerID})[0].Employer;
                }
                ConQuaService.ContractorStatistic().get({
                    date: $scope.note.SDate || "",
                    employerId: $scope.note.EmployerID || "",
                    employer: employerSpec || ""
                }).$promise.then(function (res) {
                        $scope.gridOptions.data = res;
                    }, function (errResponse) {
                        Notifications.addError({
                            'status': 'error',
                            'message': errResponse
                        });
                    });
            }
            $scope.gridOptions = {
                columnDefs: col,
                data: [],
                enableColumnResizing: true,
                enableSorting: true,
                showGridFooter: false,
                enableGridMenu: true,
                exporterMenuPdf: false,
                enableSelectAll: false,
                enableRowHeaderSelection: true,
                enableRowSelection: true,
                multiSelect: false,
                paginationPageSizes: [50, 100, 200, 500],
                paginationPageSize: 50,
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,
                enableFiltering: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                }
            };
        }
    ])
})
