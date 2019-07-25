/**
 * Created by wangyanyan on 2016/12/8.
 */

define(['myapp', 'angular'], function (myapp, angular) {

    myapp.controller('ContractorBasicController', ['$scope', 'EngineApi', '$http', 'EngineApi', 'Notifications', '$upload', '$compile', '$filter', 'Auth', '$resource', 'uiGridConstants', '$location', 'GateGoodsOut', 'Forms', '$translate', 'ContractorInspectService', '$translatePartialLoader',
        function ($scope, EngineApi, $http,  Notifications, $upload, $compile, $filter, Auth, $resource, uiGridConstants, $location, GateGoodsOut, Forms, $translate, ContractorInspectService, $translatePartialLoader) {
            var col = [
                {field: 'ID', displayName: $translate.instant('Contractor') + "ID", minWidth: 80, cellTooltip: true},
                {field: 'Name', displayName: $translate.instant('ConQua_Employer'), minWidth: 80, cellTooltip: true},
                {field: 'Type', displayName: $translate.instant('Type'), minWidth: 100, cellTooltip: true},
                {field: 'Category', displayName: $translate.instant('Classify'), minWidth: 105, cellTooltip: true}
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
                gridMenuCustomItems: [{
                    title: $translate.instant('Create'),
                    action: function ($event) {
                        $('#myModal').modal('show');
                    },
                    order: 1
                }, {
                    title: $translate.instant('Delete'),
                    action: function ($event) {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        var _d_id = resultRows[0].ID;
                        var _d_name = resultRows[0].Name;
                        var _d_type = resultRows[0].Type;
                        var _d_category = resultRows[0].Category;
                        var bcontent = {id: _d_id, name: _d_name, type: _d_type, category: _d_category};
                        console.log("content++++++++++:" + bcontent);
                        if (!$window.confirm($translate.instant("Delete_IS_MSG") + "\n" + $translate.instant('Contractor') + ":  " + _d_name + "\n " + $translate.instant('Type') + ": " + _d_type + "\n" + $translate.instant('Classify') + ": " + _d_category)) {
                            return false;
                        }
                        //
                        /* var queryboiler =
                         $resource("/ehs/contractorinspect/GetContractors", {
                         }, {
                         get: {method: 'GET', isArray: true}
                         });
                         var query ={};
                         query.employer= _d_name;

                         queryboiler.get(query).$promise.then(function (res) {
                         console.log("res 2:" + res);
                         if(res&&res!='') {
                         Notifications.addError({
                         'status': 'error',
                         'message': "承揽商[" + _d_name + "]已经有包商办卡记录，不能删除",
                         "duration": 4000
                         });
                         }
                         else
                         {*/
                        ContractorInspectService.delContractorsToDB().del({}, bcontent, function (res) {
                            if (res) {
                                if (res.IsSuccess) {
                                    //Notifications.addError({'status': 'success', 'message':"添加成功","duration":4000});
                                    $scope.ListContractor.splice(index, 1);
                                    //$window.alert("删除成功");
                                } else {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Delete_Failed_Msg'),
                                        "duration": 4000
                                    });
                                }
                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Delete_Failed_Msg'),
                                    "duration": 4000
                                });
                            }
                        });
                        /* }
                         }, function (errResponse) {
                         Notifications.addError({'status': 'error', 'message': errResponse});
                         });*/
                        //

                    },
                    order: 2
                }],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                }
            };
            $http.get('/ehs/contractorinspect/contractors').success(function (data) {
                $scope.employers = data;
            });
            //查询承揽商明细
            $scope.queryContractor = function () {
                console.log("query_contractor:" + $scope.query_contractor);
                ContractorInspectService.getContractorsToDB().get({"name": $scope.query_contractor}, function (res) {
                    $scope.ListContractor = res;
                    $scope.gridOptions.data = res;
                });
            };

            //新增承揽商
            $scope.addContractor = function () {
                console.log($scope.add_contractor);
                var bcontent = {
                    id: $scope.add_contractorID,
                    name: $scope.add_contractor,
                    type: $scope.add_type,
                    category: $scope.add_category
                };

                var addcontractor = $scope.add_contractor;
                console.log("$scope.add_contractor:" + $scope.add_contractor);
                ContractorInspectService.getContractorsToDB().get({"name": $scope.add_contractor}, function (res) {
                    //获取承揽商检查承揽商是否已经存在
                    console.log("res 1:" + res);
                    if (res && res != '') {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('Contractor') + "[" + addcontractor + "]已经存在",
                            "duration": 4000
                        });
                    }
                    else {
                        console.log("---------------");
                        /*return;*/
                        ContractorInspectService.addContractorsToDB().add({}, bcontent, function (res) {
                            if (res) {
                                if (res.IsSuccess) {
                                    Notifications.addMessage({
                                        'status': 'success',
                                        'message': $translate.instant('Save_Success_MSG'),
                                        "duration": 4000
                                    });
                                    //$window.alert("添加成功");
                                } else {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Msg_Save'),
                                        "duration": 4000
                                    });
                                }
                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Msg_Save'),
                                    "duration": 4000
                                });
                            }
                        });

                    }
                });

                $("#myModal").modal('hide');
                $scope.add_contractor = "";

            };

            //删除承揽商
            $scope.delContractor = function (index) {
                console.log("index:" + index);
                var _d_id = $scope.ListContractor[index].ID;
                var _d_name = $scope.ListContractor[index].Name;
                var _d_type = $scope.ListContractor[index].Type;
                var _d_category = $scope.ListContractor[index].Category;
                var bcontent = {id: _d_id, name: _d_name, type: _d_type, category: _d_category};
                console.log("content++++++++++:" + bcontent);
                if (!$window.confirm("确定删除？\n" + $translate.instant('Contractor') + ":  " + _d_name + "\n " + $translate.instant('Type') + ": " + _d_type + "\n" + $translate.instant('Classify') + ": " + _d_category)) {
                    return false;
                }
                //
                /* var queryboiler =
                 $resource("/ehs/contractorinspect/GetContractors", {
                 }, {
                 get: {method: 'GET', isArray: true}
                 });
                 var query ={};
                 query.employer= _d_name;

                 queryboiler.get(query).$promise.then(function (res) {
                 console.log("res 2:" + res);
                 if(res&&res!='') {
                 Notifications.addError({
                 'status': 'error',
                 'message': "承揽商[" + _d_name + "]已经有包商办卡记录，不能删除",
                 "duration": 4000
                 });
                 }
                 else
                 {*/
                ContractorInspectService.delContractorsToDB().del({}, bcontent, function (res) {
                    if (res) {
                        if (res.IsSuccess) {
                            //Notifications.addError({'status': 'success', 'message':"添加成功","duration":4000});
                            $scope.ListContractor.splice(index, 1);
                            //$window.alert("删除成功");
                        } else {
                            Notifications.addError({'status': 'error', 'message': "删除失败", "duration": 4000});
                        }
                    } else {
                        Notifications.addError({'status': 'error', 'message': "删除失败", "duration": 4000});
                    }
                });
                /* }
                 }, function (errResponse) {
                 Notifications.addError({'status': 'error', 'message': errResponse});
                 });*/
                //

            };

            //更新承揽商
            $scope.updateContractor = function () {
                //update_new_location
                var bcontent = {
                    keshi: $scope.update_kesi,
                    location: $scope.update_location,
                    newlocation: $scope.update_new_location
                };
                console.log(bcontent);
                GongAnService.updateContractorsToDB().update({}, bcontent, function (res) {
                    if (res) {
                        if (res.IsSuccess) {
                            //Notifications.addError({'status': 'success', 'message':"添加成功","duration":4000});
                            //$scope.ListLocation.splice(index);
                            $scope.ListContractor[$scope.UpdateIndex].Place = $scope.update_new_location;
                            $window.alert("更新成功");

                        } else {
                            Notifications.addError({'status': 'error', 'message': "更新失败", "duration": 4000});
                        }
                        $scope.update_new_location = "";
                    } else {
                        Notifications.addError({'status': 'error', 'message': "更新失败", "duration": 4000});
                        $scope.update_new_location = "";
                    }

                });
                $("#myUpdateModal").modal('hide');
            }
        }])
});