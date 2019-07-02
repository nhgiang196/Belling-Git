define(['myapp', 'controllers/EHS/CReport/ACReportDirective', 'controllers/EHS/CReport/ICReportDirective', 'angular'], function (myapp, angular) {
    myapp.controller('CReportController', ['GateGuest', '$upload', '$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$timeout',
        function (GateGuest, $upload, $filter, Notifications, Auth, EngineApi, CReportService, InfolistService, $translate, $q, $scope, $timeout) {
            $scope.recordIC = {};
            $scope.recordAC = {};
            $scope.flowkey = 'HW-EHS';
            $scope.onlyOwner = true;
            $scope.mySwitch = false; // bật tắt input Bộ phận trong AC khi sửa

            //----------------------------------------------------------
            $scope.save_msg = function () {
                $timeout(function () {
                    Notifications.addMessage({
                        'status': 'information',
                        'message': $translate.instant('Save_Success_MSG')
                    });
                }, 400);
            }

            $scope.nofileLoc = function () {
                $timeout(function () {
                    Notifications.addError({
                        'status': 'error',
                        'message': $translate.instant('File_Location')
                    });
                });
            }

            $scope.update_msg = function () {
                $timeout(function () {
                    Notifications.addMessage({
                        'status': 'information',
                        'message': $translate.instant('Update_Success_MSG')
                    });
                }, 400);
            }

            $scope.ac_details_msg = function () {
                Notifications.addMessage({
                    'status': 'information',
                    'message': $translate.instant('ACDetails_Msg')
                });
            }

            // IC-----------------------------------------------------------------------------
            // btn-file của Đạt---------------------------------------------

            $scope.btnfile = function (id, filename) {
                var filein = document.querySelector("#" + id);
                var filename = document.querySelector("#" + filename);

                filein.click();
            }
            //------------------------------------------------------------------------------------
            /**Upload file */
            $scope.UploadFileHSE = function ($files, _reportType, _colName) {
                $upload.upload({
                    url: '/Waste/files/Upload',
                    method: "POST",
                    file: $files
                }).progress(function (evt) {

                }).then(function (res) {

                    res.data.forEach(x => {
                        $scope.dt.name = x;
                        $scope.dt.col = _colName;
                        if (_reportType = 'IC')
                            $scope.listfile.push($scope.dt);
                        if (_reportType = 'AC')
                            $scope.listfileAC.push($scope.dt);
                        $scope.dt = {};
                    })


                })
            }

            // report type combobox
            $scope.typelist = [{
                    id: '0',
                    name: $translate.instant('Incident')
                },
                {
                    id: '1',
                    name: $translate.instant('Accident')
                }
            ];
            $scope.rp_type = $scope.typelist[0]; // mặc định combobox loại báo cáo là: Sự cố suýt xảy ra
            //status combobox
            $scope.statuslist = InfolistService.Infolist('status');
            //evaluate combobox
            $scope.evaluatelist = InfolistService.Infolist('evaluate');
            // location combobox
            $scope.locationlist = InfolistService.Infolist('location');
            // incident type combobox
            $scope.incidentlist = InfolistService.Infolist('incident');
            // AC type combobox
            $scope.ACTypelist = InfolistService.Infolist('ACType');

            $scope.getCReportStatus = function (id) {
                var status = $scope.statuslist.find(item => item.id === id).name;
                status = $translate.instant(status);
                return status;
            }

            $scope.getCReportLocation = function (id) {
                var location = $scope.locationlist.find(item => item.id === id).name;
                location = $translate.instant(location);
                return location;
            }

            $scope.getCReportIncident = function (id) {
                var ICType = $scope.incidentlist.find(item => item.id === id).name;
                ICType = $translate.instant(ICType);
                return ICType;
            }

            $scope.getCReportAccident = function (id) {
                var ACType = $scope.ACTypelist.find(item => item.id === id).name;
                ACType = $translate.instant(ACType);
                return ACType;
            }
            // định nghĩa cột trong Grid UI của Incident (sự cố)
            var colIC = [{
                    field: 'Rp_ID',
                    minWidth: 30,
                    displayName: $translate.instant('ReportID'),
                    cellTooltip: true,
                    cellTemplate: "<a  ng-click='grid.appScope.GetLink(row)' style='cursor:pointer;display: block;height: 80%;overflow: hidden;padding: 5px;' target='_blank'>{{COL_FIELD}}</a>"
                },

                {
                    field: 'Rp_Date',
                    displayName: $translate.instant('CreateDate'),
                    minWidth: 100,
                    cellTooltip: true,

                },

                {
                    field: 'DepartmentName',
                    minWidth: 70,
                    displayName: $translate.instant('Department'),
                    cellTooltip: true
                },

                {
                    field: 'RpIC_IncidentType',
                    minWidth: 200,
                    displayName: $translate.instant('IncidentType'),
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getCReportIncident(row.entity.RpIC_IncidentType)}}</span>'
                },
                {
                    field: 'Rp_DateTime',
                    minWidth: 70,
                    displayName: $translate.instant('Icdatetime'),
                    cellTooltip: true
                },
                {
                    field: 'Rp_Location',
                    minWidth: 100,
                    displayName: $translate.instant('Iclocation'),
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getCReportLocation(row.entity.Rp_Location)}}</span>'
                },
                {
                    field: 'Rp_CreatorID',
                    minWidth: 100,
                    displayName: $translate.instant('Creator'),
                    cellTooltip: true
                },
                {
                    field: 'Rp_Status',
                    displayName: $translate.instant('Status'),
                    width: 100,
                    minWidth: 10,
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getCReportStatus(row.entity.Rp_Status)}}</span>'

                }
            ];

            // định nghĩa cột trong Grid UI của Accident (tai nạn)
            var colAC = [{
                    field: 'Rp_ID',
                    minWidth: 130,
                    displayName: $translate.instant('ReportID'),
                    cellTooltip: true,
                    cellTemplate: "<a  ng-click='grid.appScope.GetLink(row)' style='cursor:pointer;display: block;height: 80%;overflow: hidden;padding: 5px;' target='_blank'>{{COL_FIELD}}</a>"

                },
                {
                    field: 'Rp_Type',
                    displayName: $translate.instant('ReportType'),
                    minWidth: 120,
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getCReportAccident(row.entity.Rp_Type)}}</span>'
                },

                {
                    field: 'Rp_Date',
                    displayName: $translate.instant('CreateDate'),
                    minWidth: 120,
                    cellTooltip: true,

                },

                {
                    field: 'DepartmentName',
                    minWidth: 120,
                    displayName: $translate.instant('Department'),
                    cellTooltip: true
                },
                {
                    field: 'Rp_DateTime',
                    minWidth: 120,
                    displayName: $translate.instant('Acdatetime'),
                    cellTooltip: true
                },
                {
                    field: 'Rp_Location',
                    minWidth: 120,
                    displayName: $translate.instant('Aclocation'),
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getCReportLocation(row.entity.Rp_Location)}}</span>'
                },
                {
                    field: 'EmployeeID',
                    minWidth: 140,
                    displayName: $translate.instant('EmployeeID'),
                    cellTooltip: true
                },
                {
                    field: 'Name',
                    minWidth: 140,
                    displayName: $translate.instant('EmployeeName'),
                    cellTooltip: true
                },
                {
                    field: 'Rp_CreatorID',
                    minWidth: 125,
                    displayName: $translate.instant('Creator'),
                    cellTooltip: true
                },
                {
                    field: 'Rp_Status',
                    displayName: $translate.instant('Status'),
                    minWidth: 100,
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getCReportStatus(row.entity.Rp_Status)}}</span>'

                }
            ];

            //Grid setting mặc định tên 
            $scope.gridOptions = {
                columnDefs: colIC,
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

            //Getlink để hiện báo cáo
            $scope.GetLink = function (data) {
                var employee_id = data.entity.EmployeeID;
                var id = data.entity.Rp_ID;
                if ($scope.rp_type.id == '1') {
                    console.log(id);
                    var href = '#/CircumstanceReport/ACReport/print/' + id + '_' + employee_id;
                    window.open(href);
                } else if ($scope.rp_type.id == '0') {
                    console.log(id);
                    var href = '#/CircumstanceReport/ICReport/print/' + id;
                    window.open(href);
                }
            }

            var lang = window.localStorage.lang;

            //search information 
            function SearchList() {
                var query = {};
                // query.PageIndex = paginationOptions.pageNumber || '';
                // query.PageSize = paginationOptions.pageSize || '';
                query.startdate = $scope.dateFrom || '';
                query.enddate = $scope.dateTo || '';
                query.Id = $scope.rp_id || '';
                query.Status = $scope.s_status || '';
                query.Lang = lang;

                // chỉ xem báo cáo của tôi
                if ($scope.onlyOwner == true) {
                    query.uid = Auth.username;
                } else query.uid = '';
                return query;
            };

            //search function()
            $scope.Search = function () {
                // show grid ui theo loại báo cáo 
                if ($scope.rp_type.id == "1") {

                    $scope.gridOptions.columnDefs = colAC;

                    var query = SearchList();
                    CReportService.SearchAC(query, function (data) {
                        $scope.gridOptions.data = data;

                    }, function (error) {

                    })

                } else if ($scope.rp_type.id == "0") {
                    $scope.gridOptions.columnDefs = colIC;


                    var query = SearchList();
                    CReportService.SearchIC(query, function (data) {
                        $scope.gridOptions.data = data;

                    }, function (error) {

                    })
                }
            };

            // Lấy dữ liệu lên modalIC để chỉnh sửa
            function loadICDetail(id) {
                CReportService.FindByID({
                    Rp_ID: id
                }, function (data) {
                    $scope.recordIC.rp_id = data.Rp_ID;
                    $scope.recordIC.icGroup = data.RpIC_Group;
                    $scope.recordIC.ic_departmentid = data.Rp_DepartmentID;
                    $scope.recordIC.ic_SubDeparmentid = data.Rp_SubDepartmentID;
                    $scope.recordIC.ic_deparid = data.Rp_DepartmentID;
                    $scope.recordIC.icDatetime = data.Rp_DateTime;
                    $scope.recordIC.icLocation = data.Rp_Location;
                    $scope.recordIC.icPrevent = data.Rp_PreventMeasure;
                    $scope.recordIC.icProcess = data.RpIC_Description;
                    $scope.recordIC.icDr_reason = data.RpIC_DirectReason;
                    $scope.recordIC.icIdr_reason = data.RpIC_IndirectReason;
                    $scope.recordIC.icBasic = data.RpIC_BasicReason;
                    $scope.recordIC.icResult = data.RpIC_Damage;
                    $scope.recordIC.icImprove = data.RpIC_Process;
                    $scope.recordIC.icEvaluate = data.RpIC_Evaluate;
                    $scope.recordIC.icType = data.RpIC_IncidentType;

                    $scope.listfile = [];
                    data.FileAttached.forEach(element => {
                        var x = {};
                        x.Rp_ID = element.Rp_ID;
                        x.name = element.File_ID;
                        x.col = element.ColumnName;
                        $scope.listfile.push(x);
                    })

                }, function (error) {

                    Notifications.addError({
                        'status': 'error',
                        'message': res.Message
                    });
                })
            };

            // Lấy dữ liệu lên modalAC để chỉnh sửa
            function loadACDetail(id) {
                CReportService.FindByID({
                    Rp_ID: id
                }, function (data) {
                    $scope.recordAC.rp_id = data.Rp_ID;
                    $scope.recordAC.ac_subdepartment = data.Rp_SubDepartmentID;
                    $scope.recordAC.ac_type = data.Rp_Type;
                    $scope.recordAC.ac_datetime = data.Rp_DateTime;
                    $scope.recordAC.ac_location = data.Rp_Location;
                    $scope.recordAC.ac_prevent = data.Rp_PreventMeasure;
                    $scope.recordAC.ac_improvesoft = data.RpAC_ImproveSoftware;
                    $scope.recordAC.ac_improvehard = data.RpAC_ImproveHardware;
                    $scope.recordAC.ac_datecomp = data.RpAC_DateComplete;
                    $scope.recordAC.ac_resultsoft = data.RpAC_ResultSoftware;
                    $scope.recordAC.ac_resulthard = data.RpAC_ResultHardware;

                    $scope.employees = [];
                    $scope.showEmployeeList(data.Rp_SubDepartmentID);
                    data.AccidentDetail.forEach(element => {
                        var x = {};
                        x.Injury_Description = element.Injury_Description;
                        x.Rp_ID = element.Rp_ID;
                        x.Treatment_Result = element.Treatment_Result;
                        x.Witness_info = element.Witness_info;
                        x.EmployeeID = element.EmployeeID;
                        $scope.employees.push(x);
                    })

                    $scope.listfile = [];
                    $scope.injury = [];
                    data.FileAttached.forEach(element => {
                        if (element.ColumnName == "Rp_Location") {
                            var x = {};
                            x.Rp_ID = element.Rp_ID;
                            x.name = element.File_ID;
                            x.col = element.ColumnName;
                            $scope.listfile.push(x);
                        } else {
                            var x = {};
                            x.Rp_ID = element.Rp_ID;
                            x.name = element.File_ID;
                            x.empID = element.Profile_ID;
                            x.col = element.ColumnName;
                            $scope.injury.push(x);
                        }
                    })
                }, function (error) {

                })
            };

            // hàm bật tắt disable nút file chỗ địa điểm  
            function disableFileLocation(value) {
                if (value == "O") {
                    $scope.btnFile = false;
                    $scope.btnFile_AC = false;
                } else {
                    $scope.btnFile = true;
                    $scope.btnFile_AC = true;
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
                            }, 400);
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

            //Grid menu
            var gridMenu = [{
                    title: $translate.instant('CreateIC'),
                    action: function () {
                        // $scope.rp_type.id = '0';
                        $scope.rp_type = $scope.typelist[0];
                        $scope.status = 'N';
                        $('#my-modal').modal('show');
                        $scope.resetIC();
                    },
                    order: 1
                },
                {
                    title: $translate.instant('CreateAC'),
                    action: function () {
                        // $scope.rp_type.id = '1';
                        $scope.rp_type = $scope.typelist[1];
                        $scope.status = 'N';
                        $scope.listEmployee = []; // danh sách lấy thông tin nhân viên
                        $('#myModal').modal('show');
                        $scope.resetAC();

                    },
                    order: 2
                },

                {
                    title: $translate.instant('Update'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows(); // lấy dòng đang tick
                        //UPDATE BÁO CÁO SỰ CỐ
                        if ($scope.rp_type.id == "0") {
                            $scope.status = 'M'; //Set update Status
                            if (resultRows.length == 1) {

                                if (resultRows[0].Rp_CreatorID != Auth.username) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Update_onlyowner_MSG')
                                    });
                                } else if (resultRows[0].Rp_Status == 'P') {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Update_Processing_MSG')
                                    });
                                } else if (resultRows[0].Rp_Status == 'X') {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Update_Deleted_MSG')
                                    });
                                } else if (resultRows[0].Rp_Status == 'S') {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Update_Signed_MSG')
                                    });
                                } else {
                                    disableFileLocation(resultRows[0].Rp_Location); // bật tắt disable nút file chỗ địa điểm  
                                    loadICDetail(resultRows[0].Rp_ID);
                                    $('#my-modal').modal('show');
                                }

                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Select_ONE_MSG')
                                });
                            }
                            //UPDATE BÁO CÁO TAI NẠN
                        } else if ($scope.rp_type.id == "1") {
                            $scope.mySwitch = true; // disable 
                            $scope.status = 'M'; //Set update Status
                            if (resultRows.length == 1) {

                                if (resultRows[0].Rp_CreatorID != Auth.username) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Update_onlyowner_MSG')
                                    });
                                } else if (resultRows[0].Rp_Status == 'P') {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Update_Processing_MSG')
                                    });
                                } else if (resultRows[0].Rp_Status == 'X') {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Update_Deleted_MSG')
                                    });
                                } else if (resultRows[0].Rp_Status == 'S') {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Update_Signed_MSG')
                                    });
                                } else {
                                    disableFileLocation(resultRows[0].Rp_Location); // bật tắt disable nút file chỗ địa điểm  
                                    loadACDetail(resultRows[0].Rp_ID);
                                    $('#myModal').modal('show');
                                }


                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Select_ONE_MSG')
                                });
                            }
                        }

                    },
                    order: 3
                },

                {
                    title: '🖨️ ' + $translate.instant('PrintReport'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows(); // lấy dòng đang tick
                        if ($scope.rp_type.id == "0") {
                            if (resultRows.length == 1) {
                                var href = '#/CircumstanceReport/ICReport/print/' + resultRows[0].Rp_ID + ':true';
                                window.open(href);
                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Select_ONE_MSG')
                                });
                            }
                        } else {
                            if (resultRows.length == 1) {
                                var href = '#/CircumstanceReport/ACReport/print/' + resultRows[0].Rp_ID + ':true';
                                window.open(href);
                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Select_ONE_MSG')
                                });
                            }
                        }

                    },
                    order: 4
                },
                {
                    title: $translate.instant('Delete'),
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
                                $scope.Search();
                            }

                        } else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('Select_ONE_MSG')
                            });
                        }
                    },
                    order: 5

                }, {
                    title: $translate.instant('Submit'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows();
                        if (resultRows.length == 1) {
                            if (resultRows[0].Status != 'P' && resultRows[0].Status != 'S' && resultRows[0].Rp_CreatorID == Auth.username) {
                                $scope.SaveSubmitCReport(resultRows[0].Rp_ID);
                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': $translate.instant('Delete_onlyowner_MSG')
                                });
                            }
                        } else {
                            Notifications.addError({
                                'status': 'error',
                                'message': $translate.instant('Select_ONE_MSG')
                            });
                        }
                    },
                    order: 6
                }
            ];

            //Choose SubDepartment to show Employees 
            $scope.showEmployeeList = function (dept_id) {
                $scope.gd = {};
                $scope.employees = [];
                if (dept_id == null || dept_id == '') return;
                CReportService.GetEmployee({
                    DepartmentID: dept_id
                }, function (res) {
                    if (res.length > 0) {
                        $scope.listEmployee = res;
                        console.log($scope.listEmployee);
                    } else $scope.listEmployee = [];
                })
                $scope.listEmployee = [];
            };




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
                var formVariables = [];
                var historyVariable = [];
                /**Check if user have permission to submit */
                EngineApi.getTcodeLink().get({
                    userid: Auth.username,
                    tcode: $scope.flowkey
                }, function (linkres) {
                    if (linkres.IsSuccess) {
                        formVariables.push({
                            name: 'Receive_User',
                            // name: 'Leader_Checklist',
                            value: ['FEPV000166']
                        }); //initiator -> Leader_Checklist
                        historyVariable.push({
                            name: 'workflowkey',
                            value: 'CReportHSE'
                        });
                        //Voucher has not created yet, then create.
                        /**Save and Submit Button */
                        if (confirm('Would you like save and submit this Voucher? ' + Rp_ID)) {
                            // if (isCreated) {
                            //     /** Save  */
                            //     var note = saveInitNote();
                            //     LIMSService.ISOQualify.CreateVoucher(note).$promise.then(function (res) {
                            //         if (res.Success.length > 0) {
                            //             var newVoucherID = res.Success[0].VoucherID;
                            //             formVariables.push({
                            //                 name: 'OverID',
                            //                 value: newVoucherID
                            //             });
                            //             /**Submit */
                            //             SubmitAndChangeStatus(newVoucherID);
                            //         } else {
                            //             Notifications.addError({
                            //                 'status': 'error',
                            //                 'message': 'Voucher doesn\'t exist data. It wont be create and submit.'
                            //             });
                            //         }
                            //     })
                            // } else {
                            /**Submit Button */
                            formVariables.push({
                                name: 'Rp_ID',
                                value: Rp_ID //chosen
                            });

                            SubmitAndChangeStatus(Rp_ID); //need to check before submit

                            // LIMSService.ISOQualify.GetNewRYVoucher({
                            //     voucherid: $scope.recod.VoucherID
                            // }, function (res) {
                            //     if (res.Success) {
                            //         SubmitAndChangeStatus($scope.Rp_ID);
                            //     } else
                            //         alert('This voucher has been submit befored!');
                            // })
                            // }
                        }


                    } else alert("You don't have permission!")
                });

                function SubmitAndChangeStatus(voucherid) {
                    /**Submit to BPMN */
                    CReportService.SubmitBPM(formVariables, historyVariable, '', function (res, message) {
                        if (message) {
                            alert('Can not Submit this voucher because : ' + message);
                        } else {
                            alert('submit done!"');
                            /**Save to Server and change status */
                            // CReportService.Update({
                            //     voucherID: voucherid,
                            //     status: 'P',
                            //     userid: username
                            // }, function (res) {
                            //     if (res.Success) {
                            //         Notifications.addMessage({
                            //             'status': 'info',
                            //             'message': 'Your voucher ' + voucherid + ' is submited!'
                            //         });
                            //         $timeout(() => {
                            //             $scope.Search();
                            //         }, 2000);
                            //     }
                            // }, function (err) {
                            //     Notifications.addError({
                            //         'status': 'error',
                            //         'message': 'Save Error' + err
                            //     });
                            // })
                        }
                    })
                    /** Change Status to P */

                } //fnhangeStatus
            } // fnSavesubmit
        } //function
    ]) // myapp.controller

}) //define