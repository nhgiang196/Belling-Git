/**
 * Created by wang.chen on 2016/8/22.
 */
define(['myapp', 'angular'], function(myapp, angular) {
    myapp.controller("BlackListController", ['$rootScope', '$scope', '$filter', '$http', '$compile', '$routeParams', '$resource', '$location', '$interval', 'Notifications', 'Forms', 'Auth','EngineApi','GateBlackList',
        function ($rootScope, $scope, $filter, $http, $compile, $routeParams, $resource, $location, $interval, Notifications, Forms, Auth, EngineApi,GateBlackList) {
            $scope.StatusList = [
                {"name": "全部", "value": "全部"},
                {"name": "待签核", "value": "待签核"},
                {"name": "签核中", "value": "签核中"},
                {"name": "已签核", "value": "已签核"},
                {"name": "退回", "value": "退回"},
                {"name": "作废", "value": "作废"}
            ];
            $scope.getHref = function(grid, row) {
                GateBlackList.GetGateBlackListPID().get({
                    VoucherID: row.entity.VoucherID,
                    activityName: "申请单"
                }).$promise.then(function (res) {
                        window.open('#/processlog/'+res.ProcessInstanceId);
                    }, function (errormessage) {
                        Notifications.addError({'status': 'error', 'message': errormessage});
                    });
            }
            var col = [{field: 'VoucherID', displayName: '单据号', minWidth: 180, cellTooltip: true,cellTemplate:"<a href='javascript:;' target='_blank' ng-click='grid.appScope.getHref(grid, row)'>{{COL_FIELD}}</a>"},
                {field: 'Type', displayName: '类型', minWidth: 80, cellTooltip: true},
                {field: 'IDCard', displayName: '身份证号', minWidth: 180, cellTooltip: true},
                {field: 'Name', displayName: '姓名', minWidth: 80, cellTooltip: true},
                {field: 'TransferCompany', displayName: '运输公司', minWidth: 80, cellTooltip: true},
                {field: 'VehicleNO', displayName: '车号', minWidth: 80, cellTooltip: true},
                {field: 'Category', displayName: '原因说明', minWidth: 180, cellTooltip: true},
                {field: 'Remark', displayName: '备注', minWidth: 80, cellTooltip: true},
                {field: 'Status', displayName: '状态', minWidth: 80, cellTooltip: true},
                {field: 'Stamp', displayName: '最后修改时间', minWidth: 180, cellTooltip: true},
                {field: 'UserID', displayName: '创建人', minWidth: 80, cellTooltip: true}
            ];


            var paginationOptions = {
                pageNumber: 1,
                pageSize: 50,
                sort: null
            };

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

                    title:'新建' ,
                    action: function ($event) {
                        EngineApi.getKeyId().getkey({"key":"GateBlackList"},function(res){
                            console.log(res.id);
                            ///taskForm/start/:id
                            $location.url("/taskForm/start/"+res.id);
                        });
                    },
                    order: 1
                },{
                    title: '修改',
                    action: function ($event) {
                        /*   var href =/gate/GoodsOut/:code/:oprea
                         window.open(href);*/
                        var resultRows = $scope.gridApi.selection.getSelectedRows();

                        if (resultRows.length == 1) {
                            //是否能编辑
                          if (!resultRows[0].Status) {
                                var href = "/gate/BlackList/" + resultRows[0].VoucherID + "/update";

                                $location.url(href);
                         } else {
                                Notifications.addError({'status': 'error', 'message': "只能编辑未提交的单据"});
                            }

                        } else {
                            Notifications.addError({'status': 'error', 'message': "只能编辑一行"});
                        }
                    },
                    order: 2
                }],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        console.log("已选中:" + row.entity.VoucherID);
                        $scope.selectedVoucherid = row.entity.VoucherID;
                    })
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                        getPage();
                    });
                }
            };

            var getPage = function () {
                var query = {};
                query.userID = "";
                if ($scope.onlyOwner == true) {
                    query.userID = Auth.username;
                }
                query.PageIndex = paginationOptions.pageNumber;
                query.PageSize = paginationOptions.pageSize;
                query.des = "";
                query.voucherID = $scope.VoucherID || "";
                query.status = $scope.status || "";
                GateBlackList.GateBlackListBasic().getBlackList(query).$promise.then(function (res) {
                    $scope.gridOptions.data = res.TableData;
                    $scope.gridOptions.totalItems = res.TableCount[0];
                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });
            };
            $scope.Search = function(){
                paginationOptions.pageNumber = 1;
                paginationOptions.pageSize = 50;
                getPage();
            }

        }]);
});