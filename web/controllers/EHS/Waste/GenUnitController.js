define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('GenUnitController', ['$filter', 'Notifications', 'Auth', 'EngineApi', 'CompanyService', 'VoucherService', '$translate', '$q', '$scope', '$routeParams','$timeout',
        function ($filter, Notifications, Auth, EngineApi, CompanyService, VoucherService, $translate, $q, $scope, $routeParams, $timeout) {
            var lang = window.localStorage.lang;
            $q.all([loadSource(), loadArea(), loadDepartment()]).then(function (result) {
                $scope.Search();
            }, function (error) {
                Notifications.addError({
                    'status': 'Failed',
                    'message': 'Loading failed: ' + error
                });
            });

            function loadSource() {
                CompanyService.GenUnit.getList({
                    table: 'SourceKind',
                    lang: lang
                }, function (res) {
                    $scope.lsSource = res;
                    console.log(res);
                })
            }

            function loadArea() {
                CompanyService.GenUnit.getList({
                    table: 'AreaKind',
                    lang: lang
                }, function (res) {
                    $scope.lsArea = res;
                    console.log(res);
                })
            }

            function loadDepartment() {
                VoucherService.GetDepartment({
                    DepartType: 'Department',
                    lang: lang
                }, function (res) {
                    console.log('lsDepartment', res);
                    $scope.lsDepartment = res;
                }, function (error) {})
            }
            var col = [{
                    field: 'GenUnitID',
                    minWidth: 120,
                    displayName: $translate.instant('GenUnitID'),
                    cellTooltip: true,
                    visible: true,
                    // cellTemplate: '<a href="#/waste/Voucher/print/{{COL_FIELD}}" style="padding:5px;display:block; cursor:pointer" target="_blank">{{COL_FIELD}}</a>'
                },
                {
                    field: 'SourceName',
                    minWidth: 100,
                    displayName: $translate.instant('SourceName'),
                    cellTooltip: true
                },
                {
                    field: 'GenUnitName',
                    displayName: $translate.instant('GenUnitName'),
                    minWidth: 110,
                    cellTooltip: true,
                },
                {
                    field: 'AreaName',
                    displayName: $translate.instant('AreaName'),
                    minWidth: 120,
                    cellTooltip: true,
                },
                {
                    field: 'Status',
                    displayName: $translate.instant('Status'),
                    minWidth: 120,
                    cellTooltip: true,
                }
            ];
            $scope.getVoucherStatus = function (id) {
                var statLen = $filter('filter')($scope.statuslist, {
                    'id': id
                });
                if (statLen.length > 0) {
                    return statLen[0].name;
                } else {
                    return id;
                }
            };
            var gridMenu = [{
                    title: $translate.instant('Create'),
                    action: function () {
                        // $scope.reset();
                        $scope.status = 'N';
                        $('#myModal').modal('show');
                    },
                    order: 1
                },
                {
                    title: $translate.instant('Update'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        console.log(resultRows[0]);
                        $scope.status = 'M';
                        $scope.entity = {};
                        $scope.entity = resultRows[0];
                        $('#myModal').modal('show');
                    },
                    order: 2
                },
                {
                    title: $translate.instant('Delete'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        console.log(resultRows[0]);
                        CompanyService.GenUnit.deleteById({
                            GenUnitID: resultRows[0].GenUnitID
                        }, function (res) {
                            MessageReturn(res, 'Delete');
                        })
                    },
                    order: 3
                }
            ];
            /**
             * Query Grid setting
             */
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
                paginationPageSizes: [100, 200, 500, 1000],
                paginationPageSize: 100,
                enableFiltering: false,
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({
                        'userid': Auth.username,
                        'tcode': 'HW-User'
                    }, function (linkres) {
                        if (true) {
                            //linkres.IsSuccess
                            gridApi.core.addToGridMenu(gridApi.grid, gridMenu);
                        }
                    });
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.selectedSupID = row.entity.SupID;
                    });
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                        $scope.Search();
                    });
                }
            };



            $scope.Search = function () {
                CompanyService.GenUnit.searchEntity({
                    genunit: '',
                    source: '',
                    area: '',
                    lang: ''
                }, function (res) {
                    console.log(res);
                    $scope.gridOptions.data = res;
                });
            }
            $scope.Save = function (entity) {
                if ($scope.status == 'N') {
                    CompanyService.GenUnit.createEntity(entity, function (res) {
                        console.log(res);
                        MessageReturn(res, 'Save');
                    })
                } else if ($scope.status == 'M') {
                    CompanyService.GenUnit.updateEntity(entity, function (res) {
                        console.log(res);
                        MessageReturn(res, 'Update');
                    })
                }
            }


            function MessageReturn(messg, messg_signal) {
                if (messg.Success) {
                    $('#myModal').modal('hide');
                    Notifications.addMessage({
                        'status': 'information',
                        'message': $translate.instant(messg_signal + '_Success_MSG') +' '+ messg.Data
                    });
                    $timeout(function () {
                        $scope.Search()
                    }, 1000);
                } else Notifications.addError({
                    'status': 'error',
                    'message': messg_signal + ' Error' + messg.Message
                });
            }





        } //end function controller
    ]) //end controller
}) //define angular