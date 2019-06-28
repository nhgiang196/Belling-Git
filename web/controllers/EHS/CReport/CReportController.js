define(['myapp', 'controllers/EHS/CReport/ACReportDirective', 'controllers/EHS/CReport/ICReportDirective', 'angular'], function (myapp, angular) {
    myapp.controller('CReportController', ['$upload', '$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$timeout',
        function ($upload, $filter, Notifications, Auth, EngineApi, CReportService, InfolistService, $translate, $q, $scope, $timeout) {
            $scope.recordIC = {};
            $scope.recordAC = {};
            $scope.flowkey = 'HW-EHS';
            $scope.onlyOwner = true;
            $scope.mySwitch = false; // bật tắt input Bộ phận trong AC khi sửa

            //----------------------------------------------------------
            $scope.save_msg = function(){
                $timeout( function(){
                    Notifications.addMessage(
                        { 'status': 'information', 
                        'message': $translate.instant('Save_Success_MSG') });
                    }
                ,400);
            }

            $scope.update_msg = function(){  
                $timeout( function(){
                    Notifications.addMessage(
                        { 'status': 'information', 
                        'message': $translate.instant('Update_Success_MSG') });
                }
                ,400);
            }

            $scope.ac_details_msg = function(){
                Notifications.addMessage(
                    { 'status': 'information', 
                    'message': $translate.instant('ACDetails_Msg') });

            }
            //----------------------------------------------------------

            // IC-----------------------------------------------------------------------------
            // btn-file của Đạt---------------------------------------------

            $scope.btnfile = function (id, filename) {
                var filein = document.querySelector("#" + id);
                var filename = document.querySelector("#" + filename);

                filein.click();
            }
            //------------------------------------------------------------------------------------

            // report type combobox
            $scope.typelist = [
                {
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
            $scope.locationlist= InfolistService.Infolist('location');
            // incident type combobox
            $scope.incidentlist= InfolistService.Infolist('incident');
            // AC type combobox
            $scope.ACTypelist= InfolistService.Infolist('ACType');

            // định nghĩa cột trong Grid UI của Incident (sự cố)
            var colIC =
                [
                    {
                        field: 'Rp_ID',
                        minWidth: 30,
                        displayName:  $translate.instant('ReportID'),
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
                        cellTooltip: true
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
                        cellTooltip: true
                    },
                    {
                        field: 'Rp_CreatorID',
                        minWidth: 100,
                        displayName: $translate.instant('Creator'),
                        cellTooltip: true
                    },
                    {
                        field: 'Rp_Status',
                        displayName:  $translate.instant('Status'),
                        width: 100,
                        minWidth: 10,
                        cellTooltip: true,

                    }
                ];

            // định nghĩa cột trong Grid UI của Accident (tai nạn)
            var colAC =
                [
                    {
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
                        cellTooltip: true
                    },
                    {
                        field: 'EmployeeID',
                        minWidth: 140,
                        displayName: $translate.instant('EmployeeID'),
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

            //search information 
            function SearchList() {
                var query = {};
                // query.PageIndex = paginationOptions.pageNumber || '';
                // query.PageSize = paginationOptions.pageSize || '';
                query.startdate = $scope.dateFrom || '';
                query.enddate = $scope.dateTo || '';
                query.Id = $scope.rp_id || '';
                query.Status = $scope.s_status || '';

                // chỉ xem báo cáo của tôi
                if ($scope.onlyOwner == true) {
                    query.uid = Auth.username;
                }
                else query.uid = '';
                return query;
            };

            //search function()
            $scope.Search = function () {
                // show grid ui theo loại báo cáo 
                if ($scope.rp_type.id == "1") {

                    $scope.gridOptions = {
                        columnDefs: colAC
                    }

                    var query = SearchList();
                    CReportService.SearchAC(query, function (data) {
                        data.forEach(
                            function(element){
                                switch (element.Rp_Status) {
                                    case 'N':
                                    element.Rp_Status = $translate.instant($scope.statuslist[0].name);
                                    break;
                                    case 'M':
                                    element.Rp_Status = $translate.instant($scope.statuslist[1].name);
                                    break;
                                    case 'P':
                                    element.Rp_Status = $translate.instant($scope.statuslist[2].name);
                                    break;
                                };

                                switch (element.Rp_Type) {
                                    case 'SA':
                                    element.Rp_Type = $translate.instant($scope.ACTypelist[0].name);
                                    break;
                                    case 'HA':
                                    element.Rp_Type = $translate.instant($scope.ACTypelist[1].name);
                                    break;
                                    case 'MA':
                                    element.Rp_Type = $translate.instant($scope.ACTypelist[2].name);
                                    break;
                                };

                                switch (element.Rp_ImproveSoftware) {
                                    case 'VG':
                                    element.Rp_ImproveSoftware = $translate.instant($scope.evaluatelist[0].name);
                                    break;
                                    case 'G':
                                    element.Rp_ImproveSoftware =$translate.instant($scope.evaluatelist[1].name);
                                    break;
                                    case 'MD':
                                    element.Rp_ImproveSoftware = $translate.instant($scope.evaluatelist[2].name);
                                    break;
                                    case 'B':
                                    element.Rp_ImproveSoftware = $translate.instant($scope.evaluatelist[3].name);
                                    break;
                                    case 'VB':
                                    element.Rp_ImproveSoftware = $translate.instant($scope.evaluatelist[4].name);
                                    break;
                                };

                                switch (element.Rp_ImproveHardware) {
                                    case 'VG':
                                    element.Rp_ImproveHardware = $translate.instant($scope.evaluatelist[0].name);
                                    break;
                                    case 'G':
                                    element.Rp_ImproveHardware = $translate.instant($scope.evaluatelist[1].name);
                                    break;
                                    case 'MD':
                                    element.Rp_ImproveHardware = $translate.instant($scope.evaluatelist[2].name);
                                    break;
                                    case 'B':
                                    element.Rp_ImproveHardware = $translate.instant($scope.evaluatelist[3].name);
                                    break;
                                    case 'VB':
                                    element.Rp_ImproveHardware = $translate.instant($scope.evaluatelist[4].name);
                                    break;
                                };

                                switch (element.Rp_Location) {
                                    case 'DN':
                                    element.Rp_Location = $translate.instant($scope.locationlist[0].name);
                                    break;
                                    case 'HS':
                                    element.Rp_Location = $translate.instant($scope.locationlist[1].name);
                                    break;
                                    case 'O':
                                    element.Rp_Location = $translate.instant($scope.locationlist[2].name);
                                    break;
                                };

                                
                            }
                        );
                        $scope.gridOptions.data = data;

                    }, function (error) {

                    })

                }
                else if ($scope.rp_type.id == "0") {
                    $scope.gridOptions = {
                        columnDefs: colIC
                    }

                    var query = SearchList();
                    CReportService.SearchIC(query, function (data) {
                        data.forEach(
                            function(element){
                                element.Rp_Type = 'Sự cố suýt xảy ra';
                                switch (element.Rp_Status) {
                                    case 'N':
                                    element.Rp_Status = $translate.instant($scope.statuslist[0].name);
                                    break;
                                    case 'M':
                                    element.Rp_Status = $translate.instant($scope.statuslist[1].name);
                                    break;
                                    case 'P':
                                    element.Rp_Status = $translate.instant($scope.statuslist[2].name);
                                    break;
                                };

                                switch (element.RpIC_Evaluate) {
                                    case 'VG':
                                    element.RpIC_Evaluate = $translate.instant($scope.evaluatelist[0].name);
                                    break;
                                    case 'G':
                                    element.RpIC_Evaluate = $translate.instant($scope.evaluatelist[1].name);
                                    break;
                                    case 'MD':
                                    element.RpIC_Evaluate = $translate.instant($scope.evaluatelist[2].name);
                                    break;
                                    case 'B':
                                    element.RpIC_Evaluate = $translate.instant($scope.evaluatelist[3].name);
                                    break;
                                    case 'VB':
                                    element.RpIC_Evaluate = $translate.instant($scope.evaluatelist[4].name);
                                    break;
                                };

                                switch (element.Rp_Location) {
                                    case 'DN':
                                    element.Rp_Location = $translate.instant($scope.locationlist[0].name);
                                    break;
                                    case 'HS':
                                    element.Rp_Location = $translate.instant($scope.locationlist[1].name);
                                    break;
                                    case 'O':
                                    element.Rp_Location = $translate.instant($scope.locationlist[2].name);
                                        break;
                                };

                                switch (element.RpIC_IncidentType) {
                                    case 'ind1':
                                        element.RpIC_IncidentType = $scope.incidentlist[0].name;
                                        break;
                                    case 'ind2':
                                        element.RpIC_IncidentType = $scope.incidentlist[1].name;
                                        break;
                                };
                            }
                        );
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
                        }
                        else {
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
                if (value == 'Bên ngoài xưởng' || value == "Outside the factory") {
                    $scope.btnFile = false;
                    $scope.btnFile_AC = false;
                } else {
                    $scope.btnFile = true;
                    $scope.btnFile_AC = true;
                }
            }

            // delete
            function deleteById(id) {
                var data = { Rp_ID: id };
                CReportService.Delete(data, function (res) {
                    if (res.Success) {
                        $scope.Search();
                        $timeout(function(){
                            Notifications.addMessage(
                                { 'status': 'information', 
                                'message': $translate.instant('Delete_Succeed_Msg') })
                            },400);
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
            var gridMenu =
                [
                    {
                        title:$translate.instant('CreateIC'),
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
                        title:  $translate.instant('Update'),
                        action: function () {
                            var resultRows = $scope.gridApi.selection.getSelectedRows(); // lấy dòng đang tick
                            //UPDATE BÁO CÁO SỰ CỐ
                            if ($scope.rp_type.id == "0") {
                                $scope.status = 'M'; //Set update Status
                                if (resultRows.length == 1) {

                                    if((resultRows[0].Rp_Status != "P") && (resultRows[0].Rp_CreatorID == Auth.username)){
                                        disableFileLocation(resultRows[0].Rp_Location); // bật tắt disable nút file chỗ địa điểm  
                                        loadICDetail(resultRows[0].Rp_ID);
                                            $('#my-modal').modal('show');
                                    }
                                    else{
                                        Notifications.addError({
                                            'status': 'error',
                                            'message': $translate.instant('Update_onlyowner_MSG')
                                        });
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

                                    if(resultRows[0].Rp_Status != 'P' && resultRows[0].Rp_CreatorID == Auth.username){
                                        disableFileLocation(resultRows[0].Rp_Location); // bật tắt disable nút file chỗ địa điểm  
                                        loadACDetail(resultRows[0].Rp_ID);
                                            $('#myModal').modal('show');
                                    }
                                    else {
                                        Notifications.addError({
                                            'status': 'error',
                                            'message': $translate.instant('Update_onlyowner_MSG')
                                        });
                                    }


                                }
                                else {
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
                        title: '🖨️ '+$translate.instant('PrintReport'),
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
                        title: $translate.instant('Status_On_Off'),
                        action: function () {
                            var resultRows = $scope.gridApi.selection.getSelectedRows();
                            if (resultRows.length == 1)
                            {   
                                if(resultRows[0].Status != 'P' && resultRows[0].Rp_CreatorID == Auth.username){
                                if (confirm($translate.instant('Delete_IS_MSG') + ':' + resultRows[0].Rp_ID)) {
                                    deleteById(resultRows[0].Rp_ID);
                                    $scope.Search();
                                }
                                
                            }else {
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
                        order: 5

                    }
                ];

            //Choose SubDepartment to show Employees 
            $scope.showEmployeeList = function (dept_id) {
                $scope.gd = {};
                $scope.employees=[];
                if (dept_id == null || dept_id == '') return;
                CReportService.GetEmployee({ DepartmentID: dept_id }, function (res) {
                    if (res.length > 0) {
                        $scope.listEmployee = res;
                    }
                    else $scope.listEmployee = [];
                })
                $scope.listEmployee = [];
            };
        }//function
    ]) // myapp.controller

}) //define
