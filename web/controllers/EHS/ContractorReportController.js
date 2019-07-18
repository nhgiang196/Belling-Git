/**
 * Created by wangyanyan on 2017/2/21.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("ContractorReportController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'GateGuest',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, GateGuest) {
            var lang = window.localStorage.lang;
            ConQuaService.ContractorTypeList().get({kind: "Kind", language: lang}).$promise.then(function (res) {
                $scope.KindList = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            EngineApi.getDepartment().getList({userid: Auth.username, ctype: ""}, function (res) {
                $scope.CDepartmentList = res;
            });
            var col = [
                {
                    field: 'Employer',
                    cellTemplate: '<a ng-click="grid.appScope.getVoucher(row)"  style="padding:5px;display:block; cursor:pointer">{{COL_FIELD}}</a>',
                    displayName: $translate.instant("ConQua_Employer"),
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'ContracorKind',
                    displayName: $translate.instant("ConQua_CType"),
                    minWidth: 105,
                    cellTooltip: true
                },
                {field: 'ContracorType', displayName: $translate.instant("Type"), minWidth: 105, cellTooltip: true},
                {field: 'Rcode', displayName: $translate.instant("ConQua_Rcode"), minWidth: 200, cellTooltip: true},

                {field: 'Remark', displayName: $translate.instant("Remark"), minWidth: 200, cellTooltip: true},
                {
                    field: 'Specification',
                    displayName: $translate.instant("ConQua_paraDepartment"),
                    minWidth: 80,
                    cellTooltip: true
                },
                {field: 'StatusRemark', displayName: $translate.instant("Status"), minWidth: 80, cellTooltip: true}
            ];
            $scope.getVoucher = function (obj) {
                var EmployerId = obj.entity.EmployerId;
                if (EmployerId) {
                    ConQuaService.ContractorQualification().get({employerid: EmployerId}).$promise.then(function (statres) {
                        if (statres) {
                            if (statres.Status == "N") {
                                $location.url("/Contractor?employerId=" + EmployerId + "&userid=" + statres.UserID + "&status=N");
                            } else {
                                //明细
                                $location.url("/Contractor/Detail?employerId=" + EmployerId);
                            }
                        }
                    }, function (errResponse) {
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    })
                }
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
                gridMenuCustomItems: [{
                    title: $translate.instant("Create"),
                    action: function ($event) {
                        $location.url("/Contractor?status=N");
                    },
                    order: 1
                }, {
                    title: $translate.instant("Update"),
                    action: function ($event) {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();

                        if (resultRows.length == 1) {
                            var e = resultRows[0];
                            //如果是草稿提交流程
                            if (e.EmployerId) {
                                ConQuaService.ContractorQualification().get({employerid: e.EmployerId}).$promise.then(function (statres) {
                                    if (statres) {
                                        if (statres.Status == "Q" || statres.Status == "X") {
                                            $location.url("/Contractor?employerId=" + statres.EmployerId + "&userid=" + statres.UserID + "&status=Q");
                                        } else {
                                            Notifications.addError({'status': 'error', 'message': "状态不对，不能修改！"});
                                        }
                                    }
                                }, function (errResponse) {
                                    Notifications.addError({'status': 'error', 'message': errResponse});
                                })
                            }
                        }
                    },
                    order: 2
                }, {
                    title: $translate.instant("Delete"),
                    action: function ($event) {
                        /*   var href =/gate/GoodsOut/:code/:oprea
                         window.open(href);*/
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        var e = resultRows[0];
                        console.log(e)
                        if (resultRows.length == 1) {
                            var projects = {};
                            projects.Employer = e.Employer;
                            var r = confirm($translate.instant("Delete_IS_MSG") + $translate.instant("Contractor") + "[" + e.Employer + "]？");
                            if (r == true) {
                                if (e.Status == "Q") {
                                    $('#delConfirm').modal('show');
                                }
                                else {
                                    /*  //查找包商信息
                                     ConQuaService.DelContractorQualification(projects, function (message) {
                                     if (message) {
                                     Notifications.addError({
                                     'status': 'error',
                                     'message': $translate.instant("Delete_Failed_Msg") + message
                                     });
                                     } else {
                                     alert($translate.instant("Delete_Succeed_Msg"));
                                     $scope.eCheck.splice($scope.eCheck.indexOf(e), 1);
                                     }
                                     });*/
                                }

                            }
                        }
                    },
                    order: 3
                }],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;

                }
            };
            $scope.QueryInfo = function () {
                QueryInfoList();
            };

            //查询承揽商资质列表
            function QueryInfoList() {

                ConQuaService.ContractorQualification().getList({
                    "employer": "",
                    cType: "",
                    language: lang,
                    departmentID: ""
                }).$promise.then(function (res) {
                        $scope.gridOptions.data = res;

                    }, function (errResponse) {
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    });
            }
        }])
})