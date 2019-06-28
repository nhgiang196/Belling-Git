define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createAcReport', ['$upload', 'CReportService', 'Auth', '$q',
        function ($upload, CReportService, Auth, $q) {
            return {
                restrict: 'E', //?
                controller: function ($scope) {
                    $scope.flowkey = 'HW-User'; // ??
                    $scope.username = Auth.username;
                    formVariables = $scope.formVariables = []; //???
                    historyVariable = $scope.historyVariable = []; //????

                    $scope.listfileAC = []; // chứa file tình hình bị thương khi upload  


                    // xóa file tình hình bị thương khỏi QCFiles 
                    $scope.removeFileInjury = function (index) {
                        var namefile = {
                            fname: $scope.listfileAC[index].name
                        };

                        $scope.listfileAC.splice(index, 1);

                        CReportService.DeleteFile(namefile, function (res) {
                            if (res.Success) {

                                Notifications.addMessage({ 'status': 'information', 'message': $translate.instant('Delete_Success_MSG') });

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
                    }

                    // Lấy nạn nhân trong list employees để chỉnh sửa
                    $scope.getEmployee = function (index) {
                        $scope.gd.EmployeeID = $scope.employees[index].EmployeeID;
                        $scope.gd.Injury_Description = $scope.employees[index].Injury_Description;
                        $scope.gd.Treatment_Result = $scope.employees[index].Treatment_Result;
                        $scope.gd.Witness_info = $scope.employees[index].Witness_info;

                        for (i = $scope.injury.length - 1; i >= 0; i--) {
                            if ($scope.injury[i].empID == $scope.gd.EmployeeID) {
                                $scope.listfileAC.push($scope.injury[i]);
                                $scope.injury.splice(i, 1);
                            }
                        }

                        $scope.employees.splice(index, 1);
                    };

                    //Add employee in param table (AccidentDetail)
                    $scope.gd = {}; // thông tin cụ thể của 1 nhân viên
                    $scope.employees = []; // list chứa nhân viên

                    $scope.y = {};
                    $scope.injury = []; // chứa tất cả file về tình hình bị thương của tất cả nạn nhân trong một tai nạn => dùng để add vào csdl

                    var sameID = false;
                    $scope.addEmployee = function () {
                        if ($scope.gd != null || $scope.gd != {}) {
                            $scope.employees.forEach(x => {
                                if ($scope.gd.EmployeeID == x.EmployeeID) {
                                    alert('trùng nhân viên');
                                    sameID = true;
                                }
                            })

                            if (sameID){
                                sameID = false;
                                return;
                            }
                            else {
                                
                                $scope.gd.Rp_ID = $scope.recordAC.rp_id || '';

                                if ($scope.listfileAC.length > 0) {
                                    $scope.listfileAC.forEach(x => {
                                        $scope.y.name = x.name;
                                        $scope.y.col = x.col;
                                        $scope.y.empID = $scope.gd.EmployeeID;
                                        $scope.injury.push($scope.y);
                                        $scope.y = {};
                                    })
                                }

                                $scope.employees.push($scope.gd);
                                $scope.gd = {};
                                $scope.listfileAC = [];
                            }
                        }
                    };

                    // delete nạn nhân trong list employees
                    $scope.deleteEmployee = function (index) {
                        $scope.employees.splice(index, 1);
                    };

                    function saveInitDataAC() {
                        var note = {};
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

                        note.Rp_CreatorID = Auth.username;

                        note.AccidentDetail = $scope.employees;

                        $scope.lsFile = [];
                        if ($scope.listfile.length > 0) {
                            $scope.listfile.forEach(element => {
                                $scope.f.File_ID = element.name;
                                $scope.f.ColumnName = element.col;
                                $scope.f.Rp_ID = $scope.recordAC.rp_id || '';
                                $scope.lsFile.push($scope.f);
                                $scope.f = {};
                            })
                        }

                        if ($scope.injury.length > 0) {
                            $scope.injury.forEach(element => {
                                $scope.f.File_ID = element.name;
                                $scope.f.ColumnName = element.col;
                                $scope.f.Profile_ID = element.empID;
                                $scope.f.Rp_ID = $scope.recordAC.rp_id || '';
                                $scope.lsFile.push($scope.f);
                                $scope.f = {};
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
                                $scope.Search();
                                $('#myModal').modal('hide');
                                $('#messageModal').modal('hide');
                                $('#nextModal').modal('hide');
                                $scope.update_msg();
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
                    }

                    /**
                     * Save 
                     */
                    function SaveAC(data) {
                        CReportService.Create(data, function (res) {
                            console.log(res)
                            if (res.Success) {
                                $scope.Search();
                                $('#myModal').modal('hide');
                                $('#messageModal').modal('hide');
                                $('#nextModal').modal('hide');
                                $scope.save_msg();
                            }
                            else {
                                Notifications.addError({ 'status': 'error', 'message': $translate.instant('saveError') + res.Message });
                            }
                        }, function (error) {
                            Notifications.addError({ 'status': 'error', 'message': $translate.instant('saveError') + error });
                        })

                    }


                    /**
                     * save submit 
                     */
                    $scope.saveSubmitAC = function () {
                        if ($scope.employees.length != 0) {
                            $scope.mySwitch = false;
                            var note = saveInitDataAC();
                            var status = $scope.status;
                            switch (status) {
                                case 'N':
                                    SaveAC(note);
                                    $scope.resetAC();
                                    break;
                                case 'M':
                                    updateByID_AC(note);
                                    break;
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
                        $scope.recordAC = {};
                        $scope.gd = {};
                        $scope.employees = [];
                        $scope.Search();
                        $scope.listfile = [];
                        $scope.lsFile = []; 
                        $scope.injury = []; 
                    };
                },

                templateUrl: './forms/EHS/CReport/createACReport.html'
            }
        }
    ]);
});