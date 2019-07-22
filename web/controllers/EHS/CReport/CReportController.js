define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('CReportController', ['GateGuest', '$upload', '$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$timeout',
        function (GateGuest, $upload, $filter, Notifications, Auth, EngineApi, CReportService, InfolistService, $translate, $q, $scope, $timeout) {
            $scope.recordAC = {};
            $scope.recordIC = {};
            $scope.flowkey = 'HW-User';
            $scope.onlyOwner = true;
            $scope.mySwitch = false; // bật tắt input Bộ phận trong AC khi sửa
            $scope.show = {
                submitbutton: true,
                checker: true
            }
            // $scope.ImprovementRecord = {};
            var lang = window.localStorage.lang || 'EN';
            /***************************************************************************** */
            /**search comboboxs */
            $scope.typelist = [{
                id: 'all',
                name: $translate.instant('All')
            }, {
                id: '0',
                name: $translate.instant('Incident')
            }, {
                id: '1',
                name: $translate.instant('Accident')
            }];
            $scope.typelistEVR = [{
                id: 'all',
                name: $translate.instant('All')
            }, {
                id: '0',
                name: $translate.instant('Incident')
            }, {
                id: '2',
                name: $translate.instant('PollutionEnvironment')
            }];
            $scope.demolist = $scope.typelist; //list for EVR or others. Depend on submit_type
            $scope.statuslist = InfolistService.Infolist('status'); //search param list
            $scope.SubmitTypelist = InfolistService.Infolist('SubmitType'); //search param list
            $scope.rp_Submittype = $scope.SubmitTypelist[0]; //set default search param
            $scope.rp_type = $scope.typelist[0].id; //set default search param
            /**********************************GRID -UI DEFINITION*********************************************************/
            var colCReport = [{
                    field: 'Rp_ID',
                    width: 130,
                    minWidth: 30,
                    displayName: $translate.instant('ReportID'),
                    cellTooltip: true,
                    cellTemplate: "<a  ng-click='grid.appScope.GetLink(row)' style='cursor:pointer;display: block;height: 80%;overflow: hidden;padding: 5px;' target='_blank'>{{COL_FIELD}}</a>"

                },
                {
                    field: 'Rp_Status',
                    displayName: $translate.instant('Status'),
                    width: 100,
                    minWidth: 10,
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getTranslatedCol(col.name,row.entity.Rp_Status)}}</span>'
                },
                {
                    field: 'Rp_Date',
                    displayName: $translate.instant('CreateDate'),
                    width: 150,
                    minWidth: 100,
                    cellTooltip: true,
                },
                {
                    field: 'DepartmentName',
                    minWidth: 150,
                    displayName: $translate.instant('Department'),
                    cellTooltip: true,
                },
                {
                    field: 'Rp_Type',
                    minWidth: 120,
                    displayName: $translate.instant('ReportType'),
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getTranslatedCol(col.name,row.entity.Rp_Type)}}</span>'
                },
                {
                    field: 'Rp_DateTime',
                    minWidth: 150,
                    displayName: $translate.instant('Icdatetime'),
                    cellTooltip: true
                },
                {
                    field: 'Rp_Location',
                    minWidth: 150,
                    displayName: $translate.instant('Iclocation'),
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getTranslatedCol(col.name,row.entity.Rp_Location)}}</span>'
                },
                {
                    field: 'EmployeeID',
                    minWidth: 120,
                    displayName: $translate.instant('EmployeeID'),
                    cellTooltip: true
                },
                {
                    field: 'Name',
                    minWidth: 150,
                    displayName: $translate.instant('EmployeeName'),
                    cellTooltip: true,
                },
                {
                    field: 'Rp_CreatorID',
                    minWidth: 70,
                    displayName: $translate.instant('Creator'),
                    cellTooltip: true
                }
            ];
            $scope.getTranslatedCol = function (colname, id) {
                switch (colname) {
                    case 'Rp_Status':
                        return $translate.instant($scope.statuslist.find(item => item.id === id).name);
                    case 'Rp_Location':
                        return $translate.instant($scope.locationlist.find(item => item.id === id).name);
                    case 'Rp_Type':
                        if (id == "IC") return $translate.instant("Incident");
                        return $translate.instant($scope.ACTypelist.find(item => item.id === id).name);
                }
            }
            //Grid setting mặc định tên 
            $scope.gridOptions = {
                columnDefs: colCReport,
                data: [],
                enableColumnResizing: true,
                enableFullRowSelection: true,
                enableSorting: true,
                showGridFooter: false,
                enableGridMenu: true,
                exporterMenuPdf: false,
                enableSelectAll: false,
                enableRowHeaderSelection: true,
                enableRowSelection: true,
                multiSelect: false,
                paginationPageSizes: [50, 100, 200, 500],
                paginationPageSize: 100,
                enableFiltering: false,
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,
                exporterFieldCallback: function (grid, row, col, value) {
                    if (['Rp_Status', 'Rp_Location', 'Rp_Type'].indexOf(col.name) >= 0) {
                        if (value != undefined) value = $scope.getTranslatedCol(col.name, value);
                    }
                    return value;
                },
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({
                        'userid': Auth.username,
                        'tcode': $scope.flowkey
                    }, function (linkres) {
                        if (linkres.IsSuccess) {
                            gridApi.core.addToGridMenu(gridApi.grid, gridMenu);
                        }
                    });
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.selectedSupID = row.entity.SupID;
                    });
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                    });
                }
            };
            /**************************** FUNCTIONS ************************************************************** */
            //Getlink để hiện báo cáo
            $scope.GetLink = function (data) {
                var employee_id = data.entity.EmployeeID;
                var id = data.entity.Rp_ID;
                var ReportType = data.entity.Rp_Type;
                CReportService.GetDepartment_RP({
                    Rp_ID: id
                }, function (res) {
                    if (res.Success) {
                        var other_depart = res.Data;
                        if (ReportType != 'IC') {
                            console.log(id);
                            if (other_depart == "Other") {
                                var href = '#/CircumstanceReport/ACReport/print/' + id + '_o';
                                window.open(href);
                            } else {
                                var href = '#/CircumstanceReport/ACReport/print/' + id;
                                window.open(href);
                            }
                        } else {
                            console.log(id);
                            var href = '#/CircumstanceReport/ICReport/print/' + id;
                            window.open(href);
                        }
                    }
                });
            }
            $scope.ChangeSubmitType = function () {
                if ($scope.rp_Submittype.id == 'EVR') {
                    $scope.demolist = $scope.typelistEVR;
                    $scope.rp_type = $scope.typelistEVR[0].id;
                } else if ($scope.rp_Submittype.id == 'FP' || $scope.rp_Submittype.id == 'SF') {
                    $scope.demolist = $scope.typelist;
                    $scope.rp_type = $scope.typelist[0].id;
                }
                $scope.Search();
            };
            //search information 
            function SearchList() {
                var query = {};
                query.startdate = $scope.dateFrom || '';
                query.enddate = $scope.dateTo || '';
                query.Id = $scope.rp_id || '';
                query.Status = $scope.s_status || '';
                query.SubmitType = $scope.rp_Submittype.id || '';
                query.ReportType = $scope.rp_type || '';
                query.Lang = lang;
                // chỉ xem báo cáo của tôi
                if ($scope.onlyOwner == true) {
                    query.uid = Auth.username;
                } else query.uid = '';
                return query;
            };
            //search function()
            $scope.Search = function () {
                var query = SearchList();
                CReportService.SearchCReport(query, function (data) {
                    $scope.gridOptions.data = data;
                }, function (error) {});
            };

            // hàm bật tắt disable nút file chỗ địa điểm  
            function disableFileLocation(value) {
                if (value == "O") {
                    // $scope.btnFile = false;
                    // $scope.btnFile_AC = false;
                } else {
                    // $scope.btnFile = true;
                    // $scope.btnFile_AC = true;
                }
            }
            // delete
            function deleteById(id) {
                var data = {
                    Rp_ID: id
                };
                CReportService.Delete(data, function (res) {
                        if (res.Success) {
                            $scope.Search();
                            $timeout(function () {
                                Notifications.addMessage({
                                    'status': 'information',
                                    'message': $translate.instant('Delete_Succeed_Msg')
                                })
                            }, 200);
                        } else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('saveError') + res.Message
                            });
                        }
                    },
                    function (error) {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('saveError') + error
                        });
                    })
            };
            /****************************GRID MENU FUNCTIONS********************************************** */
            var gridMenu = [

                {
                    title: $translate.instant('CreateIC_EVR'),
                    action: function () {
                        $scope.rp_type = $scope.typelist[1].id // 0;
                        $scope.status = 'N';
                        $('#my-modal').modal('show');
                        $scope.resetIC();

                        $scope.recordIC.submittype = 'EVR';
                    },
                    order: 1
                },

                {
                    title: $translate.instant('CreateIC'),
                    action: function () {
                        $scope.rp_type = $scope.typelist[1].id;
                        $scope.status = 'N';
                        $('#my-modal').modal('show');
                        $scope.resetIC();
                    },
                    order: 1
                },

                {
                    title: $translate.instant('CreateAC'),
                    action: function () {
                        $scope.rp_type = $scope.typelist[2].id;
                        $scope.status = 'N';
                        $scope.listEmployee = []; // danh sách lấy thông tin nhân viên
                        $('#myModal').modal('show');
                        $scope.resetAC();
                    },
                    order: 2
                },

                {
                    title: '📝 ' + $translate.instant('Update'),
                    action: function () {
                        $scope.status = 'M'; //Set update Status
                        var resultRows = $scope.gridApi.selection.getSelectedRows(); // lấy dòng đang tick
                        if (resultRows.length == 1) {

                            if (resultRows[0].Rp_CreatorID != Auth.username) {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Update_onlyowner_MSG')
                                });
                                return;
                            } else if (resultRows[0].Rp_Status == 'P') {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Update_Processing_MSG')
                                });
                                return;
                            } else if (resultRows[0].Rp_Status == 'X') {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Update_Deleted_MSG')
                                });
                                return;
                            } else if (resultRows[0].Rp_Status == 'S') {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Update_Signed_MSG')
                                });
                                return;
                            }
                            // disableFileLocation(resultRows[0].Rp_Location); // bật tắt disable nút file chỗ địa điểm  
                            if (resultRows[0].Rp_Type == "IC") { //UPDATE BÁO CÁO SỰ CỐ
                                $scope.rp_type = '0';
                                $scope.loadICDetail(resultRows[0].Rp_ID); //ICReportDirective load modal detail
                                $('#my-modal').modal('show');
                            } else { //UPDATE BÁO CÁO TAI NẠN
                                $scope.mySwitch = true; // disable 
                                $scope.rp_type = '1';
                                $scope.loadACDetail(resultRows[0].Rp_ID); //load modal ACReportDirective
                                $('#myModal').modal('show');
                            }
                        } else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('Select_ONE_MSG')
                            });
                        }
                    },
                    order: 3
                },
                {
                    title: '👨🏻‍🚒 ' + $translate.instant('Update_Improvement'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows(); // lấy dòng đang tick
                        $scope.ReportDetail = {};
                        $scope.listfile = [];
                        if (resultRows.length == 1) {
                            if (resultRows[0].Rp_CreatorID != Auth.username) {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Update_onlyowner_MSG')
                                });
                                return;
                            }

                            if (resultRows[0].Rp_Type == "IC") { //UPDATE BÁO CÁO SỰ CỐ
                                {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('IC Wont Work')
                                    });
                                    return;
                                }
                            }

                            $scope.ReportDetail.Rp_ID = resultRows[0].Rp_ID
                            CReportService.FindByID({
                                Rp_ID: resultRows[0].Rp_ID
                            }, function (data) {

                                if (new Date(data.RpAC_DateComplete) >= new Date()) {

                                    $scope.ImprovementRecord = data;
                                    data.FileAttached.forEach(element => {
                                        var x = {};
                                        x.Rp_ID = element.Rp_ID;
                                        x.name = element.File_ID;
                                        x.col = element.ColumnName;
                                        $scope.listfile.push(x);
                                    })
                                    $('#modal_Improvement').modal('show');

                                } else {

                                    $timeout(function () {
                                        Notifications.addError({
                                            'status': 'error',
                                            'message': $translate.instant('Date to complete Improvement are out: ' + data.RpAC_DateComplete.toString())
                                        });
                                    }, 300);



                                }





                            }, function (error) {});



                        } else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('Select_ONE_MSG')
                            });
                        }
                    },
                    order: 3
                },

                {
                    title: '🖨️ ' + $translate.instant('PrintReport'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows(); // lấy dòng đang tick
                        if (resultRows.length == 1) {
                            if (resultRows[0].Rp_Type == "IC") {
                                var href = '#/CircumstanceReport/ICReport/print/' + resultRows[0].Rp_ID + ':true';
                                window.open(href);
                            } else {
                                CReportService.GetDepartment_RP({
                                    Rp_ID: resultRows[0].Rp_ID
                                }, function (res) {
                                    if (res.Success) {
                                        var other_depart = res.Data;
                                        if (resultRows[0].Rp_Type != 'IC') {
                                            if (other_depart == "Other") {
                                                var href = '#/CircumstanceReport/ACReport/print/' + resultRows[0].Rp_ID + '_' + resultRows[0].EmployeeID + '_o' + ':true';
                                                window.open(href);
                                            } else {
                                                var href = '#/CircumstanceReport/ACReport/print/' + resultRows[0].Rp_ID + '_' + resultRows[0].EmployeeID + ':true';
                                                window.open(href);
                                            }
                                        }
                                    }
                                });
                            }
                        } else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('Select_ONE_MSG')
                            });
                        }
                    },
                    order: 4
                },
                {
                    title: '❌ ' + $translate.instant('Delete'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        if (resultRows.length == 1) {
                            if (resultRows[0].Rp_CreatorID != Auth.username) {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Delete_onlyowner_MSG')
                                });
                            } else if (resultRows[0].Rp_Status == 'P') {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Delete_Processing_MSG')
                                });
                            } else if (resultRows[0].Rp_Status == 'X') {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Delete_Deleted_MSG')
                                });
                            } else if (resultRows[0].Rp_Status == 'S') {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Delete_Signed_MSG')
                                });
                            } else if (confirm($translate.instant('Delete_IS_MSG') + ':' + resultRows[0].Rp_ID)) {
                                deleteById(resultRows[0].Rp_ID);
                            }
                        } else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('Select_ONE_MSG')
                            });
                        }
                    },
                    order: 5
                },
                {
                    title: '🧾 ' + $translate.instant('InProcess'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        if (resultRows.length == 1) {
                            var ID = resultRows[0].Rp_ID;
                            CReportService.CReportHSEPID().get({
                                Rp_ID: ID
                            }).$promise.then(function (res) {
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
                    order: 6
                },
            ];

            /**get Information of next Candidate */
            getGateCheck(null);

            function getGateCheck(CReportType) {
                $scope.checkList = [];
                $scope.leaderlist = [];
                GateGuest.GetGateCheckers().getCheckers({
                    owner: Auth.username,
                    flowkey: 'CReportHSE',
                    Kinds: '',
                    CheckDate: NaN
                }, function (leaderlist) {
                    if (leaderlist.length > 0) {
                        var checkList = [];
                        for (var i = 0; i < leaderlist.length; i++) {
                            checkList[i] = leaderlist[i].Person;
                        }
                        $scope.checkList = checkList;
                        $scope.leaderlist = leaderlist;
                        console.log("Checklist", $scope.checkList);
                        console.log("leaderlist", $scope.leaderlist);
                        return true;
                    };
                    return false;
                }, function (errormessage) {
                    console.log(errormessage);
                    return false;
                })
            }
            /**Save Submit */
            $scope.SaveSubmitCReport = function (Rp_ID) {
                $scope.formVariables = [];
                $scope.historyVariable = [];
                /**Check if user have permission to submit */
                // EngineApi.getTcodeLink().get({
                //     userid: Auth.username,
                //     tcode: $scope.flowkey
                // }, function (linkres) {
                //     if (linkres.IsSuccess) {
                $scope.formVariables.push({
                    name: 'Receive_Users',
                    value: $scope.checkList
                }); //initiator -> Receive_Users
                $scope.historyVariable.push({
                    name: 'workflowkey',
                    value: 'CReportHSE'
                });
                //Report has not created yet, then create.
                /**Save and Submit Button */
                if (confirm($translate.instant('Submit_Alert') + Rp_ID)) {
                    if ($scope.status == 'N' && $scope.rp_type == 0) {
                        $scope.btnSub = true;
                        $scope.SaveICReport();
                    } else if ($scope.status == 'N' && $scope.rp_type == 1) {
                        $scope.btnSub = true;
                        $scope.SaveACReport();
                    } else {
                        $scope.formVariables.push({
                            name: 'Rp_ID',
                            value: Rp_ID //chosen
                        });
                        $scope.SubmitAndChangeStatus(Rp_ID);
                    }
                }
                // } else alert("You don't have permission!")
                // });

            } // fnSavesubmit
            $scope.SubmitAndChangeStatus = function (Rp_ID) {
                /**Submit to BPMN */
                CReportService.SubmitBPM($scope.formVariables, $scope.historyVariable, '', function (res, message) {
                    if (message) {
                        alert($translate.instant('Submit_Alert_Error') + message);
                    } else {
                        if ($scope.status == 'N') {
                            CReportService.SubmitStatus({
                                    Rp_ID: Rp_ID,
                                    Rp_Status: 'P'
                                },
                                function (res) {
                                    if (res.Success) {
                                        $scope.Search();
                                        $timeout(function () {
                                            Notifications.addMessage({
                                                'status': 'info',
                                                'message': $translate.instant('Submit_Success_MSG')
                                            });
                                        }, 300);
                                    }
                                },
                                function (err) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': 'Save Error' + err
                                    });
                                }
                            );
                        } else {
                            if ($scope.rp_type == 0) {
                                $scope.status = 'SM';
                                $scope.SaveICReport();
                            } else if ($scope.rp_type == 1) {
                                $scope.status = 'SM';
                                $scope.SaveACReport();
                            }
                        }
                    }
                })
                /** Change Status to P */
            } //fnchangeStatus 
            $scope.btnImprovementSave = function (myrecord) {
                var templsFile = [];
                if ($scope.listfile.length > 0) {
                    $scope.listfile.forEach(element => {
                        templsFile.push({
                            File_ID: element.name,
                            ColumnName: element.col,
                            Rp_ID: myrecord.Rp_ID
                        });
                    })
                }
                myrecord.FileAttached = templsFile; //File list
                console.log(myrecord);
                CReportService.GetInfoBasic.Update(myrecord, function (res) {
                        if (res.Success) {
                            $('#modal_Improvement').modal('hide');
                            $scope.update_msg();
                        } else {
                            $scope.update_error_msg();
                        }
                    },
                    function (error) {
                        $scope.update_error_msg(error);
                    })






            }
            CReportService.CountReport(function (data) {
                $scope.rpCounter = {
                    Safe: data[0].count_safe,
                    Envi: data[0].count_evr,
                    Fire: data[0].count_fire
                }
            }, function (error) {})
        } //function
    ]) // myapp.controller
}) //define