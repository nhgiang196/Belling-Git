/**
 * 
 * 承揽商资质
 */
define(['myapp', 'angular'], function (myapp) {
    myapp.controller('ConQuaController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate','GateGuest',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate,GateGuest) {
            var lang = window.localStorage.lang;
            $scope.bpmnloaded=false;
            $scope.flowkey = 'GateContractorInfoProcess';
            $scope.query={};

            GateGuest.GetQueryStatus().get({ctype: 'ConQua', language: lang, flag: '1'}).$promise.then(function (res) {
                $scope.StatusList = res;

            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            ConQuaService.ContractorTypeList().get({kind: 'Kind', language: lang}).$promise.then(function (res) {
                $scope.KindList = res;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            //得到管理单位
            EngineApi.getDepartment().getList({userid: Auth.username, ctype: ''}, function (res) {
                $scope.CDepartmentList = res;
            });

            $scope.showPng = function () {
                if ($scope.bpmnloaded == true) {
                    $scope.bpmnloaded = false;
                } else {
                    $scope.bpmnloaded = true;
                }
            }
       
            var col = [
                {
                    field: 'Employer',
                    cellTemplate: "<a ng-click='grid.appScope.getVoucher(row)' style='padding:5px;display:block; cursor:pointer'>{{COL_FIELD}}</a>",
                    displayName: $translate.instant('ConQua_Employer'),
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'ContracorKind',
                    displayName: $translate.instant('ConQua_CType'),
                    minWidth: 105,
                    cellTooltip: true
                },
                {field: 'ContracorType', displayName: $translate.instant('Type'), minWidth: 105, cellTooltip: true},
                {field: 'Rcode', displayName: $translate.instant('ConQua_Rcode'), minWidth: 200, cellTooltip: true},

                {field: 'Remark', displayName: $translate.instant('Remark'), minWidth: 200, cellTooltip: true},
                {
                    field: 'Specification',
                    displayName: $translate.instant('ConQua_paraDepartment'),
                    minWidth: 80,
                    cellTooltip: true
                },
                {field: 'StatusRemark', displayName: $translate.instant('Status'), minWidth: 80, cellTooltip: true}
            ];
            $scope.getVoucher = function (obj) {
                $('#Details').modal('show')
                var EmployerId = obj.entity.EmployerId
                if (EmployerId) {
                    ConQuaService.getContractorPID().get({
                        employerid: EmployerId
                    }).$promise.then(function (conres) {
                        $scope.processList = conres;
                    }, function (errResponse) {
                        Notifications.addError({
                            'status': 'error',
                            'message': errResponse
                        });
                    });

                    ConQuaService.getContractorCancelPID().get({
                        employerid: EmployerId
                    }).$promise.then(function (conres) {
                        $scope.cancelprocessList = conres;
                    }, function (errResponse) {
                        Notifications.addError({
                            'status': 'error',
                            'message': errResponse
                        });
                    });
                }
            }
            /*
            function IsCanSave(EmployerId, callback) {
                if (EmployerId) {
                    ConQuaService.ContractorQualification().get({employerid: EmployerId}).$promise.then(function (statres) {
                        if (statres) {
                            callback(statres.Status);
                        } else {
                            callback('');
                        }

                    }, function (errResponse) {
                        callback(errResponse);
                    })
                } else {
                    callback('');
                }
            }
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
                paginationPageSizes: [50, 100, 200, 500],
                paginationPageSize: 50,
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({'userid': Auth.username, 'tcode': $scope.flowkey}, function (linkres) {
                        if (linkres.IsSuccess) {
                            gridApi.core.addToGridMenu(gridApi.grid, gridMenu);

                        }
                    })

                }
            };
            var gridMenu= [{
                title: $translate.instant('Create'),
                action: function ($event) {
                    $location.url('/Contractor?status=N');
                },
                order: 1
            }, {
                title: $translate.instant('Update'),
                action: function ($event) {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    if (resultRows.length == 1) {
                        var e = resultRows[0];
                        //如果是草稿提交流程
                        if (e.EmployerId) {
                            ConQuaService.ContractorQualification().get({employerid: e.EmployerId}).$promise.then(function (statres) {
                                if (statres) {
                                    if (statres.Status == 'Q' || statres.Status == 'N') {
                                        $location.url('/Contractor?employerId=' + statres.EmployerId + '&userid=' + statres.UserID + '&status='+statres.Status);
                                    } else {
                                        Notifications.addError({'status': 'error', 'message': '状态不对，不能修改！'});
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
                title: $translate.instant('Delete'),
                action: function ($event) {
                    /*   var href =/gate/GoodsOut/:code/:oprea
                    window.open(href);*/
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    var e = resultRows[0];
                    console.log(e)
                    if (resultRows.length == 1) {
                        var projects = {};
                        projects.Employer = e.Employer;
                        var r = confirm($translate.instant('Delete_IS_MSG') + $translate.instant('Contractor') + '[' + e.Employer + ']？');
                        if (r == true) {
                            if (e.Status == 'Q') {
                                $('#delConfirm').modal('show');
                            }
                            else if(e.Status == 'N'){
                                var query = {}
                                query.employerId = e.EmployerId
                                query.status = 'X'
                                ConQuaService.ConQuaSaveStatus().save(query,{}).$promise.then(function (res) {
                                    console.log(res);
                                    QueryInfoList();
                                }, function (errResponse) {
                                    Notifications.addError({'status': 'error', 'message': errResponse});
                                });
                            }
                            else {
                                Notifications.addError({'status': 'error', 'message': 'State is wrong, can not be canceled!'});

                            }

                        }
                    }
                },
                order: 3
    },{
        title: $translate.instant('Detail'),
        action: function ($event) {
            /*   var href =/gate/GoodsOut/:code/:oprea
             window.open(href);*/
            var resultRows = $scope.gridApi.selection.getSelectedRows();
            var e = resultRows[0];
            console.log(e)
            if (resultRows.length == 1) {
                var EmployerId = e.EmployerId
                if (EmployerId) {
                    ConQuaService.ContractorQualification().get({employerid: EmployerId}).$promise.then(function (statres) {
                        if (statres) {
                            if (statres.Status == 'N') {
                                $location.url('/Contractor?employerId=' + EmployerId + '&userid=' + statres.UserID + '&status=N');
                            } else {
                                //明细
                                $location.url('/Contractor/Detail?employerId=' + EmployerId);
                            }
                        }
                    }, function (errResponse) {
                        Notifications.addError({'status': 'error', 'message': errResponse});
                    })
                }
            }
        },
        order: 4

    }];
            var formVariables = [];
            var historyVariable = [];
            var variablesMap = {};
            $scope.invalidConfirm = function () {
                var resultRows = $scope.gridApi.selection.getSelectedRows();
                var e = resultRows[0];
                GateGuest.GetGateCheckers().getCheckers({
                    owner: Auth.username,
                    fLowKey: 'FEPVConInfoCancel',
                    Kinds: '',
                    CheckDate: ''
                }).$promise.then(function (res) {
                        var leaderList = [];
                        for (var i = 0; i < res.length; i++) {
                            leaderList[i] = res[i].Person;
                        }
                        if (leaderList.length <= 0) {
                            Notifications.addError({'status': 'error', 'message': $translate.instant('Leader_NO_MSG')});
                            return
                        } else {
                            GateGuest.GetGateCheckerByKind('Contractor',function(reslen,errormsg) {
                                if (errormsg) {
                                    Notifications.addError({'status': 'error', 'message': errormsg});
                                    return;
                                } else {
                                    leaderList.push(reslen);
                                    formVariables.push({name: 'ChecherArray', value: leaderList});
                                    formVariables.push({name: 'EmployerId', value: e.EmployerId});
                                    formVariables.push({name: 'start_remark', value: e.Remark});
                                    formVariables.push({name: 'Employer', value: e.Employer});
                                    formVariables.push({name: 'invalidReason', value: $scope.invalidReason});
                                    historyVariable.push({name: 'Employer', value: e.Employer});
                                    historyVariable.push({name: 'DeleteReason', value: $scope.invalidReason});
                                    getFlowDefinitionId('FEPVConInfoCancel', function (FlowDefinitionId) {
                                        if (FlowDefinitionId) {
                                            //  Notifications.addMessage({'status': 'information', 'message': '保存成功:'+ reportid });
                                            startflowid(FlowDefinitionId, e.EmployerId);
                                            $('#delConfirm').modal('hide');
                                        } else {
                                            Notifications.addError({'status': 'error', 'message': 'Process definition error'});
                                            return;
                                        }
                                    })
                                }
                            })
                        }
                    });
            };

            function getFlowDefinitionId(keyname, callback) {
                EngineApi.getKeyId().getkey({
                    'key': keyname
                }, function (res) {
                    callback(res.id);
                });
            }
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
                    'id': definitionID
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

                        $location.url('/taskForm/'+res.url);

                    }
                })
            }


            $scope.QueryInfo = function () {
                QueryInfoList();
            };

            //查询承揽商资质列表
            function QueryInfoList() {

                ConQuaService.ContractorQualification().getList({
                    employer: $scope.query.paraEmployer||'',
                    cType: $scope.query.paraCType||'',
                    language: lang,
                    departmentID: $scope.query.paraDepartment||'',
                    status: $scope.query.paraStatus||'',
                    userid: User
                }).$promise.then(function (res) {
                    $scope.gridOptions.data = res;

                }, function (errResponse) {
                    Notifications.addError({'status': 'error', 'message': errResponse});
                });
            }


        }])
    ;
})
;
