/**
 * Created by wangyanyan on 2016-02-01.
 *短驳计划
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('GatePlanController', ['$rootScope', '$scope', '$filter', '$http', '$compile', '$routeParams', '$resource', '$location', '$interval', 'Notifications', 'Forms', 'Auth',
        function ($rootScope, $scope, $filter, $http, $compile, $routeParams, $resource, $location, $interval, Notifications, Forms, Auth) {
            var today = new Date();
            $scope.StartDate = moment(today).format('YYYY-MM-DD');
            $scope.EndDate = moment(today).add(1, 'day').format('YYYY-MM-DD');
            $scope.IsOwner = 'true';
            $scope.paraStatus = '全部';
            GateEngine.GetPlanStatusList().get({}).$promise.then(function (res) {
                $scope.StatusList = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });

            GateEngine.GetUnitList().get({}).$promise.then(function (res) {
                $scope.UnitList = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });

            var PlanCol = [
                {
                    field: 'VoucherID',
                    displayName: '计划号',
                    minWidth: 140},
                {
                    field: 'TransferCompany',
                    displayName: '车行',
                    minWidth: 80},
                {
                    field: 'VehicleNO',
                    displayName: '车号',
                    minWidth: 80
                },
                {
                    field: 'Customer',
                    displayName: '客户',
                    minWidth: 80
                },
                {
                    field: 'Driver',
                    displayName: '司机',
                    minWidth: 80,
                    cellTooltip: true
                },
                {
                    field: 'Definition',
                    displayName: ' 目的地',
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'MaterialType',
                    displayName: '物料类型',
                    minWidth: 140,
                    cellTooltip: true
                },
                {
                    field: 'EffectiveTo',
                    displayName: ' 有效期',
                    minWidth: 100,
                    cellFilter: 'date: "yyyy-MM-dd"',
                    cellTooltip: true
                },
                {
                    field: 'Remark',
                    displayName: '备注',
                    minWidth: 150,
                    cellTooltip: true
                },
                {
                    field: 'CloseTime',
                    displayName: '关闭日期',
                    minWidth: 150,
                    cellFilter: 'date: "yyyy-MM-dd"',
                    cellTooltip: true
                },
                {
                    field: 'CloseUser',
                    displayName: ' 关闭人',
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'CloseRemark',
                    displayName: ' 关闭原因',
                    minWidth: 150,
                    cellTooltip: true
                },
                {
                    field: 'Stamp',
                    displayName: '创建日期',
                    minWidth: 150,
                    cellFilter: 'date: "yyyy-MM-dd"',
                    cellTooltip: true
                }
            ];

            $scope.gridOptions = {
                columnDefs: PlanCol,
                data: [],
                enableColumnResizing: true,
                enableSorting: true,
                enableGridMenu: true,
                exporterMenuPdf: false,
                enableSelectAll: false,
                enableSorting: true,
                enableRowHeaderSelection: false,
                enableRowSelection: true,
                multiSelect: false,
                gridMenuCustomItems: [{
                    title: '新建',
                    action: function () {
                        gridOperate.newCreate();
                    },
                    order: 210
                }, {
                    title: '编辑',
                    action: function () {
                        gridOperate.newAlter();
                    },
                    order: 220
                }, {
                    title: '关闭单据',
                    action: function () {
                        gridOperate.newClose();
                    },
                    order: 230
                }],
                paginationPageSizes: [50, 100, 200, 500],
                paginationPageSize: 100,
                exporterOlderExcelCompatibility: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        console.log('已选中:' + row.entity.VoucherID);
                        $scope.selectedVoucherid = row.entity.VoucherID;
                        queryTransportinfo(row.entity.VoucherID, function (cqlist) {
                            $scope.eCQ2 = cqlist;
                        })
                    });
                }
            };
            //grid菜单通用操作
            var gridOperate = {
                newCreate: function () {
                    ShowAddInfo();
                },
                newAlter: function () {
                    var selectRows = $scope.gridApi.selection.getSelectedGridRows();
                    $scope.note = {};
                    $scope.note.VoucherID = selectRows[0].entity.VoucherID;
                    $scope.note.TransferCompany = selectRows[0].entity.TransferCompany;
                    $scope.note.VehicleNO = selectRows[0].entity.VehicleNO;
                    $scope.note.Customer = selectRows[0].entity.Customer;
                    $scope.note.Driver = selectRows[0].entity.Driver;
                    $scope.note.Definition = selectRows[0].entity.Definition;
                    $scope.note.MaterialType = selectRows[0].entity.MaterialType;
                    $scope.note.EffectiveTo = selectRows[0].entity.EffectiveTo;
                    $scope.note.Remark = selectRows[0].entity.Remark;
                    var querypara = {};
                    querypara.VoucherID = selectRows[0].entity.VoucherID;
                    // Auth.username;
                    GateEngine.CheckIsOwner().get(querypara).$promise.then(function (res) {
                        console.log(res);
                        getuserid(res, function (userid) {
                            console.log('------------' + userid);
                            if (userid == Auth.username) {
                                ShowEditInfo($scope.note);
                            } else {
                                Notifications.addError({'status': 'error', 'message': '不是创建者，不能编辑！'});
                            }
                        });
                    }, function (errResponse) {
                        console.log(errResponse)
                    });
                },
                newClose: function () {
                    var selectRows = $scope.gridApi.selection.getSelectedGridRows();
                    $scope.note = {};
                    $scope.note.VoucherID = selectRows[0].entity.VoucherID;
                    $scope.note.TransferCompany = selectRows[0].entity.TransferCompany;
                    $scope.note.VehicleNO = selectRows[0].entity.VehicleNO;
                    $scope.note.Customer = selectRows[0].entity.Customer;
                    $scope.note.Driver = selectRows[0].entity.Driver;
                    $scope.note.Definition = selectRows[0].entity.Definition;
                    $scope.note.MaterialType = selectRows[0].entity.MaterialType;
                    $scope.note.EffectiveTo = selectRows[0].entity.EffectiveTo;
                    $scope.note.Remark = selectRows[0].entity.Remark;
                    var querypara = {};
                    querypara.VoucherID = selectRows[0].entity.VoucherID;
                    // Auth.username;
                    GateEngine.CheckIsOwner().get(querypara).$promise.then(function (res) {
                        console.log(res);
                        getuserid(res, function (userid) {
                            console.log('------------' + userid);
                            if (userid == Auth.username) {
                                CloseShortTruck($scope.note);
                            } else {
                                Notifications.addError({'status': 'error', 'message': '不是创建者，不能关闭单据！'});
                            }
                        });
                    }, function (errResponse) {
                        console.log(errResponse)
                    });
                }
                /*,
                 newDel:function() {
                 var selectRows = $scope.gridApi.selection.getSelectedGridRows();
                 $scope.note.VoucherID = selectRows[0].entity.VoucherID;
                 DelPlanInfo($scope.note.VoucherID,callback);
                 }*/
            };
            //查询
            $scope.search = function () {
                QueryInfoList();
            };
            //查询短驳计划列表
            function QueryInfoList() {
                //
                var querypara = {};
                querypara.StartDate = $scope.StartDate;
                querypara.EndDate = $scope.EndDate;
                querypara.UserID = $scope.IsOwner == 'true' ? Auth.username : '';
                /*querypara.pageIndex = 1;
                 querypara.pageSize = 2000;
                 querypara.Des = "";*/
                querypara.VoucherID = $scope.VoucherID;
                querypara.Status = $scope.paraStatus;
                console.log(querypara);
                GateEngine.ShortTruckPlan().getList(querypara).$promise.then(function (res) {
                    $scope.gridOptions.data = res;
                    //过磅查询清空
                    $scope.eCQ2 = {};
                }, function (errResponse) {
                    Notifications.addError({'status': 'error', 'message': errResponse});
                });
            }

            //显示关闭计划界面
            function CloseShortTruck(e) {
                //
                $scope.note = e;
                $scope.closeInfo = $scope.note;
                console.log(e);
                //
                $('#myModalPlanClose').modal('show');
                //
            }

            $scope.closeInfo = {};
            //关闭计划
            $scope.addsaveClose = function () {
                $scope.note = $scope.closeInfo;
                console.log($scope.note);
                //
                queryTransportinfo($scope.note.VoucherID, function (cqlist) {
                    var OutTime2 = null;
                    for (var k = 0; k < cqlist.length; k++) {
                        OutTime2 = cqlist[k].OutTime2;
                        if (OutTime2 == null) {
                            alert('有任务未完成，暂时不能关闭计划！');
                            return;
                        }
                    }
                    //
                    var r = confirm('确认关闭该计划号['+ $scope.note.VoucherID + ']吗？');
                    if (r == true) {
                        $scope.note.UserId = Auth.username;
                        $scope.note.Stamp = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                        $scope.note.CloseUser = Auth.username;
                        $scope.note.CloseTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                        $scope.note.CloseRemark = $scope.CloseRemark;
                        console.log($scope.note);
                        SaveShortPlan($scope.note);
                        //2
                        $('#myModalPlanClose').modal('hide');
                        console.log('计划关闭成功');
                        //alert("计划关闭成功.");
                    }
                })
            };
            //显示新增界面
            function ShowAddInfo() {
                //
                $scope.eCQ = {};
                $scope.note = {};
                $scope.IsUpdateData = false;
                $scope.IsShowRes = false;
                $scope.IsHideBtnaddInfo = false;
                $scope.IsReadonlyVehicleNO = false;
                $scope.note = {};
                $scope.note.EffectiveTo = $filter('date')(new Date(), 'yyyy-MM-dd');
                $('#myModal').modal('show');
                //
            }

            //显示编辑界面
            function ShowEditInfo(e) {
                //
                $scope.note = e;
                console.log(e);
                /*$scope.note.VoucherID = e.VoucherID;
                 $scope.note.TransferCompany = e.TransferCompany;
                 $scope.note.VehicleNO = e.VehicleNO;
                 $scope.note.Customer = e.Customer;
                 $scope.note.Driver = e.Driver;
                 $scope.note.Definition = e.Definition;
                 $scope.note.MaterialType = e.MaterialType;
                 $scope.note.Remark = e.Remark;*/
                $scope.note.EffectiveTo = $filter('date')(e.EffectiveTo, "yyyy-MM-dd");
                //
                $scope.IsUpdateData = true;
                $scope.IsShowRes = true;
                $scope.IsHideBtnaddInfo = false;
                $scope.IsReadonlyVehicleNO = true;
                //
                queryCQinfo(e.VoucherID, function (cqlist) {
                    $scope.eCQ = cqlist;
                });
                //
                $('#myModal').modal('show');
                //
            }

            //新建计划
            $scope.addInfo = function () {
                console.log($scope.note);
                if ($scope.IsUpdateData == false) {
                    //新建
                    $scope.note.VoucherID = '';
                    $scope.note.VehicleNO = $scope.note.VehicleNO.trim();
                    /*$scope.note.TransferCompany = $scope.note.TransferCompany;
                     $scope.note.VehicleNO = $scope.note.VehicleNO;
                     $scope.note.Customer = $scope.note.Customer;
                     $scope.note.Driver = $scope.note.Driver;
                     $scope.note.Definition = $scope.note.Definition;
                     $scope.note.MaterialType = $scope.note.MaterialType;
                     $scope.note.Remark = $scope.note.Remark;
                     $scope.note.EffectiveTo = $scope.note.EffectiveTo;*/
                }
                /*else {
                 $scope.note.Stamp = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
                 SaveShortPlan($scope.note);
                 }*/
                $scope.note.UserId = Auth.username;
                $scope.note.Stamp = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                console.log($scope.note);
                SaveShortPlan($scope.note);
            };

            function SaveShortPlan(plans) {
                console.log(plans);
                GateEngine.ShortTruckPlan().save({
                    'Recode': plans,
                    'Createdate': $filter('date')(new Date(), 'yyyyMMdd')
                }, function (message) {
                    //console.log(message);
                    getvoucherid(message, function (voucherid) {
                        if (voucherid.length == 14) {
                            $scope.note.VoucherID = voucherid;
                            QueryInfoList();

                            $scope.IsUpdateData = true;
                            $scope.IsShowRes = true;
                            $scope.IsHideBtnaddInfo = true;
                            /*queryCQinfo(voucherid, function (contratorlist) {
                             $scope.eCQ = contratorlist;
                             })*/
                            alert('计划保存成功！');
                        } else {
                            Notifications.addError({'status': 'error', 'message': message});
                        }
                    });
                })
            }

            function getvoucherid(vouid, callback) {
                //
                var str = JSON.stringify(vouid);
                var json = str.replace(/"/g, '');
                json = json.replace(/:/g, '');
                json = json.replace(/,/g, '');
                json = json.replace(/{/g, '');
                json = json.replace(/ /g, '');
                json = json.substr(0, 32);
                //console.log(json);
                var voucherid = '';
                for (var k = 0; k < 20; k++) {
                    if (k % 2 != 0) {
                        voucherid += json.substr(k, 1);
                    }
                }
                json = '0' + json.substr(20, 12);
                //console.log(json);
                for (var k = 1; k <= 12; k++) {
                    if (k % 3 == 0) {
                        voucherid += json.substr(k, 1);
                    }
                }
                //console.log("------"+voucherid+"------");
                callback(voucherid)
            }

            function getuserid(uid, callback) {
                //
                var str = JSON.stringify(uid);
                var json = str.replace(/"/g, '');
                json = json.replace(/:/g, '');
                json = json.replace(/,/g, '');
                json = json.replace(/{/g, '');
                json = json.replace(/ /g, '');
                json = json.substr(0, 12);
                console.log(json);
                var userid = '';
                for (var k = 0; k < 12; k++) {
                    if (k % 2 != 0) {
                        userid += json.substr(k, 1);
                    }
                }

                callback(userid)
            }

            function getIsInFactory(flag, callback) {
                //
                var str = JSON.stringify(flag);
                var json = str.replace(/"/g, "");
                json = json.replace(/:/g, "");
                json = json.replace(/,/g, "");
                json = json.replace(/{/g, "");
                json = json.replace(/ /g, "");
                json = json.substr(1, 1);
                console.log(json);
                callback(json)
            }

            //修改计划 ，添加行项目
            /*function editShortPlan(plans) {
             console.log("---edit---");
             $scope.note = plans;
             */
            /*$scope.note.VoucherID = $scope.note.VoucherID;
             $scope.note.TransferCompany = $scope.note.TransferCompany;
             $scope.note.VehicleNO = $scope.note.VehicleNO;
             $scope.note.Customer = $scope.note.Customer;
             $scope.note.Driver = $scope.note.Driver;
             $scope.note.Definition = $scope.note.Definition;
             $scope.note.MaterialType = $scope.note.MaterialType;
             $scope.note.Remark = $scope.note.Remark;
             $scope.note.EffectiveTo = $scope.note.EffectiveTo;*/
            /*
             $scope.note.Stamp = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
             console.log($scope.note);
             //
             SaveShortPlan($scope.note);
             }*/
            //删除计划
            function DelPlanInfo(voucherID, callback) {
                var querypara = {};
                querypara.VoucherID = voucherID;
                GateEngine.ShortTruckPlan().del(querypara).$promise.then(function (res) {
                    console.log(res);
                    callback(res)
                }, function (errResponse) {
                    console.log(errResponse);
                    callback(null);
                });
            }

            //结束计划

            //计划过磅 - 查询
            function queryTransportinfo(voucherID, callback) {
                var querypara = {};
                querypara.VoucherID = voucherID;
                GateEngine.QueryShortTruckTransport().getList(querypara).$promise.then(function (res) {
                    console.log(res);
                    callback(res)
                }, function (errResponse) {
                    console.log(errResponse);
                    callback(null);
                });
            }

            //计划项次 - 查询
            function queryCQinfo(voucherID, callback) {
                var querypara = {};
                querypara.VoucherID = voucherID;
                GateEngine.ShortTruckPlanItem().getList(querypara).$promise.then(function (res) {
                    console.log(res);
                    callback(res)
                }, function (errResponse) {
                    console.log(errResponse);
                    callback(null);
                });
            }

            $scope.showaddCQ = function (voucherid) {
                //
                $("#myModalItem").modal('show');
                //
            };

            //新增计划车次
            $scope.addsaveCQ = function () {

                //
                var projects = {};
                projects.Material = $scope.Material;
                projects.Amount = $scope.Amount;
                projects.Unit = $scope.Unit;
                console.log(projects);
                GateEngine.ShortTruckPlanItem().save({
                    'Recode': projects,
                    'VoucherID': $scope.note.VoucherID
                }, function (message) {
                    if (!message) {
                        Notifications.addError({'status': 'error', 'message': '新增失败：' + message});
                    } else {

                        $('#myModalItem').modal('hide');
                        console.log($scope.note.VoucherID);
                        queryCQinfo($scope.note.VoucherID, function (rescontratorlist) {
                            console.log(rescontratorlist);
                            $scope.eCQ = rescontratorlist;
                        })
                    }
                });

            };

            //删除计划车次
            $scope.deleteCQ = function (e) {
                console.log(e);
                var projects = {};
                projects.VoucherID = e.VoucherID;
                projects.ItemID = e.ItemID;

                GateEngine.CheckIsInFactory().get(projects).$promise.then(function (res) {
                    console.log(res);
                    getIsInFactory(res, function (IsInFactory) {
                        if (IsInFactory == '0') {
                            //1
                            var r = confirm('确认删除该序号[' + e.ItemID + ']的计划车次吗？');
                            if (r == true) {
                                //2
                                GateEngine.ShortTruckPlanItem().del(projects, function (message) {
                                    console.log(message);
                                    if (!message) {
                                        Notifications.addError({'status': 'error', 'message': '删除失败：' + message});
                                    } else {

                                        $scope.eCQ.splice($scope.eCQ.indexOf(e), 1);
                                    }
                                });
                                //2
                            }
                            //1
                        } else {
                            alert('该车次已进厂，不能删除！');
                            Notifications.addError({'status': 'error', 'message': '该车次已进厂，不能删除！'});
                        }
                    });
                }, function (errResponse) {
                    console.log(errResponse)
                });
            }
        }])
});