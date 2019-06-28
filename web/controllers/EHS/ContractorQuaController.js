/**
 * Created by wang.chen on 2017/2/16.
 */

define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("ContractorQuaController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'GateGuest',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, GateGuest) {
            var lang = window.localStorage.lang;
            $scope.flowkey = "GateContractorQuaProcess";
            $scope.bpmnloaded = false;
            $scope.note = {};
            $scope.filedata = [];
            $scope.cers = [];
            $scope.inss = [];
            $scope.IsUpdate = false;
            $scope.trainFile = [];
            $scope.healthFile = [];
            $scope.event = {};
            EngineApi.getDepartment().getList({userid: Auth.username, ctype: ""}, function (res) {
                $scope.CDepartmentList = res;
            });
            var col = [{
                field: 'DepartmentID',
                displayName: $translate.instant("Department"),
                minWidth: 100,
                cellTooltip: true
            }, {
                field: 'Employer',
                displayName: $translate.instant("Contractor"),
                minWidth: 100,
                cellTooltip: true
            }, {field: 'StatusRemark', displayName: $translate.instant("Status"), minWidth: 80, cellTooltip: true},
                {
                    field: 'IdCard',
                    cellTemplate: '<a ng-click="grid.appScope.getVoucher(row)"  style="padding:5px;display:block; cursor:pointer">{{COL_FIELD}}</a>',
                    displayName: $translate.instant("GuestIDCard"),
                    minWidth: 200,
                    cellTooltip: true
                },

                {field: 'Name', displayName: $translate.instant("ConName"), minWidth: 200, cellTooltip: true},
                {field: 'Phone', displayName: $translate.instant("phone"), minWidth: 200, cellTooltip: true},
                {field: 'ValidTo', displayName: $translate.instant("ValidTo"), minWidth: 80, cellTooltip: true},
                {field: 'Remark', displayName: $translate.instant("Remark"), minWidth: 80, cellTooltip: true},
                {field: 'TrainTime', displayName: $translate.instant("TrainTime"), minWidth: 80, cellTooltip: true},
                {
                    field: 'MedicalInspection',
                    displayName: $translate.instant("MedicalInspection"),
                    minWidth: 80,
                    cellTooltip: true
                }
            ];
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

                onRegisterApi: function (gridApi) {
                    EngineApi.getTcodeLink().get({"userid": Auth.username, "tcode": $scope.flowkey}, function (linkres) {
                        if (linkres.IsSuccess) {
                            gridApi.core.addToGridMenu(gridApi.grid, gridMenu);
                        }
                    })
                    $scope.gridApi = gridApi;
                }
            };
            var gridMenu= [{
                title: $translate.instant("Create"),
                action: function ($event) {
                    $location.url("/ContractorQua");


                },
                order: 1
            }, {
                title: $translate.instant("Update"),
                action: function ($event) {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    console.log(resultRows[0])
                    if (resultRows.length == 1) {
                        if (resultRows[0].Status == "N" && resultRows[0].UserID == Auth.username) {
                            $location.url("/ContractorQua?EmployerId=" + resultRows[0].EmployerId + "&IdCard=" + resultRows[0].IdCard);
                        }
                        else{
                            Notifications.addError({'status': 'error', 'message': 'You can only edit your draft'});
                        }
                    } else {
                        Notifications.addError({'status': 'error', 'message': $translate.instant("Edit_Draf_MSG")});
                    }
                },
                order: 2
            }, {
                title: 'Detail',
                action: function ($event) {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    console.log(resultRows[0])
                    if (resultRows.length == 1) {

                        $location.url("/ContractorQuaDetail?EmployerId=" + resultRows[0].EmployerId + "&IdCard=" + resultRows[0].IdCard);
                    } else {
                        Notifications.addError({'status': 'error', 'message': $translate.instant("Select_ONE_MSG")});
                    }
                },
                order: 3
            }];
            var query = {};
            query.Language = window.localStorage.lang;
            query.employer = $scope.event.Employer || "";
            query.cType = "";
            query.departmentID = "";
            ConQuaService.GetContractorQualification().get(query).$promise.then(function (res) {
                $scope.EmployerList = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            GateGuest.GetQueryStatus().get({cType:"ConQua",language:lang,flag:""}).$promise.then(function (res) {
                console.log(res);
                $scope.StatusList = res;
            })
            $scope.Search = function () {
                ConQuaService.ContractorList().get({
                    IdCard: $scope.note.IdCard || "",
                    EmployerID: $scope.note.EmployerID || "",
                    Department: $scope.note.Department || "",
                    Language: lang || "",
                    Status:$scope.note.Status ||""
                }).$promise.then(function (res) {
                        $scope.gridOptions.data = res;
                    })
            }

            $scope.showPng = function () {
                if ($scope.bpmnloaded == true) {
                    $scope.bpmnloaded = false;
                } else {
                    $scope.bpmnloaded = true;
                }
            }
            $scope.getVoucher = function (obj) {
                $('#Details').modal('show')
                var EmployerId = obj.entity.EmployerId;
                var IdCard = obj.entity.IdCard;
                if (EmployerId) {
                    ConQuaService.getContractorQuaProcess().get({
                        employer: EmployerId,
                        idCard: IdCard
                    }).$promise.then(function (conres) {
                            $scope.processList = conres;
                        }, function (errResponse) {
                            Notifications.addError({
                                'status': 'error',
                                'message': errResponse
                            });
                        });
                }
            };

        }
    ])
});