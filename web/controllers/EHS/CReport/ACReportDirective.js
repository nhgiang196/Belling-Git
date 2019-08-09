define(['app'], function (app) {
    app.directive('createAcReport', ['CReportService', 'InfolistService', 'Auth', '$timeout', 'Notifications', '$translate', '$upload',
        function (CReportService, InfolistService, Auth, $timeout, Notifications, $translate, $upload, ) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    // xóa file tình hình bị thương khỏi QCFiles 
                    $scope.ACTypelist = InfolistService.Infolist('ACType');
                    $scope.listfileAC = []; // chứa file tình hình bị thương khi upload  
                    $scope.btnFile_AC = false;
                    $scope.injury = []; //list for showing in table injuries people


                    /**
                     *reset data function
                     */
                    $scope.resetAC = function () {
                        $scope.AC_Department_Disable = false;
                        $scope.listfileAC = [];
                        $scope.recordAC = {};
                        $scope.gd = {};
                        $scope.employees = [];
                        $scope.Search();
                        $scope.listfile = []; // default list file (not accident detail)
                        $scope.injury = []; //list for showing in table injuries people
                        $scope.ID_AC = ""; //= res.data ???
                        // $scope.btnFile_AC = true;
                        $scope.listfile_loc_ac = false;
                        $scope.listfile_process_ac = false;
                        $scope.otherInfomation = false;
                    };
                    $scope.showEmployeeName = function (emp_id) {
                        if ($scope.employees)
                            $scope.employees.forEach(x => {
                                if (x.EmployeeID == emp_id) {
                                    $scope.emp_name = x.Contractor_Victim_Name;
                                }
                            })
                        if ($scope.listEmployee)
                            $scope.listEmployee.forEach(x => {
                                if (x.EmployeeID == emp_id) {
                                    $scope.emp_name = x.Name;
                                }
                            })
                        return $scope.emp_name;
                    };
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
                    // Lấy nạn nhân trong list employees để chỉnh sửa
                    $scope.getEmployee = function (index) {
                        $scope.gd.EmployeeID = $scope.employees[index].EmployeeID;
                        $scope.gd.Injury_Description = $scope.employees[index].Injury_Description;
                        $scope.gd.Treatment_Result = $scope.employees[index].Treatment_Result;
                        $scope.gd.Witness_info = $scope.employees[index].Witness_info;
                        $scope.gd.Contractor_Victim_Name = $scope.employees[index].Contractor_Victim_Name;
                        $scope.gd.Contractor_Victim_Sex = $scope.employees[index].Contractor_Victim_Sex;
                        $scope.gd.Contractor_Victim_Age = $scope.employees[index].Contractor_Victim_Age;
                        $scope.gd.Contractor_Name = $scope.employees[index].Contractor_Name;
                        $scope.gd.Contractor_Victim_DateWork = $scope.employees[index].Contractor_Victim_DateWork;
                        $scope.gd.Contractor_Victim_Work = $scope.employees[index].Contractor_Victim_Work;
                        for (i = $scope.injury.length - 1; i >= 0; i--) {
                            if ($scope.injury[i].empID == $scope.gd.EmployeeID) {
                                $scope.listfileAC.push($scope.injury[i]);
                                $scope.injury.splice(i, 1);
                            }
                        }
                        $scope.employees.splice(index, 1);
                    };
                    // Lấy dữ liệu lên modalAC để chỉnh sửa
                    $scope.loadACDetail = function (id) {
                        CReportService.FindByID({
                            Rp_ID: id
                        }, function (data) {
                            $scope.recordAC.rp_id = data.Rp_ID;
                            // $scope.recordAC.ac_subdepartment = data.Rp_SubDepartmentID;
                            $scope.recordAC.ac_subdepartment = data.Rp_DepartmentID;
                            $scope.otherInfomation = data.Rp_SubDepartmentID == 'Other' ? true : false;
                            $scope.recordAC.ac_type = data.Rp_Type;
                            $scope.recordAC.ac_datetime = data.Rp_DateTime;
                            $scope.recordAC.ac_location = data.Rp_Location;
                            $scope.recordAC.ac_locationDetail = data.Rp_LocationDetail;
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
                        }, function (error) {})
                    };
                    //Add employee in param table (AccidentDetail)
                    $scope.addEmployee = function () {
                        if ($scope.gd != null || $scope.gd != {}) {
                            $scope.employees.forEach(x => {
                                if ($scope.gd.EmployeeID == x.EmployeeID) {
                                    $timeout(function () {
                                        Notifications.addMessage({
                                            'status': 'error',
                                            'message': $translate.instant('SameEmployee')
                                        });
                                    }, 300);
                                    return;
                                }
                            })
                            $scope.gd.Rp_ID = $scope.recordAC.rp_id || '';
                            if ($scope.listfileAC.length > 0) {
                                $scope.listfileAC.forEach(x => {
                                    var y = {};
                                    y.name = x.name;
                                    y.col = x.col;
                                    y.empID = $scope.gd.EmployeeID;
                                    $scope.injury.push(y);
                                })
                            }
                            $scope.employees.push($scope.gd);
                            $scope.gd = {};
                            $scope.listfileAC = [];
                        }
                    };
                    // delete nạn nhân trong list employees
                    $scope.deleteEmployee = function (index) {
                        $scope.employees.splice(index, 1);
                    };

                    function saveInitDataAC() {
                        var note = {};
                        $scope.count = 0;
                        note.Rp_ID = $scope.recordAC.rp_id || '';
                        note.Rp_Date = $scope.recordAC.date || '';
                        note.Rp_Stamp = $scope.recordAC.stamp || '';
                        note.Rp_Status = $scope.recordAC.status || '';
                        note.Rp_SubDepartmentID = $scope.otherInfomation ? 'Other' : $scope.recordAC.ac_subdepartment;
                        note.Rp_DepartmentID = $scope.recordAC.ac_subdepartment;
                        note.Rp_DateTime = $scope.recordAC.ac_datetime;
                        note.Rp_Location = $scope.recordAC.ac_location;
                        note.Rp_LocationDetail = $scope.recordAC.ac_locationDetail;
                        note.Rp_Type = $scope.recordAC.ac_type;
                        note.Rp_PreventMeasure = $scope.recordAC.ac_prevent;
                        note.RpAC_ImproveSoftware = $scope.recordAC.ac_improvesoft;
                        note.RpAC_ImproveHardware = $scope.recordAC.ac_improvehard;
                        note.RpAC_DateComplete = $scope.recordAC.ac_datecomp;
                        note.RpAC_ResultSoftware = $scope.recordAC.ac_resultsoft;
                        note.RpAC_ResultHardware = $scope.recordAC.ac_resulthard;
                        note.Rp_SubmitType = $scope.recordAC.submittype;
                        note.Rp_CreatorID = Auth.username;
                        note.AccidentDetail = $scope.employees;
                        var lsFile = [];
                        if ($scope.listfile.length > 0) {
                            $scope.count++;
                            $scope.listfile.forEach(element => {
                                var f = {};
                                f.File_ID = element.name;
                                f.ColumnName = element.col;
                                f.Rp_ID = $scope.recordAC.rp_id || '';
                                lsFile.push(f);
                            })
                        }
                        if ($scope.injury.length > 0) {
                            $scope.injury.forEach(element => {
                                var f = {};
                                f.File_ID = element.name;
                                f.ColumnName = element.col;
                                f.Profile_ID = element.empID;
                                f.Rp_ID = $scope.recordAC.rp_id || '';
                                lsFile.push(f);
                                f = {};
                            })
                        }
                        note.FileAttached = lsFile; // Add File vào csdl
                        return note;
                    }

                    function updateByID_AC(data) { // Update status by updateByID
                        CReportService.Update(data, function (res) {
                                if (res.Success) {
                                    if ($scope.btnSub) {
                                        $('#myModal').modal('hide');
                                        $scope.submit_success_msg();
                                        $scope.Search();
                                        $scope.btnSub = false;
                                    } else {
                                        $('#myModal').modal('hide');
                                        $scope.update_msg();
                                        $scope.Search();
                                    }
                                } else {
                                    $scope.update_error_msg();
                                }
                            },
                            function (error) {
                                $scope.update_error_msg();
                            })
                    }
                    /**
                     * Save 
                     */
                    function SaveAC(data) { //save data
                        CReportService.Create(data, function (res) {
                            console.log(res)
                            if (res.Success) {
                                if ($scope.btnSub) {
                                    $scope.ID_AC = res.Data;
                                    $scope.formVariables.push({
                                        name: 'Rp_ID',
                                        value: $scope.ID_AC //chosen
                                    });
                                    $scope.SubmitAndChangeStatus($scope.ID_AC);
                                    $scope.btnSub = false;
                                    $('#myModal').modal('hide');
                                    $scope.rp_Submittype = $scope.SubmitTypelist.find(item => item.id === data.Rp_SubmitType);
                                } else {
                                    $('#myModal').modal('hide');
                                    $scope.rp_Submittype = $scope.SubmitTypelist.find(item => item.id === data.Rp_SubmitType);
                                    $scope.save_msg();
                                    $scope.Search();
                                }
                                $scope.resetAC();
                            } else {
                                $scope.save_error_msg();
                            }
                        }, function (error) {
                            $scope.save_error_msg();
                        })
                    }
                    $scope.SaveACReport = function () { //main submitting /saving function
                        var nofile = false;
                        if ($scope.employees.length != 0) {
                            var note = saveInitDataAC();
                            if ($scope.count == 0 && $scope.recordAC.ac_location == "O") {
                                $scope.nofileLoc();
                                nofile = true;
                            }
                            if (nofile) {
                                nofile = false;
                                return;
                            } else {
                                var status = $scope.status;
                                switch (status) {
                                    case 'N':
                                        SaveAC(note);
                                        
                                        break;
                                    case 'M':
                                        note.Rp_Status = 'D';
                                        updateByID_AC(note);
                                        break;
                                    case 'MP':
                                        note.Rp_Status = 'P';
                                        updateByID_AC(note);
                                        break;
                                    case 'SM':
                                        note.Rp_Status = 'SM';
                                        $scope.btnSub = true;
                                        updateByID_AC(note);
                                        break;
                                }
                            }
                        } else {
                            Notifications.addMessage({
                                'status': 'information',
                                'message': $translate.instant('ACDetails_Msg')
                            });
                        }
                    };
                    $scope.emp_name = "";
                    //show tên nhân viên theo mã nhân viên
                    $scope.removeFileInjury = function (index) {
                        var namefile = {
                            fname: $scope.listfileAC[index].name
                        };
                        $scope.listfileAC.splice(index, 1);
                        CReportService.DeleteFile(namefile, function (res) {
                                if (res.Success) {
                                    console.log(res.Success);
                                }
                            },
                            function (error) {
                                console.log(error);
                            })
                    }
                    //Choose SubDepartment to show Employees 
                },
                templateUrl: './forms/EHS/CReport/createACReport.html'
            }
        }
    ]);
});