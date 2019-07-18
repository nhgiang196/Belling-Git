define(['app'], function (app) {
    app.directive('createIcReport', ['CReportService', 'Auth',
        function (CReportService, Auth) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    var lang = window.localStorage.lang;
                    $scope.btnFile = false;
                    $scope.btnFile_AC = true;

                    // $scope.showBtnFile = function () {
                    //     if ($scope.recordIC.icLocation == 'O' || $scope.recordAC.ac_location == 'O') {
                    //         $scope.btnFile = false;
                    //         $scope.btnFile_AC = false;

                    //     } else {
                    //         $scope.btnFile = true;
                    //         $scope.btnFile_AC = true;
                    //     }
                    // }


                    // xóa file khỏi QCFiles 
                    $scope.removeFile = function (index) {
                        var namefile = {
                            fname: $scope.listfile[index].name
                        };

                        $scope.listfile.splice(index, 1);

                        CReportService.DeleteFile(namefile, function (res) {
                                if (res.Success) {
                                    console.log(res.Success);
                                }
                            },
                            function (error) {
                                console.log(error);
                            })
                    }

                    // GetBasic ------------ USE FOR BOTH REPORT
                    var subdepartment = {
                        TableName: "Department",
                        Lang: lang || 'EN'
                    };
                    var centerdepartment = {
                        TableName: "CenterDepartment",
                        Lang: lang || 'EN'
                    };
                    //--CenterDepartment----
                    CReportService.GetBasic(centerdepartment, function (data) {

                        $scope.center_dpm = data;
                        $scope.listFactory = data;
                    }, function (error) {

                    })

                    //--SubDepartment------ USE FOR BOTH REPORT
                    CReportService.GetBasic(subdepartment, function (data) {
                        $scope.sub_dpm = data;
                        $scope.deptDefault = {};
                        var employeeid = {
                            emp_id: Auth.username
                        };
                        /** Get user's departments (private) */
                        CReportService.GetDataDepartment(employeeid, function (data) {
                            $scope.sub_dpm.forEach(x => {
                                if (data[0].DepartmentID == x.CostCenter) {
                                    $scope.deptDefault = x;
                                    
                                    $scope.recordIC.ic_SubDeparmentid = x.CostCenter; /// WHy??? =.=! 
                                    $scope.showDeptInIC = x.CostCenter + " - " + x.Specification; //Department
                                    $scope.CostCenter = x.CostCenter;
                                    var dept_id = $scope.recordIC.ic_SubDeparmentid
                                    if (dept_id == null || dept_id == '') return;

                                    if (dept_id.length > 3)
                                        var basodau = dept_id.slice(0, 3);
                                    else basodau = dept_id;

                                    $scope.center_dpm.forEach(x => {
                                        if (x.CostCenter == basodau) {
                                            $scope.recordIC.ic_departmentid = x.CostCenter; // WHy??? =.=! 
                                            $scope.showFactoryInIC = x.Specification;
                                        }
                                    })


                                }
                            });
                            console.log('subdepartment', $scope.recordIC.ic_SubDeparmentid);

                        }, function (error) {

                        })
                    }, function (error) {

                    })
                    /**
                     * Init Data to save
                     */
                    var count = 0;

                    function saveInitDataIC() {
                        var note = {};
                        count = 0;

                        note.Rp_ID = $scope.recordIC.rp_id || '';

                        $scope.lsFile = [];
                        if ($scope.listfile.length > 0) {
                            $scope.listfile.forEach(element => {

                                if (element.col == "Rp_Location")
                                    count++;

                                var f = {};
                                f.File_ID = element.name;
                                f.ColumnName = element.col;
                                f.Rp_ID = $scope.recordIC.rp_id || '';
                                $scope.lsFile.push(f);
                            })
                        }
                        note.Rp_Status = $scope.recordIC.status || '';
                        note.Rp_Type = 'IC';
                        note.RpIC_Group = $scope.recordIC.icGroup || '';;
                        note.Rp_DepartmentID = $scope.CostCenter.slice(0,3);
                        note.Rp_SubDepartmentID = $scope.CostCenter;
                        note.Rp_DateTime = $scope.recordIC.icDatetime;
                        note.Rp_Location = $scope.recordIC.icLocation;
                        note.Rp_PreventMeasure = $scope.recordIC.icPrevent;
                        note.RpIC_Description = $scope.recordIC.icProcess;
                        note.RpIC_DirectReason = $scope.recordIC.icDr_reason;
                        note.RpIC_IndirectReason = $scope.recordIC.icIdr_reason;
                        note.RpIC_BasicReason = $scope.recordIC.icBasic;
                        note.RpIC_Damage = $scope.recordIC.icResult;
                        note.RpIC_Process = $scope.recordIC.icImprove;
                        note.RpIC_Evaluate = $scope.recordIC.icEvaluate;
                        note.RpIC_IncidentType = $scope.recordIC.icType;
                        note.Rp_SubmitType = $scope.recordIC.submittype;

                        note.RpIC_Affect = $scope.recordIC.icAffect;
                        note.RpIC_TimeNotif = $scope.recordIC.TimeNotif;
                        note.RpIC_NotifPerson = $scope.recordIC.ICNotifPersion;
                        note.RpIC_ReceivePerson = $scope.recordIC.ICReceivePerson;

                        note.Rp_Date = $scope.recordIC.date || '';
                        note.Rp_Stamp = $scope.recordIC.stamp || '';
                        note.Rp_CreatorID = Auth.username;
                        note.FileAttached = $scope.lsFile; //File list
                        return note;
                    }

                    function SaveIC(data) {
                        CReportService.Create(data, function (res) {
                            console.log(res)
                            if (res.Success) {
                                if ($scope.btnSub) {
                                    $scope.ID_IC = res.Data;
                                    $scope.formVariables.push({
                                        name: 'Rp_ID',
                                        value: $scope.ID_IC //??
                                    });
                                    S
                                    $scope.SubmitAndChangeStatus($scope.ID_IC);
                                    $scope.btnSub = false;
                                    $('#my-modal').modal('hide');
                                    $scope.rp_Submittype = $scope.SubmitTypelist.find(item => item.id === data.Rp_SubmitType);
                                } else {
                                    $('#my-modal').modal('hide');
                                    $scope.save_msg();
                                    $scope.rp_Submittype = $scope.SubmitTypelist.find(item => item.id === data.Rp_SubmitType);
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
                     * Update status by updateByID
                     */
                    function updateByID_IC(data) {
                        CReportService.Update(data, function (res) {
                                if (res.Success) {
                                    if ($scope.btnSub) { //??
                                        $('#my-modal').modal('hide');
                                        $scope.submit_success_msg();
                                        $scope.Search();
                                        $scope.btnSub = false;
                                    } else {
                                        $('#my-modal').modal('hide');
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

                    var nofile = false;

                    $scope.SaveICReport = function () {
                        
                        var note = saveInitDataIC();
                        if (count == 0 && $scope.recordIC.icLocation == "O") {
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
                                    SaveIC(note);
                                    $scope.resetIC();
                                    break;
                                case 'M':
                                    note.Rp_Status = 'P';
                                    updateByID_IC(note);
                                    break;
                                case 'SM':
                                    note.Rp_Status = 'SM';
                                    $scope.btnSub = true;
                                    updateByID_IC(note);
                                    break;
                            }
                        }

                    };

                    /*
                     *reset data function
                     */
                    $scope.resetIC = function () {
                        $scope.recordIC = {};
                        $scope.listfile = [];
                        $scope.lsFile = [];
                        $scope.Search();
                        $scope.ID_IC = "";
                        // $scope.btnFile = true;
                        $scope.listfile_loc_ic = false;
                        $scope.listfile_process_ic = false;
                    }

                },
                templateUrl: './forms/EHS/CReport/createICReport.html'

            }
        }
    ]);
});