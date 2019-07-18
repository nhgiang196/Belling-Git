define(['myapp', 'controllers/EHS/CReport/ACReportDirective', 'controllers/EHS/CReport/ICReportDirective', 'angular'], function (myapp, angular) {
    myapp.controller('CReportController', ['GateGuest', '$upload', '$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$timeout',
        function (GateGuest, $upload, $filter, Notifications, Auth, EngineApi, CReportService, InfolistService, $translate, $q, $scope, $timeout) {
            $scope.recordIC = {};
            $scope.recordAC = {};
            $scope.flowkey = 'HW-User';
            $scope.onlyOwner = true;
            $scope.mySwitch = false; // bật tắt input Bộ phận trong AC khi sửa
            $scope.show = {
                submitbutton: true,
                checker: true
            }
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

            $scope.rp_type = $scope.typelist[0].id;
            $scope.demolist = $scope.typelist;


            //status combobox
            $scope.statuslist = InfolistService.Infolist('status');
            //evaluate combobox
            $scope.evaluatelist = InfolistService.Infolist('evaluate');
            // location combobox
            $scope.locationlist = InfolistService.Infolist('location');
            // AC type combobox
            $scope.ACTypelist = InfolistService.Infolist('ACType');
            // Submit type combobox
            $scope.SubmitTypelist = InfolistService.Infolist('SubmitType');
            $scope.rp_Submittype = $scope.SubmitTypelist[0];

            //----------------------------------------------------------
            $scope.save_msg = function () {
                $timeout(function () {
                    Notifications.addMessage({
                        'status': 'information',
                        'message': $translate.instant('Save_Success_MSG')
                    });
                }, 200);
            }

            $scope.nofileLoc = function () {
                $timeout(function () {
                    Notifications.addError({
                        'status': 'error',
                        'message': $translate.instant('File_Location')
                    });
                }, 200);
            }

            $scope.update_msg = function () {
                $timeout(function () {
                    Notifications.addMessage({
                        'status': 'information',
                        'message': $translate.instant('Update_Success_MSG')
                    });
                }, 300);
            }

            $scope.ac_details_msg = function () {
                Notifications.addMessage({
                    'status': 'information',
                    'message': $translate.instant('ACDetails_Msg')
                });
            }

            $scope.submit_success_msg = function () {
                $timeout(function () {
                    Notifications.addMessage({
                        'status': 'info',
                        'message': $translate.instant('Submit_Success_MSG')
                    });
                }, 300);
            }

            $scope.save_error_msg = function () {
                $timeout(function () {
                    Notifications.addMessage({
                        'status': 'error',
                        'message': $translate.instant('Msg_Save')
                    });
                }, 300);
            }

            $scope.update_error_msg = function () {
                $timeout(function () {
                    Notifications.addMessage({
                        'status': 'error',
                        'message': $translate.instant('UpdateError')
                    });
                }, 300);
            }

            $scope.same_employee_msg = function () {
                $timeout(function () {
                    Notifications.addMessage({
                        'status': 'error',
                        'message': $translate.instant('SameEmployee')
                    });
                }, 300);
            }

            // IC-----------------------------------------------------------------------------
            // btn-file của Đạt---------------------------------------------

            $scope.btnfile = function (id, filename) {
                var filein = document.querySelector("#" + id);
                var filename = document.querySelector("#" + filename);

                filein.click();
            }
            /*******************************************************************************************/
            /**Upload file */
            $scope.listfile = [];
            $scope.listfileAC = []; // chứa file tình hình bị thương khi upload  
            $scope.dt = {};
            $scope.UploadFileHSE = function ($files, _colName) {
                $upload.upload({
                    url: '/Waste/files/Upload',
                    method: "POST",
                    file: $files
                }).progress(function (evt) {

                }).then(function (res) {

                    res.data.forEach(x => {
                        var chuthuong = x.toLowerCase();

                        $scope.dt.name = x;
                        $scope.dt.col = _colName;
                        if (_colName == 'Injury_Description')
                            if (chuthuong.includes(".doc") || chuthuong.includes(".docx") || chuthuong.includes(".pdf") || chuthuong.includes(".jpg") || chuthuong.includes(".jpeg") || chuthuong.includes(".png"))
                                $scope.listfileAC.push($scope.dt);
                            else {
                                $timeout(function () {
                                    Notifications.addMessage({
                                        'status': 'info',
                                        'message': $translate.instant('FileValidation_MSG')
                                    });
                                }, 300);

                                var namefile = {
                                    fname: x
                                };

                                CReportService.DeleteFile(namefile, function (res) {
                                        if (res.Success) {
                                            console.log(res.Success);
                                        }
                                    },
                                    function (error) {
                                        console.log(error);
                                    })
                            }
                        else if (_colName == 'Rp_Description')
                            if (chuthuong.includes(".doc") || chuthuong.includes(".docx") || chuthuong.includes(".pdf") || chuthuong.includes(".jpg") || chuthuong.includes(".jpeg") || chuthuong.includes(".png"))
                                $scope.listfile.push($scope.dt);
                            else {
                                $timeout(function () {
                                    Notifications.addMessage({
                                        'status': 'info',
                                        'message': $translate.instant('FileValidation_MSG')
                                    });
                                }, 300);

                                var namefile = {
                                    fname: x
                                };

                                CReportService.DeleteFile(namefile, function (res) {
                                        if (res.Success) {
                                            console.log(res.Success);
                                        }
                                    },
                                    function (error) {
                                        console.log(error);
                                    })
                            }
                        else
                        if (chuthuong.includes(".jpg") || chuthuong.includes(".jpeg") || chuthuong.includes(".png") || chuthuong.includes(".pdf"))
                            $scope.listfile.push($scope.dt);
                        else {

                            $timeout(function () {
                                Notifications.addMessage({
                                    'status': 'info',
                                    'message': $translate.instant('FileValidation_IMG_MSG')
                                });
                            }, 300);

                            var namefile = {
                                fname: x
                            };

                            CReportService.DeleteFile(namefile, function (res) {
                                    if (res.Success) {
                                        console.log(res.Success);
                                    }
                                },
                                function (error) {
                                    console.log(error);
                                })
                        }
                        $scope.dt = {};



                    })

                })
            }

            /**********************************GRID -UI DEFINITION*********************************************************/

            var colCReport = [

                {
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
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getCReportStatus(row.entity.Rp_Status)}}</span>'

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
                    cellTemplate: '<span class="grid_cell_ct">{{row.entity.DepartmentName}} {{row.entity.Contractor_Name}}</span>'
                },

                {
                    field: 'Rp_Type',
                    minWidth: 120,
                    displayName: $translate.instant('ReportType'),
                    cellTooltip: true,
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getCReportType(row.entity.Rp_Type)}}</span>'
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
                    cellTemplate: '<span class="grid_cell_ct">{{grid.appScope.getCReportLocation(row.entity.Rp_Location)}}</span>'
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
                    cellTemplate: '<span class="grid_cell_ct">{{row.entity.Name}} {{row.entity.Contractor_Victim_Name}}</span>'
                },
                {
                    field: 'Rp_CreatorID',
                    minWidth: 70,
                    displayName: $translate.instant('Creator'),
                    cellTooltip: true
                }

            ];

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


            $scope.getCReportType = function (id) {
                var CReport_type = "";
                if (id == "IC") {
                    CReport_type = $translate.instant("Incident");
                } else {
                    CReport_type = $scope.ACTypelist.find(item => item.id === id).name;
                    CReport_type = $translate.instant(CReport_type);
                }
                return CReport_type;
            }
            //Grid setting mặc định tên 
            $scope.gridOptions = {
                columnDefs: colCReport,
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


            /**************************** FUNCTIONS ************************************************************** */

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
                    $scope.recordIC.submittype = data.Rp_SubmitType;

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
                    $scope.recordAC.submittype = data.Rp_SubmitType;

                    $scope.employees = [];
                    $scope.showEmployeeList(data.Rp_SubDepartmentID);
                    data.AccidentDetail.forEach(element => {
                        var x = {};
                        x.Injury_Description = element.Injury_Description;
                        x.Rp_ID = element.Rp_ID;
                        x.Treatment_Result = element.Treatment_Result;
                        x.Witness_info = element.Witness_info;
                        x.EmployeeID = element.EmployeeID;
                        x.Contractor_Victim_Name = element.Contractor_Victim_Name;
                        x.Contractor_Victim_Sex = element.Contractor_Victim_Sex;
                        x.Contractor_Victim_Age = element.Contractor_Victim_Age;
                        x.Contractor_Name = element.Contractor_Name;
                        x.Contractor_Victim_DateWork = element.Contractor_Victim_DateWork;
                        x.Contractor_Victim_Work = element.Contractor_Victim_Work;
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
                    // $scope.btnFile = false;
                    $scope.btnFile_AC = false;
                } else {
                    // $scope.btnFile = true;
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
                    title: $translate.instant('Update'),
                    action: function () {
                        var resultRows = $scope.gridApi.selection.getSelectedRows(); // lấy dòng đang tick

                        if (resultRows.length == 1) {
                            //UPDATE BÁO CÁO SỰ CỐ
                            if (resultRows[0].Rp_Type == "IC") {

                                $scope.rp_type = '0';

                                $scope.status = 'M'; //Set update Status


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

                                //UPDATE BÁO CÁO TAI NẠN
                            } else {
                                $scope.mySwitch = true; // disable 
                                $scope.status = 'M'; //Set update Status
                                $scope.rp_type = '1';
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
                    title: $translate.instant('InProcess'),
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
                $scope.formVariables = [];
                var historyVariable = [];
                /**Check if user have permission to submit */
                EngineApi.getTcodeLink().get({
                    userid: Auth.username,
                    tcode: $scope.flowkey
                }, function (linkres) {
                    if (linkres.IsSuccess) {
                        $scope.formVariables.push({
                            name: 'Receive_Users',
                            value: $scope.checkList
                        }); //initiator -> Receive_Users
                        historyVariable.push({
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


                    } else alert("You don't have permission!")
                });

                $scope.SubmitAndChangeStatus = function (Rp_ID) {
                    /**Submit to BPMN */
                    CReportService.SubmitBPM($scope.formVariables, historyVariable, '', function (res, message) {
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
            } // fnSavesubmit

            CReportService.CountReport(function (data) {
                $scope.rpCounter = {
                    Safe : data[0].count_safe,
                    Envi : data[0].count_evr,
                    Fire : data[0].count_fire
                }
            }, function (error) {})

        } //function
    ]) // myapp.controller

}) //define