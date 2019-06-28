/**
 * Created by wangyanyan on 2016-08-18.
 * 物品明细
 */

define(['myapp', 'angular'], function (myapp, angular) {

    myapp.controller("GoodsOutController", ['$scope', 'EngineApi', '$http',  'Notifications', '$upload', '$compile', '$filter', 'Auth', '$resource', 'uiGridConstants', '$location', 'GateGoodsOut', 'Forms', '$translate', 'GateGuest',
        function ($scope, EngineApi, $http, Notifications, $upload, $compile, $filter, Auth, $resource, uiGridConstants, $location, GateGoodsOut, Forms, $translate, GateGuest) {


            $scope.bpmnloaded = false;
            $scope.details = {};
            $scope.GoodsItems = [];
            $scope.details.GoodsItems = [];
            $scope.query = {userID: "", des: "", onlyOwner: true};
            $scope.query.dateFrom = moment(new Date()).add(-1, 'days').format('YYYY-MM-DD');
            $scope.query.dateTo = $filter('date')(new Date(), "yyyy-MM-dd");
            $scope.options = {
                width: 1.2,
                height: 40,
                backgroundColor: '#ffffff',
                lineColor: '#000000'
            }
            var paginationOptions = {
                pageNumber: 1,
                pageSize: 50,
                sort: null
            };
            var formVariables = [];
            var historyVariable = [];
            var variablesMap = {};
          
            $scope.flowkey = "FEPVGateGoodOut";
            $translate.refresh();
            $scope.files = [];
            $scope.good = {};
            var lang = window.localStorage.lang;
            GateGuest.GetQueryStatus().get({ctype: 'Goods', language: lang, flag: '1'}).$promise.then(function (res) {
                $scope.StatusList = res;

            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            $scope.showPng = function () {
                if ($scope.bpmnloaded == true) {
                    $scope.bpmnloaded = false;
                } else {
                    $scope.bpmnloaded = true;
                }
            }

            $scope.backOrNot = [{"value": true, "name": $translate.instant('GoodsBack')}, {
                "value": false,
                "name": $translate.instant('GoodsBackNO')
            }];
            GateGoodsOut.GoodBasic().getGoodsTypes({language: lang}).$promise.then(function (res) {
                $scope.kind = res;
                console.log('KINDS: '+res);
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            GateGoodsOut.GoodBasic().getGoodUnit({language: lang}).$promise.then(function (res) {
                $scope.goodsUnit = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            $scope.rowFormatter = function (row) {
                return row.entity.ExpectOut === 'male';
            };
            $scope.getVoucherStatus = function (Status) {
                var statLen = $filter('filter')($scope.StatusList, {"Status": Status});
                if (statLen.length > 0) {
                    return statLen[0].Remark;
                } else {
                    return Status;
                }
            }
            $scope.getVoucherType = function (Type) {
                var statLen = $filter('filter')($scope.kind, {ID: Type});
                for(var i =0;i<$scope.kind.length;i++){
                    if($scope.kind[i].ID==Type){
                        return $scope.kind[i].GoodsType;
                    }
                }

            }
            $scope.getVoucherBack = function (back) {
                var statLen = $filter('filter')($scope.backOrNot, back);

                if (statLen.length > 0) {
                    return statLen[0].name;
                } else {
                    return back;
                }
            }

            $scope.getDate = function (date) {
                if (date.length > 0) {
                    return moment(date).format('YYYY-MM-DD');
                }
                return date;
            }

            var col = [
                {
                    field: 'VoucherID',
                    displayName: $translate.instant('VoucherID'),
                    minWidth: 180,
                    cellTooltip: true,
                    cellTemplate: '<a target="_blank" href="#/gate/GoodsOut/{{COL_FIELD}}/print"  style="padding:5px;display:block; cursor:pointer">{{COL_FIELD}}</a>'
                },

                {
                    field: 'Status',
                    displayName: $translate.instant('Status'),
                    minWidth: 150,
                    cellTooltip: true,
                    cellTemplate: '<span  >{{grid.appScope.getVoucherStatus(row.entity.Status)}}</span>'
                },
                {
                    field: 'GoodsType',
                    displayName: $translate.instant('GoodsType'),
                    minWidth: 100,
                    cellTemplate: '<span  >{{grid.appScope.getVoucherType(row.entity.GoodsType)}}</span>',
                    cellTooltip: true
                },
                {
                    field: 'IsBack',
                    displayName: $translate.instant('GoodsIsBack'),
                    minWidth: 105,
                    cellTemplate: '<span  >{{grid.appScope.getVoucherBack(row.entity.IsBack)}}</span>',
                    cellTooltip: true
                },
                {
                    field: 'ExpectOut',
                    displayName: $translate.instant('GoodsExpectOut'),
                    minWidth: 105,
                  
                    cellTooltip: true
                },
                {
                    field: 'ExpectBack',
                    displayName: $translate.instant('GoodsExpectBack'),
                    minWidth: 100,
                   
                    cellTooltip: true
                },
                {field: 'TakeOut', displayName: $translate.instant('TakeOut'), minWidth: 80, cellTooltip: true},

                {
                    field: 'TakeCompany',
                    displayName: $translate.instant('CustomerCompany'),
                    minWidth: 200,
                    cellTooltip: true
                },
                {field: 'VehicleNO', displayName: $translate.instant('VehicleNO'), minWidth: 150, cellTooltip: true},
                {field: 'Remark', displayName: $translate.instant('Remark'), minWidth: 200, cellTooltip: true},
                {field: 'OutTime', displayName: $translate.instant('GoodsOutTime'), minWidth: 180, cellTooltip: true},
                {field: 'Stamp', displayName: $translate.instant('Stamp'), minWidth: 180, cellTooltip: true},
                {field: 'UserID', displayName: $translate.instant('UserID'), minWidth: 80, cellTooltip: true}

            ];

            if ($scope.details) {
                $scope.$watch("details.IsBack", function (n) {
                    if (n == true || n == false) {
                        var outputdate = moment($scope.details.ExpectOut).add(31, 'days').format('YYYY-MM-DD');
                        console.log(n);
                        if (n == false) {
                            $scope.details.ExpectBack = null;
                        }
                        else if (n == true) {
                            $scope.details.ExpectBack = outputdate;
                        }
                        GateGoodsOut.GoodBasic().getOutReason({
                            isBack: n,
                            language: lang
                        }).$promise.then(function (res) {
                            $scope.reason = res;
                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });
                    }
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
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({"userid": Auth.username, "tcode": $scope.flowkey}, function (linkres) {
                        if (linkres.IsSuccess) {
                            gridApi.core.addToGridMenu(gridApi.grid, gridMenu);
                        }
                    })
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.selectedVoucherid = row.entity.VoucherID;
                    })
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                        SearchList(newPage, pageSize);
                    });
                }
            };

var gridMenu=  [{
    title: $translate.instant('Create'),
    action: function ($event) {
        $scope.details = {};
        $scope.GoodsItems = [];
        $scope.details.GoodsItems = [];
        $scope.files = []
        $('#myModal').modal('show');

    },
    order: 1
}, {
    title: $translate.instant('Update'),
    action: function ($event) {
        var resultRows = $scope.gridApi.selection.getSelectedRows();
        if (resultRows.length == 1) {
            //是否能编辑
            if (resultRows[0].Status == "N") {
                if (resultRows[0].UserID == Auth.username) {
                    GateGoodsOut.GoodBasic().getGoodByVoucherID({
                        VoucherID: resultRows[0].VoucherID,
                        language: lang
                    }).$promise.then(function (res) {
                            $scope.details = res[0];
                            $('#myModal').modal('show');
                            $scope.details.ExpectOut = $filter('date')($scope.details.ExpectOut, 'yyyy-MM-dd');
                            $scope.details.ExpectBack = $filter('date')($scope.details.ExpectBack, 'yyyy-MM-dd');
                            $scope.files = JSON.parse(res[0].FileNames) || [];

                            var isBack = res[0].IsBack;
                            var goodsitem = res[0].GoodsItems;

                            $scope.details.GoodsItems = goodsitem || [];
                            GateGoodsOut.GoodBasic().getOutReason({
                                isback: isBack,
                                language: lang
                            }, {}).$promise.then(function (res) {
                                    $scope.reason = res;
                                    $scope.GoodsItems = [];
                                    for (var i = 0; i < goodsitem.length; i++) {
                                        var item = goodsitem[i];

                                        item.UnitSpec = $filter('filter')($scope.goodsUnit, item.Unit)[0].Unit || "";
                                        item.ReasonSpec = $filter('filter')($scope.reason, item.Reason)[0].OutReason || "";
                                        $scope.GoodsItems.push(item);
                                    }

                                }, function (errResponse) {
                                    Notifications.addError({'status': 'error', 'message': errResponse});
                                });

                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });
                }
                else {
                    Notifications.addError({
                        'status': 'error',
                        'message': $translate.instant('Auth_MSG')
                    });
                }

            } else {
                Notifications.addError({
                    'status': 'error',
                    'message': $translate.instant('Edit_Draf_MSG')
                });
            }

        } else {
            Notifications.addError({
                'status': 'error',
                'message': $translate.instant('Select_ONE_MSG')
            });
        }
    },
    order: 2
}, {
    title: $translate.instant('Delete'),
    order: 3,
    action: function ($event) {

        var resultRows = $scope.gridApi.selection.getSelectedRows();
        if (resultRows.length == 1) {
            if (resultRows[0].Status == "N" && resultRows[0].UserID == Auth.username) {
                if (confirm($translate.instant('Delete_IS_MSG') + ":" + resultRows[0].VoucherID)) {
                    GateGoodsOut.DoGoodsStatus().setStatus({
                        voucherID: resultRows[0].VoucherID,
                        status: "X"
                    }, {}).$promise.then(function (res) {
                            Notifications.addError({'status': 'info', 'message': "OK"});
                        }, function (errormessage) {
                            Notifications.addError({'status': 'error', 'message': errormessage});
                        });
                } else {
                    Notifications.addError({
                        'status': 'error',
                        'message': $translate.instant('Select_ONE_MSG')
                    });
                }
            } else {
                Notifications.addError({
                    'status': 'error',
                    'message': $translate.instant('Delete_Draf_Msg')
                });
            }

        }
    }

}]
            function SearchList(pageIndex, pageSize) {
                if ($scope.query.dateFrom == null && $scope.query.dateTo == null) {
                    Notifications.addError({'status': 'error', 'message': $translate.instant('Date_Msg')});
                    return;
                }
                $scope.query.VoucherID = $scope.query.VoucherID || "";
                $scope.query.Status = $scope.query.Status || "";
                if ($scope.query.onlyOwner == true) {
                    $scope.query.userID = Auth.username;
                } else {
                    $scope.query.userID = "";
                }

                $scope.query.PageIndex = pageIndex;
                $scope.query.PageSize = pageSize;
                GateGoodsOut.GoodBasic().getGoodsList($scope.query).$promise.then(function (res) {

                    $scope.gridOptions.data = res.TableData;
                    $scope.gridOptions.totalItems = res.TableCount[0];
                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });
            }

            $scope.Search = function () {
                SearchList(1, 50);
            };
            //保存
            $scope.savedraft = function () {
                saveVoucher("N", function (errmsg) {
                    if (errmsg) {
                        Notifications.addMessage({'status': 'error', 'message': errmsg});
                    } else {
                        Notifications.addMessage({'status': 'information', 'message': "保存成功！"});
                    }
                })
            }
            function saveVoucher(Status, callback) {

                if ($scope.details.IsBack == true) {
                    if (!$scope.details.ExpectBack) {
                        callback($translate.instant('Goods_data_Msg'));
                        return;
                    }
                    if ($scope.details.ExpectBack < $scope.details.ExpectOut) {
                        callback($translate.instant('Goods_OutTime_Msg'));
                        return;
                    }
                } else {
                    $scope.details.ExpectBack = null;
                }
                for (var i = 0; i < $scope.details.GoodsItems.length; i++) {
                    console.log($scope.details.GoodsItems[i].ReasonSpec);
                    if (!in_array($scope.details.GoodsItems[i].ReasonSpec, $scope.reason)) {
                        callback($translate.instant('Goods_outReason_Msg'));
                        return
                    }
                }
                $scope.details.UserID = Auth.username;
                $scope.details.Status = Status;
                $scope.details.FileNames = JSON.stringify($scope.files);
                canOutIn($scope.details.ExpectOut, $scope.details.GoodsType, function (errmsg) {
                    if (errmsg) {
                        callback(errmsg);
                    } else {
                        GateGoodsOut.SaveGoodOut().complete({}, $scope.details).$promise.then(function (res) {
                            var voucherid = res.VoucherID;
                            if (voucherid) {
                                $scope.details.VoucherID = voucherid;
                                callback(null);
                            } else {
                                callback($translate.instant('Msg_Save'));
                            }
                        }, function (errormessage) {
                            callback(errormessage);
                        });
                    }
                })
            }

            $scope.savesubmit = function () {
                GateGuest.GetGateCheckers().getCheckers({
                    owner: Auth.username,
                    fLowKey: "FEPVGateGoodOut",
                    Kinds: $scope.details.GoodsType,
                    CheckDate: $scope.details.ExpectOut
                }).$promise.then(function (res) {
                        var leaderList = [];
                        for (var i = 0; i < res.length; i++) {
                            leaderList[i] = res[i].Person;
                        }
                        if (leaderList.length <= 0) {
                            Notifications.addError({'status': 'error', 'message': $translate.instant('Leader_NO_MSG')});
                            return
                        } else {
                            saveVoucher("F", function (errmsg) {
                                if (errmsg) {
                                    Notifications.addMessage({'status': 'error', 'message': errmsg});
                                } else {
                                    formVariables.push({name: "GoodOutChecher", value: leaderList});
                                    formVariables.push({name: "start_remark",   value: $scope.details.VoucherID + $scope.details.Remark    });
                                    formVariables.push({name: "VoucherID", value: $scope.details.VoucherID});
				    historyVariable = new Array();
                                    historyVariable.push({name: "VoucherID", value: $scope.details.VoucherID});
                                    historyVariable.push({name:"GoodsType",value:$scope.details.GoodsType});
                                    historyVariable.push({name:"BackOrNot",value:$scope.details.IsBack});
                                    historyVariable.push({name:"ExpectBack",value:$scope.details.ExpectBack});
                                    historyVariable.push({name:"TakeOut",value:$scope.details.TakeOut});
                                    historyVariable.push({name:"TakeCompany",value:$scope.details.TakeCompany});
                                    historyVariable.push({name:"VehicleNO",value:$scope.details.VehicleNO});
                                    historyVariable.push({name:"ExpectOut",value:$scope.details.ExpectOut});
                                    getFlowDefinitionId($scope.flowkey, function (FlowDefinitionId) {
                                        if (FlowDefinitionId) {
                                            //  Notifications.addMessage({'status': 'information', 'message': "保存成功:"+ reportid });
                                            startflowid(FlowDefinitionId, $scope.details.VoucherID);
                                        } else {
                                            Notifications.addError({'status': 'error', 'message': "获得流程定义出错"});
                                            return;
                                        }
                                    })
                                }
                            })
                        }
                    }, function (errormessage) {
                        Notifications.addError({'status': 'error', 'message': errormessage});
                    })
            };
            $scope.upAddition = function () {
                $('#fileModal').modal("show");
            };
            $scope.reset = function () {
                SearchList(1, 50);
                $('#myModal').modal('hide');
                $('#nextModal').modal('hide');
            }
            $scope.onFileSelect = function ($files, size) {
                console.log($files);
                if (!size) {
                    size = 1024 * 1024 * 1;
                }
                if ($files[0].type == "image/png" || $files[0].type == "image/jpg" || $files[0].type == "image/jpeg" || $files[0].type == "image/bmp") {
                    if ($files[0].size > size) {
                        Notifications.addError({'status': 'error', 'message': "upload file can't over " + size + "B"});
                        return false;
                    } else {
                        for (var i = 0; i < $files.length; i++) {
                            var $file = $files[i];

                            $scope.upload = $upload.upload({
                                url: '/api/cmis/upload',
                                method: "POST",
                                file: $file
                            }).progress(function (evt) {
                                // get upload percentage
                                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));

                            }).success(function (data, status, headers, config) {
                                // file is uploaded successfully
                                console.log(data.file);
                                $scope.files.push(data.file);
                            }).error(function (data, status, headers, config) {
                                console.log($file);
                                console.log(status);
                                console.log(data);
                            });
                        }
                    }
                }
                else {
                    Notifications.addError({'status': 'error', 'message': "upload file type is not correct"});
                    return false;
                }


            };
            $scope.deletefile = function (docid, index) {
                var data = "DocId=" + docid;
                $http.delete('/api/cmis/deletefile?' + data)
                    .success(function (data, status, headers) {
                        console.log(data);
                        $scope.files.splice(index, 1);
                    })
                    .error(function (data, status, header, config) {
                        Notifications.addError({'status': 'error', 'message': status + data});
                    });
            };
            function startflowid(definitionID, businessKey) {
                variablesMap = Forms.variablesToMap(formVariables)
                historyVariable = Forms.variablesToMap(historyVariable)
                var datafrom = {
                    formdata: variablesMap,
                    businessKey: businessKey,
                    historydata: historyVariable
                };
                console.log(datafrom);
                EngineApi.doStart().start({
                    "id": definitionID
                }, datafrom, function (res) {
                    console.log(res);
                    if (res.message) {
                        Notifications.addMessage({
                            'status': 'info',
                            'message': res.message
                        });
                        return;
                    }
                    if (!res.result) {
                        Notifications.addMessage({
                            'status': 'info',
                            'message': res.message
                        });
                    } else {

                        var result = JSON.parse(res.result);
                        console.log(result.id);
                        if (result.id) {
                            var queryObject = {processInstanceId: result.id};
                            EngineApi.getTasks().query(queryObject).$promise.then(function (nextres) {
                                $scope.nexttasks = nextres;
                                $('#nextModal').modal('show');
                            }, function (errormessage) {
                                Notifications.addError({'status': 'error', 'message': errormessage});
                            });
                        } else {
                            Notifications.addError({'status': 'error', 'message': "NO PID"});
                        }

                    }
                })
            }

            function getFlowDefinitionId(keyname, callback) {
                EngineApi.getKeyId().getkey({
                    "key": keyname
                }, function (res) {
                    callback(res.id);
                });
            }

            function canOutIn(ExpectOut, GoodsType, callback) {
                GateGoodsOut.GoodBasic().canOutIn({
                    Day: $scope.details.ExpectOut,
                    goodsType: $scope.details.GoodsType
                }).$promise.then(function (res) {
                        if (res.msg) {
                            callback($translate.instant('Goods_Out_NO'));
                        }
                        else {
                            callback()
                        }
                    }, function (errormessage) {

                        callback(errormessage)
                    });
            }

            function in_array(n, arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (n == arr[i].OutReason) {
                        return true;
                    }
                }
                return false
            }


            $scope.addGoodItem = function () {
                if ($scope.good != null || $scope.good != {}) {
                    var goodSpec = $scope.good;
                    for (var i = 0; i < $scope.goodsUnit.length; i++) {
                        if ($scope.goodsUnit[i].ID == $scope.good.Unit) {
                            goodSpec.UnitSpec = $scope.goodsUnit[i].Unit;
                        }
                    }
                    //console.log($filter('filter')($scope.goodsUnit, $scope.good.Unit));
                    //goodSpec.UnitSpec= $filter('filter')($scope.goodsUnit, $scope.good.Unit)[0].Unit||"";
                    goodSpec.ReasonSpec = $filter('filter')($scope.reason, $scope.good.Reason)[0].OutReason || "";
                    $scope.GoodsItems.push(goodSpec);
                    $scope.details.GoodsItems.push($scope.good);
                    $scope.good = {};
                }
            };
            $scope.deleteGoodItem = function (index) {
                $scope.GoodsItems.splice(index, 1);
                $scope.details.GoodsItems.splice(index, 1);
            };
            $scope.toggleCustom = function () {
                //   alert("0o");
                $scope.menuBar = $scope.menuBar === false ? true : false;
                $(".pinned").toggle(function () {
                    $(this).addClass("highlight");
                    $(this).next().fadeOut(1000);
                }, function () {
                    $(this).removeClass("highlight");
                    $(this).next("div .content").fadeIn(1000);
                });
            };
            $scope.openNotice = function(){
                $('#myModalNotice').modal('show');
            }

        }])


});