define(['myapp', 'angular', 'jszip', 'xlsx'], function (myapp, jszip) {
    myapp.controller('QualifiedController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location',
        'i18nService', 'Notifications', 'Auth', 'uiGridConstants', '$http',
        '$translatePartialLoader', '$translate', 'LIMSBasic', 'LIMSService', 'EngineApi', '$timeout', 'GateGuest',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, Auth, uiGridConstants, $http, $translatePartialLoader, $translate, LIMSBasic, LIMSService, EngineApi, $timeout, GateGuest, xlsx) {
            /** INIT */
            var username = Auth.username;
            $scope.flowkey = 'QCOverGrade';
            var lang = window.localStorage.lang || 'EN';
            var startDate = moment(new Date()).date(1).format('YYYY-MM-DD');
            var endDate = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
            var paginationOptions = {
                pageNumber: 1,
                pageSize: 100,
                sort: null
            };
            $scope.lang = lang;
            $scope.dateFrom = $scope.dateBegin = startDate;
            $scope.dateFrom = '2018-01-01';
            $scope.dateTo = $scope.dateEnd = endDate;
            $scope.onlyOwner = false;

            /**GET BASIC */
            LIMSBasic.GetSamples({ userid: Auth.username, query: '5' }, function (data) {
                console.log(data);
                if (data.length > 0) {
                    $scope.sampleList = data.filter((el) => {
                        return (el.SampleName === 'S01020001' || el.SampleName === 'S01020002')
                    })
                    console.log($scope.sampleList);
                }
            });

            LIMSBasic.GetStatus({
                ctype: 'Grade',
                lang: lang
            }, function (data) {
                $scope.StatusList = data;
            });

            LIMSBasic.GetLinesByAB({
                userid: Auth.username,
                sampleName: '',
                ab: ''
            }, function (res) {
                $scope.LinesList = res;
            });
            /**UI-GRID INIT */
            var col = [{
                field: 'VoucherID',
                displayName: $translate.instant('VoucherID'),
                minWidth: 100,
                cellTooltip: true,
                cellTemplate: '<a ng-click="grid.appScope.toDetail(row.entity.VoucherID,row.entity.SampleName,row.entity.Status)" style="padding:5px;display:block; cursor:pointer" target="_blank">{{COL_FIELD}}</a>'
            },
            {
                field: 'SampleName',
                displayName: $translate.instant('SampleName'),
                minWidth: 100,
                cellTooltip: true
                // cellTemplate: '<span >{{grid.appScope.getSampleName(row.entity.SampleName)}}</span>'
            },
            {
                field: 'Line',
                displayName: $translate.instant('Line'),
                minWidth: 30,
                cellTooltip: true
            },
            {
                field: 'LOT_NO',
                displayName: $translate.instant('Material'),
                minWidth: 100,
                cellTooltip: true
            },
            {
                field: 'Status',
                displayName: $translate.instant('Status'),
                minWidth: 70,
                cellTooltip: true,
                cellTemplate: '<span >{{grid.appScope.getStatus(row.entity.Status)}}</span>'
            },
            {
                field: 'ColorLabel',
                displayName: $translate.instant('ColorLabel'),
                minWidth: 100,
                cellTooltip: true,
                cellTemplate: '<span style="text-align:center; font-size:16pt;">■</span>',
                cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                    if (grid.getCellValue(row, col) === 'Red') {
                        return 'red';
                    } else return 'yellow'
                },
            },
            {
                field: 'CreateBy',
                displayName: $translate.instant('CreateBy'),
                minWidth: 100,
                cellTooltip: true
            },
            {
                field: 'CreateDate',
                displayName: $translate.instant('CreateDate'),
                minWidth: 130,
                cellTooltip: true
            },
            {
                field: 'BeginDate',
                displayName: $translate.instant('BeginDate'),
                minWidth: 90,
                cellTooltip: true
            },
            {
                field: 'EndDate',
                displayName: $translate.instant('EndDate'),
                minWidth: 90,
                cellTooltip: true
            },
            {
                field: 'Stamp',
                displayName: $translate.instant('Last Modify Date'),
                minWidth: 130,
                cellTooltip: true
            },];
            $scope.gridOptions = {
                columnDefs: col,
                data: [],
                enableColumnResizing: true,
                enableFullRowSelection: true,
                enableSorting: true,
                showGridFooter: true,
                gridFooterTemplate: '<div class="mygridFooter"><b>Total: {{grid.appScope.Total}} items </b></div>',
                // showColumnFooter: true,
                enableGridMenu: true,
                exporterMenuPdf: false,
                enableSelectAll: false,
                enableRowHeaderSelection: true,
                enableRowSelection: true,
                multiSelect: false,
                paginationPageSizes: [50, 100, 200, 500],
                paginationPageSize: 50,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({
                        userid: Auth.username,
                        tcode: $scope.flowkey
                    }, function (linkres) {
                        if (linkres.IsSuccess) {
                            gridApi.core.addToGridMenu(gridApi.grid, gridMenu_flow);
                        }
                        gridApi.core.addToGridMenu(gridApi.grid, gridMenu_commonuser);
                    });
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.selectedVoucherid = row.entity.VoucherID;
                    });
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                        $scope.Search();
                    });
                }
            };
            var gridMenu_flow = [
                {
                    title: $translate.instant('Create'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        if (resultRows.length == 1) {
                            $scope.sampleName = resultRows[0].SampleName;
                            $scope.material = resultRows[0].LOT_NO;
                            $scope.colorlabel = resultRows[0].ColorLabel;
                            $scope.dateBegin = resultRows[0].BeginDate;
                            $scope.dateEnd = resultRows[0].EndDate;
                            $scope.line = resultRows[0].Line;
                        } else {
                            $scope.dateBegin = $scope.dateFrom
                            $scope.dateBegin_change($scope.dateFrom);
                        }
                        $('#myModal').modal('show');
                    },
                    order: 1
                },
                {
                    title: $translate.instant('Delete'),
                    action: function ($event) {
                        var selectRows = $scope.gridApi.selection.getSelectedGridRows();
                        if (selectRows.length > 0) {
                            var VoucherID = selectRows[0].entity.VoucherID;
                            var Status = selectRows[0].entity.Status;

                            if (Status != 'N') {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': 'Can not delete this voucher ' + VoucherID
                                });
                                return;
                            }
                            if (confirm('Delete this VoucherID: ' + VoucherID + '?')) {
                                LIMSService.UpdateRYStatusVoucher({
                                    voucherID: VoucherID,
                                    status: 'X',
                                    userid: username
                                }, function (req) {
                                    if (req.Success) {
                                        Notifications.addMessage({
                                            'status': 'info',
                                            'message': 'Delete success'
                                        });
                                        $timeout(() => {
                                            $scope.Search();
                                        }, 500);
                                    }
                                }, function (errResponse) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': 'Can not delete because : ' + errResponse.data.Message
                                    });
                                });
                            }
                        } else {
                            Notifications.addMessage({
                                'status': 'error',
                                'message': 'Please Select Row'
                            });
                        }
                    },
                    order: 2
                }


            ];
            var gridMenu_commonuser = [
                {
                    title: $translate.instant('PrintQualifed'),
                    action: function () {
                        if (!checkSelectedRow()) return;
                        var resultRows = $scope.gridApi.selection.getSelectedRows();

                        var href = "#/LIMS/QualifiedControl/print/" + resultRows[0].VoucherID;
                        window.open(href);
                    },
                    order: 4
                },
                {
                    title: $translate.instant('InProcess'),
                    action: function () {
                        if (!checkSelectedRow()) return;
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        if (resultRows.length == 1) {
                            var ID = resultRows[0].VoucherID
                            LIMSService.QCOverGradePID().get({ OverID: ID }).$promise.then(function (res) {
                                console.log(res);
                                if (res) {
                                    window.open('#/processlog/' + res.ProcessInstanceId);
                                }
                            }, function (err) {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': err.data
                                });
                            })
                        }
                    },
                    order: 5
                },
                {
                    title: $translate.instant('PrintUQRedVoucher'),
                    action: function () {
                        if (!checkSelectedRow()) return;
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        var href = '#/LIMS/QualifiedControl/printRedUQ/' + resultRows[0].VoucherID;
                        window.open(href);
                    },
                    order: 6
                },
                // {
                //     title: $translate.instant('DetailExport'),
                //     action: function () {
                //         var query = SearchList();
                //         LIMSService.ISOQualify.DetailExport(query, function (res) {
                //             if (res) {
                //                 console.log(res);
                //                 var ws = XLSX.utils.json_to_sheet(res);
                //                 var wb = XLSX.utils.book_new();
                //                 XLSX.utils.book_append_sheet(wb, ws, 'downloadQC');
                //                 XLSX.writeFile(wb, 'downloadQC2.xls');
                //             }
                //         })


                //     },
                //     order: 8
                // },
                {
                    title: $translate.instant('printAllUQ'),
                    action: function () {
                        var href = '#/LIMS/QualifiedControl/printAllUQ/' + $scope.dateFrom + '&' + $scope.dateTo;
                        window.open(href);
                    },
                    order: 8
                },
            ];

            /**CLOSE BUTTON */
            $scope.Close = function () {
                $('#myModal').modal('hide');
                $('#DetailModal').modal('hide');

            };

            /**SEARCH BUTTON*/
            function SearchList() {
                var params = {};
                params.voucherid = $scope.voucherid || '';
                params.sampleName = $scope.sampleName || '';
                params.LOT_NO = $scope.material || '';
                params.colorlabel = $scope.colorlabel || '';
                params.B = $scope.dateFrom || '';
                params.E = $scope.dateTo || '';
                params.userID = $scope.onlyOwner ? Auth.username : '';
                params.status = $scope.status || '';
                params.Line = $scope.line || '';
                return params;
            }
            $scope.Search = function () {
                var query = SearchList();
                $scope.Total = 0;
                if ($scope.onlyOwner == true) {
                    $scope.Owner = Auth.username;
                } else {
                    //$scope.Owner = '';
                    $scope.Owner = $scope.department;
                }
                LIMSService.ISOQualify.SearchRYVouchers(query, function (res) {
                    $scope.Total = res.length;
                    $scope.gridOptions.data = res;

                });

            };
            /**************************FUNCTIONS OF WATCHED AND CHANGED VALUES AND CONDITIONS *****************************************/
            $scope.$watch('sampleName', function (n) {
                if (n !== undefined && $scope.sampleName !== null) {
                    LIMSBasic.GetMaterial({
                        userid: Auth.username,
                        sampleName: $scope.sampleName,
                        query: '0'
                    }, function (res) {
                        $scope.materialList = res;
                    });
                }
            })
            $scope.dateBegin_change = function (date) {
                var d = new Date(date);
                // d.setDate(d.getDate()+1);
                $scope.dateEnd = moment(d).add(+1, 'days').format('YYYY-MM-DD');
            }
            $scope.getStatus = function (Status) {
                var statLen = $filter('filter')($scope.StatusList, {
                    'State': Status
                });
                if (statLen.length > 0) {
                    return statLen[0].StateSpec;
                } else {
                    return Status;
                }
            };
            function checkSelectedRow() {
                var resultRows = $scope.gridApi.selection.getSelectedRows();
                if (resultRows.length == 1) {
                    return true;
                } else {
                    Notifications.addError({
                        'status': 'error',
                        'message': $translate.instant('Please choose row')
                    });
                    return false;
                }

            }
            /*********************************COMMON FUNCTION *************************************/
            /**INIT NOTE */
            function saveInitNote() {
                var note = {};
                note.SampleName = $scope.sampleName || '';
                note.LOT_NO = $scope.material || '';
                note.ColorLabel = $scope.colorlabel || '';
                note.BeginDate = $scope.dateBegin || '';
                note.EndDate = $scope.dateEnd || '';
                note.CreateBy = Auth.username;
                note.Status = 'N';
                return note;
            }

            /**get Information of next Candidate */
            function getGateCheck(samplename) {
                $scope.checkList = [];
                $scope.leaderlist = [];
                GateGuest.GetGateCheckers().getCheckers({
                    owner: username,
                    flowkey: $scope.flowkey,
                    Kinds: samplename,
                    CheckDate: NaN
                }, function (leaderlist) {
                    if (leaderlist.length > 0) {
                        var checkList = [];
                        for (var i = 0; i < leaderlist.length; i++) {
                            checkList[i] = leaderlist[i].Person;
                        }
                        $scope.checkList = checkList;
                        $scope.leaderlist = leaderlist;
                        return true;
                    };
                    return false;
                }, function (errormessage) {
                    console.log(errormessage);
                    return false;
                })
            }


            /********************************SHOW DETAIL MODALS***************************************************** */
            $scope.toDetail = function (parram_VoucherID, parram_Samplename, parram_status) {
                /** 1- GET RECEIVERS */
                $scope.receiver = [];
                if (parram_status != 'N') {
                    LIMSService.QCOverGradePID().get({ OverID: parram_VoucherID }).$promise.then(function (res) {
                        console.log(res);
                        if (res) {
                            EngineApi.getProcessLogs.getList({ "id": res.ProcessInstanceId, "cId": "" }, function (data) {
                                console.log(data[0].Logs);
                                data.forEach(function(value,index){
                                    if (index>=1) 
                                        data[0].Logs.push.apply(data[0].Logs,data[index].Logs)
                                })
                                var receiver = [];
                                var taf = TAFFY(data[0].Logs);
                                receiver[0] = taf({ TaskName: "起始表单" }).first(); //initiator
                                receiver[1] = taf({ TaskName: "Receive and process" }).first(); //Product team
                                if ($scope.recod.Status.indexOf(['S', 'X'] >= 0)) { //(if published)
                                    receiver[3] = taf({ TaskName: "publish", }).start(3).first();//QCleader
                                    receiver[2] = taf({ TaskName: "publish", }).start(2).first();//QCmanager
                                }
                                $scope.receiver = receiver;
                                console.log(receiver);
                            })
                        }
                    })

                }
                else if (getGateCheck(parram_Samplename)) {
                    Notifications.addError({
                        'status': 'error',
                        'message': 'Error on getting data'
                    });
                }

                /** 2- GET DETAIL */
                LIMSService.ISOQualify.GetDetailReport({ voucherID: parram_VoucherID }, function (data) {
                    var plansHeader = [];
                    $scope.plansHeader = [];
                    if (data.length > 0) {
                        $scope.recod = {};
                        $scope.UQList = data;
                        var plansHeader = [];
                        for (var key in data[0]) {
                            if (['VoucherID', 'ColorLabel', 'State', 'VoucherNO',
                                'CreateDate', 'BeginDate', 'EndDate', 'Stamp', 'Status',
                                'Reason', 'Solution', 'Prevention', 'Remark', 'CreateBy', 'SampleName', 'LINE', 'LOT_NO'].indexOf(key) < 0 && key.indexOf('$') < 0) {
                                plansHeader.push(key);
                            }
                        }
                        /** Information of Red or Yellow Voucher*/
                        if (data[0].ColorLabel == 'Red') {
                            $scope.isRed = true;
                            $scope.color = {
                                'TW': '紅',
                                'VN': 'ĐỎ',
                                'ISO': '5VGAAQR140-01', //this ISO number should be stored in Database (they are developing)...
                                'Solution': data[0].Solution
                            };
                        } else {
                            $scope.color = {
                                'TW': '黃',
                                'VN': 'VÀNG',
                                'ISO': '5VGAAQR141-01', //...as well as this number
                                'Solution': data[0].Solution
                            };
                            $scope.isRed = false; // to define which Color
                        }
                        /// module USER IN DEPART
                        $scope.plansHeader = plansHeader;
                        $scope.recod = data[0];
                        $scope.isShow = ($scope.recod.Status === 'N') ? true : false; //show submit button (printQualifed)
                        $('#DetailModal').modal('show'); //SHOW IF GET DATA SUCCESS
                    }
                    else $timeout(() => {
                        Notifications.addErorr({
                            'status': 'error',
                            'message': 'There is no data or error on getting data'
                        });
                    }, 2000);
                });
            }

            /*****************************SAVE BUTTON **************************************/
            $scope.Save = () => {
                var note = saveInitNote();
                LIMSService.ISOQualify.CreateVoucher(note).$promise.then(function (res) {
                    if (res.Success.length > 0) {
                        Notifications.addMessage({
                            'status': 'info',
                            'message': 'Create ' + note.ColorLabel + ' ' + res.Success[0].VoucherID + ' successed!'
                        });
                        $timeout(() => {
                            $scope.Search();
                        }, 2000);
                    }
                    else {
                        Notifications.addError({
                            'status': 'error',
                            'message': 'Can not create ' + note.LOT_NO + ' ' + note.ColorLabel + ' it not exist'
                        });
                    }
                });
                $scope.colorlabel = '';
                $scope.dateFrom = $scope.dateBegin;
                $scope.dateTo = $scope.dateEnd;
                $('#myModal').modal('hide');


            }
            /*****************************SAVE/SUBMIT BUTTON**************************************/
            $scope.SaveSubmit = function (isCreated) {
                var formVariables = [];
                var historyVariable = [];
                /**Check if user have permission to submit */
                EngineApi.getTcodeLink().get({
                    userid: Auth.username,
                    tcode: $scope.flowkey
                }, function (linkres) {
                    if (linkres.IsSuccess) {


                        formVariables.push({ name: 'EnginerArray', value: $scope.checkList }); //initiator -> EnginerArray -> QCManagerList
                        historyVariable.push({ name: 'workflowkey', value: $scope.flowkey });
                        //Voucher has not created yet, then create.
                        /**Save and Submit Button */
                        if (confirm('Would you like save and submit this Voucher?')) {
                            if (isCreated) {
                                /** Save  */
                                var note = saveInitNote();
                                LIMSService.ISOQualify.CreateVoucher(note).$promise.then(function (res) {
                                    if (res.Success.length > 0) {
                                        var newVoucherID = res.Success[0].VoucherID;
                                        formVariables.push({ name: 'OverID', value: newVoucherID });
                                        /**Submit */
                                        SubmitAndChangeStatus(newVoucherID);
                                    }
                                    else {
                                        Notifications.addError({
                                            'status': 'error',
                                            'message': 'Voucher doesn\'t exist data. It wont be create and submit.'
                                        });
                                    }
                                })
                            }
                            else {
                                /**Submit Button */
                                formVariables.push({ name: 'OverID', value: $scope.recod.VoucherID });
                                LIMSService.ISOQualify.GetNewRYVoucher({ voucherid: $scope.recod.VoucherID }, function (res) {
                                    if (res.Success) {
                                        SubmitAndChangeStatus($scope.recod.VoucherID);
                                    }
                                    else
                                        alert('This voucher has been submit befored!');
                                })
                            }
                        }


                    }
                    else alert("You don't have permission!")
                });

                function SubmitAndChangeStatus(voucherid) {
                    /**Submit to BPMN */
                    debugger;
                    LIMSService.SubmitBPM($scope.flowkey, formVariables, historyVariable, '', function (res, message) {
                        if (message) {
                            alert('Can not Submit this voucher because : ' + message);
                        } else {
                            /**Save to Server and change status */
                            LIMSService.UpdateRYStatusVoucher({
                                voucherID: voucherid,
                                status: 'P',
                                userid: username
                            }, function (res) {
                                if (res.Success) {
                                    Notifications.addMessage({
                                        'status': 'info',
                                        'message': 'Your voucher ' + voucherid + ' is submited!'
                                    });
                                    $('#DetailModal').modal('hide');
                                    $timeout(() => {
                                        $scope.Search();
                                    }, 2000);
                                }
                            }, function (err) {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': 'Save Error' + err
                                });
                            })
                        }
                    })
                    /** Change Status to P */

                }


            }






        }
    ]);
});