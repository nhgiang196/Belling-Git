define(['app'], function (app) {
    app.directive('createAcReport', ['CReportService', 'Auth',
        function (CReportService, Auth) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    // xóa file tình hình bị thương khỏi QCFiles 

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
                    //Add employee in param table (AccidentDetail)
                    $scope.addEmployee = function () {
                        if ($scope.gd != null || $scope.gd != {}) {
                            $scope.employees.forEach(x => {
                                if ($scope.gd.EmployeeID == x.EmployeeID) {
                                    $scope.same_employee_msg();
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

                    var count = 0;

                    function saveInitDataAC() {
                        var note = {};
                        count = 0;
                        note.Rp_ID = $scope.recordAC.rp_id || '';
                        note.Rp_Date = $scope.recordAC.date || '';
                        note.Rp_Stamp = $scope.recordAC.stamp || '';
                        note.Rp_Status = $scope.recordAC.status || '';
                        note.Rp_SubDepartmentID = $scope.recordAC.ac_subdepartment;
                        note.Rp_DateTime = $scope.recordAC.ac_datetime;
                        note.Rp_Location = $scope.recordAC.ac_location;
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

                        $scope.lsFile = [];
                        if ($scope.listfile.length > 0) {
                            count++;

                            $scope.listfile.forEach(element => {
                                var f = {};
                                f.File_ID = element.name;
                                f.ColumnName = element.col;
                                f.Rp_ID = $scope.recordAC.rp_id || '';
                                $scope.lsFile.push(f);
                            })
                        }

                        if ($scope.injury.length > 0) {
                            $scope.injury.forEach(element => {
                                var f = {};
                                f.File_ID = element.name;
                                f.ColumnName = element.col;
                                f.Profile_ID = element.empID;
                                f.Rp_ID = $scope.recordAC.rp_id || '';
                                $scope.lsFile.push(f);
                                f = {};
                            })
                        }

                        note.FileAttached = $scope.lsFile; // Add File vào csdl

                        return note;
                    }

                    /**
                     * Update status by updateByID
                     */
                    function updateByID_AC(data) {
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
                    function SaveAC(data) {
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
                            } else {
                                $scope.save_error_msg();
                            }
                        }, function (error) {
                            $scope.save_error_msg();
                        })

                    }


                    /**
                     * save submit 
                     */

                    var nofile = false;
                    $scope.SaveACReport = function () {
                        if ($scope.employees.length != 0) {
                            $scope.mySwitch = false;
                            var note = saveInitDataAC();
                            if (count == 0 && $scope.recordAC.ac_location == "O") {
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
                                        $scope.resetAC();
                                        break;
                                    case 'M':
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
                            $scope.ac_details_msg();
                        }

                    };

                    /**
                     *reset data function
                     */
                    $scope.resetAC = function () {
                        $scope.mySwitch = false;
                        $scope.listfileAC = [];
                        $scope.recordAC = {};
                        $scope.gd = {};
                        $scope.employees = [];
                        $scope.Search();
                        $scope.listfile = [];
                        $scope.lsFile = [];
                        $scope.injury = [];
                        $scope.ID_AC = "";
                        $scope.btnFile_AC = true;
                        $scope.listfile_loc_ac = false;
                        $scope.listfile_process_ac = false;
                    };

                    //show tên nhân viên theo mã nhân viên
                    $scope.showEmployeeName = function (emp_id) {
                        var emp_name = '';
                        debugger;

                        // $scope.listEmployee.forEach(x => {
                        //     if (x.EmployeeID == emp_id && x.Name != null)
                        //         return x.Name;

                        // })

                        // $scope.employees.forEach(x => {
                        //     if (x.EmployeeID == emp_id && x.Contractor_Victim_Name != null)
                        //         return x.Contractor_Victim_Name;
                        // })

                        return emp_name;
                    };

                },

                templateUrl: './forms/EHS/CReport/createACReport.html'
            }
        }
    ]);
});