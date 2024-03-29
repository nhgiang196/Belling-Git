define(['myapp', 'angular', 'controllers/EHS/CReport/ImprovementDirective'], function (myapp, angular) {
    myapp.controller('CReportController', ['GateGuest', '$upload', '$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$timeout',
        function (GateGuest, $upload, $filter, Notifications, Auth, EngineApi, CReportService, InfolistService, $translate, $q, $scope, $timeout) {

            /***************************INIT AND DECLARE************************************************* */

            /**init var */
            const roleKey = 'FEPVHC_User'; //role key for access this module 
            $scope.recordAC = {}; //record for AC directive
            $scope.recordIC = {}; //record for IC directive
            $scope.AC_Department_Disable = false;
            $scope.show = { //show  signal
                submitbutton: true,
                checker: true, // list of checker show
                isHSEUser: null
            }
            /**List/combobox added */
            var lang = window.localStorage.lang || 'EN';

            $scope.rp_Submittype = ''; //set default search param
            $scope.SubmitTypelist = InfolistService.Infolist('SubmitType'); //search param list

            var rp_typeList = $scope.rp_typeList = [{ //list for RP_Type combobox
                    id: '',
                    name: $translate.instant('Show All')
                },
                {
                    id: 'IC',
                    name: $translate.instant('Incident')
                },
                {
                    id: 'A',
                    name: $translate.instant('Accident')
                }
            ];
            var rp_typelistEVR = [{ //list for RP_Type combobox
                    id: '',
                    name: $translate.instant('Show All')
                },
                { //list for RP_Type combobox
                    id: 'Low',
                    name: $translate.instant('RpIC_Affect-Low')
                },
                {
                    id: 'Medium',
                    name: $translate.instant('RpIC_Affect-Medium')
                },
                {
                    id: 'High',
                    name: $translate.instant('RpIC_Affect-High')
                }
            ];



            // $scope.SearchParam = {
            //     startdate: '',
            //     enddate:  '',
            //     rp_id: '',
            //     status: '',
            //     rp_submittype: InfolistService.Infolist('SubmitType')[0].id || '',
            //     rp_type: rp_typeList[0].id || '',
            //     lang: lang,
            //     searchmode: '',
            //     userid: $scope.onlyOwner == true ? Auth.username : ''
            // };

            $scope.rp_type = rp_typeList[0].id; //set default search param
            $scope.statuslist = InfolistService.Infolist('status'); //search param list

            /***************************SERVICE FIRST RUN************************************************** */

            /**cHECK IF USER IS HSE USER */
            var isHSEUser;
            EngineApi.getMemberInfo().get({
                userid: Auth.username
            }, function (res) {
                $scope.show.isHSEUser = isHSEUser = (res.DepartmentID == '519101000' ? true : false);
                // $scope.engine_department = res.DepartmentID;
            });

            // CReportService.GetBasic({
            //     TableName: "HSESubmitDepartment",
            //     Lang: lang || 'EN'
            // }, function (data) {

            // })


            /**Count number of report */
            CReportService.CountReport(function (data) { //count number of every type report
                var c = $scope.rpCounter = data[0];
                $scope.rpCounter.sumPending = c.pending_fp + c.pending_sf + c.pending_evr
                $scope.rpCounter.sumSubmited = c.count_fp + c.count_sf + c.count_evr
            }, function (error) {})



            /**********************************GRID -UI DEFINITION*********************************************************/
            var colgrid = [{
                    field: 'Rp_ID',
                    width: 130,
                    minWidth: 30,
                    displayName: $translate.instant('ReportID'),
                    cellTooltip: true,
                    cellTemplate: "<a  ng-click='grid.appScope.GetLink(row)' style='cursor:pointer;display: block;height: 80%;overflow: hidden;padding: 5px;' target='_blank'>{{COL_FIELD}}</a>",
                    enableFiltering: true,
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
                    field: 'Improvement_Status',
                    minWidth: 100,
                    displayName: $translate.instant('Improvement_Status'),
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getTranslatedCol(col.name,row.entity.Improvement_Status)}}</span>'
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
                    displayName: $translate.instant('CReportDateTime'),
                    cellTooltip: true
                },
                {
                    field: 'Rp_Location',
                    minWidth: 150,
                    displayName: $translate.instant('CreportLocation'),
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
                    minWidth: 150,
                    displayName: $translate.instant('Creator'),
                    cellTooltip: true
                },

            ];
            $scope.getTranslatedCol = function (colname, id) { //translated column
                switch (colname) {
                    case 'Rp_Status':
                        return $translate.instant($scope.statuslist.find(item => item.id === id).name);
                    case 'Rp_Location':
                        return $translate.instant($scope.locationlist.find(item => item.id === id).name);
                    case 'Rp_Type':
                        if (id == "IC") return $translate.instant("Incident");
                        return $translate.instant($scope.ACTypelist.find(item => item.id === id).name);
                    case 'Improvement_Status':
                        return $translate.instant('Improvement_Status-' + id);
                }
            };
            $scope.GetLink = function (data) { //Getlink để hiện báo cáo
                window.open('#/CircumstanceReport/ICReport/print/' + data.entity.Rp_ID);
            };
            $scope.gridOptions = { //Grid setting mặc định tên 
                columnDefs: colgrid,
                data: [],
                enableFiltering: true,
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
                    if (['Rp_Status', 'Rp_Location', 'Rp_Type', 'Improvement_Status'].indexOf(col.name) >= 0) {
                        if (value != undefined) value = $scope.getTranslatedCol(col.name, value);
                    }
                    return value;
                },
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({
                        'userid': Auth.username,
                        'tcode': roleKey
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


            $scope.ChangeSubmitType = function () {

                if ($scope.rp_Submittype == 'EVR') {
                    $scope.rp_typeList = rp_typelistEVR;
                    $scope.rp_type = rp_typelistEVR[0].id;
                } else if ($scope.rp_Submittype == 'FP' || $scope.rp_Submittype == 'SF') {
                    $scope.rp_typeList = rp_typeList;
                    $scope.rp_type = $scope.rp_typeList[0].id;
                }
                $scope.Search();
            };
            /** Event on change SubDepartment*/
            $scope.$watch('recordIC.ic_SubDeparmentid', function (val, olval) {
                if (val != null & val != undefined) OnChangeSubDepartmentID(val);
            });
            $scope.$watch('recordAC.ac_subdepartment', function (val) {
                if (val != null && val != undefined && val != 'Other') OnChangeSubDepartmentID(val);
            });

            function OnChangeSubDepartmentID(SubmitDepartmentID) {
                $scope.engine_department = SubmitDepartmentID; //search parram change
                if ($scope.show.checker)
                    $scope.getLeaderCheck(SubmitDepartmentID);
            };


            function SearchList() { //search information 
                var query = {
                    startdate: $scope.dateFrom || '',
                    enddate: $scope.dateTo || '',
                    rp_id: $scope.rp_id || '',
                    status: $scope.s_status || '',
                    rp_submittype: $scope.rp_Submittype || '',
                    rp_type: $scope.rp_type || '',
                    lang: lang,
                    searchmode: '',
                    departmentid: $scope.engine_department == undefined ? 'NonDepartment' : $scope.engine_department,
                    userid: $scope.onlyOwner == true ? Auth.username : ''
                };
                if (query.departmentid == 'NonDepartment' && isHSEUser) query.departmentid = '';
                return query;
            };
            $scope.Search = function () { //search function()   
                var query = SearchList();
                console.log($scope.gridOptions.columnDefs);
                $scope.gridOptions.columnDefs[5].visible = query.rp_submittype != 'EVR' ? true : false; //Rp_Type
                $scope.gridOptions.columnDefs[8].visible = query.rp_type == 'A' ? true : false; //EmployeeID
                $scope.gridOptions.columnDefs[9].visible = query.rp_type == 'A' ? true : false; //Employee - Name
                CReportService.SearchCReport(query, function (data) {
                    $scope.gridOptions.data = data;
                }, function (error) {});
            };

            function deleteById(id) { // delete
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
            var gridMenu = [{
                    title: $translate.instant('CreateIC_EVR'),
                    action: function () {
                        $scope.rp_type = $scope.rp_typeList[1].id // 0;
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
                        $scope.rp_type = $scope.rp_typeList[1].id;
                        $scope.status = 'N';
                        $('#my-modal').modal('show');
                        $scope.resetIC();
                    },
                    order: 1
                },
                {
                    title: $translate.instant('CreateAC'),
                    action: function () {
                        $scope.rp_type = $scope.rp_typeList[2].id;
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
                            if (Auth.username != 'cassie') {
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

                            }
                            // var value = resultRows[0].Rp_Location; // bật tắt disable nút file chỗ địa điểm  
                            //     if (value == "O") {
                            //         // $scope.btnFile = false;
                            //         // $scope.btnFile_AC = false;
                            //     } else {
                            //         // $scope.btnFile = true;
                            //         // $scope.btnFile_AC = true;
                            if (resultRows[0].Rp_TypeCode == "IC") { //UPDATE BÁO CÁO SỰ CỐ
                                $scope.rp_type = 'IC';
                                $scope.loadICDetail(resultRows[0].Rp_ID); //ICReportDirective load modal detail
                                $('#my-modal').modal('show');
                            } else { //UPDATE BÁO CÁO TAI NẠN
                                $scope.AC_Department_Disable = true; // disable 
                                $scope.rp_type = 'A';
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
                        if (resultRows.length == 1) {
                            if (resultRows[0].Rp_CreatorID != Auth.username && !isHSEUser && Auth.username != 'cassie') {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Update_onlyowner_MSG')
                                });
                                return;
                            }

                            $scope.LoadImprovementInfo(resultRows[0].Rp_ID);

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
                            var href = '#/CircumstanceReport/ICReport/print/' + resultRows[0].Rp_ID
                            // + ':true';
                            window.open(href);
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
            $scope.getLeaderCheck = function (SubmitDepartID) {
                $scope.checkList = [];
                $scope.leaderlist = [];
                if (SubmitDepartID)
                    CReportService.HSEChecker().get({
                        flowname: 'CReportHSE',
                        userid: Auth.username,
                        submitdepartid: SubmitDepartID || '',
                        kinds: '',
                        formkey: '',
                    }).$promise.then(function (leaderlist) {
                        if (leaderlist.length > 0) {
                            var checkList = [];
                            for (var i = 0; i < leaderlist.length; i++) {
                                checkList[i] = leaderlist[i].Person;
                            }
                            $scope.checkList = checkList;
                            $scope.leaderlist = leaderlist;
                            console.log("Checklist", $scope.checkList);
                            console.log("leaderlist", $scope.leaderlist);
                        };

                    }, function (errormessage) {
                        console.log(errormessage);
                    })
            };
            /**Save Submit */
            $scope.SaveSubmitCReport = function (Rp_ID) { // fnSavesubmit
                if ($scope.checkList.length <= 0) {
                    Notifications.addError({
                        'status': 'error',
                        'message': 'Don\'t get leader'
                    });
                    return;
                }
                $scope.formVariables = [];
                $scope.historyVariable = [];

                $scope.formVariables.push({
                    name: 'Receive_Users',
                    value: $scope.checkList
                }); //initiator -> Receive_Users
                $scope.historyVariable.push({
                    name: 'workflowkey',
                    value: 'CReportHSE'
                });

                /**Check if user have permission to submit */
                EngineApi.getTcodeLink().get({
                    userid: Auth.username,
                    tcode: roleKey
                }, function (linkres) {
                    if (linkres.IsSuccess) {

                        /**Save and Submit Button */
                        if (confirm($translate.instant('Submit_Alert') + Rp_ID)) {
                            if ($scope.status == 'N' && $scope.rp_type == 'IC') {
                                $scope.btnSub = true;
                                $scope.SaveICReport();
                            } else if ($scope.status == 'N' && $scope.rp_type == 'A') {
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
                    } else alert("You don't have permission!")
                });
            };
            $scope.SubmitAndChangeStatus = function (Rp_ID) { //fnchangeStatus 
                /**Submit to BPMN */
                CReportService.SubmitBPM($scope.formVariables, $scope.historyVariable, '', function (res, message) {
                    if (message) {
                        alert($translate.instant('Submit_Alert_Error') + message);
                    } else {
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
                        if ($scope.rp_type == 'IC') {
                            $scope.status = 'SM';
                            $scope.SaveICReport();
                        } else if ($scope.rp_type == 'A') {
                            $scope.status = 'SM';
                            $scope.SaveACReport();
                        }

                    }
                })
                /** Change Status to P */
            };



        } //function
    ]) // myapp.controller
}) //define