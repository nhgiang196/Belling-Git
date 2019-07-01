
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createIcReport', ['$upload', 'CReportService', 'Auth', '$q', 'Notifications', '$translate',
        function ($upload, CReportService, Auth, Notifications, $translate, $q) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    var lang = window.localStorage.lang;
                    $scope.flowkey = 'HW01';
                    $scope.username = Auth.username;
                    // formVariables = $scope.formVariables = [];
                    // historyVariable = $scope.historyVariable = [];
                    $scope.btnFile = true;
                    $scope.btnFile_AC = true;
                   
                    //showBtnFile USE FOR BOTH REPORT
                    $scope.showBtnFile = function () {
                        if ($scope.recordIC.icLocation == 'O' || $scope.recordAC.ac_location == 'O') {
                            $scope.btnFile = false;
                            $scope.btnFile_AC = false;
                         
                        } else {
                            $scope.btnFile = true;
                            $scope.btnFile_AC = true;                        }
                    }

                    $scope.listfile = [];
                    $scope.dt = {};

                    $scope.uploadFile = function ($files, colName) {
                        $upload.upload({
                            url: '/Waste/files/Upload',
                            method: "POST",
                            file: $files
                        }).progress(function (evt) {

                        }).then(function (res) {

                            res.data.forEach(x => {
                                $scope.dt.name = x;
                                $scope.dt.col = colName;
                                $scope.listfile.push($scope.dt);
                                $scope.dt = {};
                            })


                        })
                    }

                    // xóa file khỏi QCFiles 
                    $scope.removeFile = function (index) {
                        var namefile = {
                            fname: $scope.listfile[index].name
                        };

                        $scope.listfile.splice(index, 1);

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

                    // GetBasic ------------ USE FOR BOTH REPORT
                    var subdepartment = { TableName: "Department", Lang: lang };
                    var centerdepartment = { TableName: "CenterDepartment", Lang: lang };
                    //--CenterDepartment----
                    CReportService.GetBasic(centerdepartment, function (data) {
                        $scope.center_dpm = data;
                        $scope.listFactory = data;
                    }, function (error) {

                    })

                    //--SubDepartment------ USE FOR BOTH REPORT
                    CReportService.GetBasic(subdepartment, function (data) {
                        $scope.sub_dpm = data;
                    }, function (error) {

                    })

                    // $scope.listDept = [];
                    // $scope.showDepartmentList = function (center_id) {
                    //     if (center_id == null || center_id == '') return;
                    //     var biennaodo = { center: center_id, Lang: lang };
                    //     CReportService.GetDataDepartment(biennaodo, function (res) {
                    //         $scope.listDept = res;
                    //     })
                    // };

                    $scope.showFactoryByDept = function (dept_id) {
                        if (dept_id == null || dept_id == '') return;

                        if (dept_id.length > 3)
                            var basodau = dept_id.slice(0, 3);
                        else basodau = dept_id;

                        $scope.center_dpm.forEach(x => {
                            if (x.CostCenter == basodau) {
                                $scope.recordIC.ic_departmentid = x.CostCenter;
                            }
                        })
                    };

                    /**
                     * Init Data to save
                     */
                    $scope.f = {}; // thông tin cụ thể của 1 file
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

                                $scope.f.File_ID = element.name;
                                $scope.f.ColumnName = element.col;
                                $scope.f.Rp_ID = $scope.recordIC.rp_id || '';
                                $scope.lsFile.push($scope.f);
                                $scope.f = {};
                            })
                        }

                        note.Rp_Status = $scope.recordIC.status || '';
                        note.Rp_Type = 'IC';
                        note.RpIC_Group = $scope.recordIC.icGroup || '';;
                        note.Rp_DepartmentID = $scope.recordIC.ic_departmentid;
                        note.Rp_SubDepartmentID = $scope.recordIC.ic_SubDeparmentid;
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
                        note.Rp_Date = $scope.recordIC.date || '';
                        note.Rp_Stamp = $scope.recordIC.stamp || '';
                        note.Rp_CreatorID = Auth.username;

                        note.FileAttached = $scope.lsFile; // Add File vào csdl

                        return note;
                    }

                    function SaveIC(data) {
                        CReportService.Create(data, function (res) {
                            console.log(res)
                            if (res.Success) {
                                $scope.Search();
                                $('#my-modal').modal('hide');
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
                   * Update status by updateByID
                   */
                    function updateByID_IC(data) {
                        CReportService.Update(data, function (res) {
                            if (res.Success) {
                                $('#my-modal').modal('hide');
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

                    var nofile = false;

                    $scope.saveSubmitIC = function () {
                        var note = saveInitDataIC();
                        if (count == 0 && $scope.recordIC.icLocation == "O") {
                            $scope.nofileLoc();
                            nofile = true;
                        }

                        if (nofile) {
                            nofile = false;
                            return;
                        }
                        else {
                            var status = $scope.status;
                            switch (status) {
                                case 'N':
                                    SaveIC(note);
                                    $scope.resetIC();
                                    break;
                                case 'M':
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
                    }

                },
                templateUrl: './forms/EHS/CReport/createICReport.html'

            }
        }]);
});

