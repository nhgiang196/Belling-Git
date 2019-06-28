
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createIcReport', ['$upload', 'CReportService', 'Auth', '$q', 'Notifications','$translate',
        function ($upload, CReportService, Auth,Notifications,$translate, $q) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    var lang = window.localStorage.lang;
                    $scope.flowkey = 'HW01';
                    $scope.username = Auth.username;
                    formVariables = $scope.formVariables = [];
                    historyVariable = $scope.historyVariable = [];
                    $scope.btnFile=true;
                    $scope.btnFile_AC = true;
                   
                    //showBtnFile USE FOR BOTH REPORT
                    $scope.showBtnFile = function(){
                        if($scope.recordIC.icLocation == 'O' || $scope.recordAC.ac_location =='O'){
                            $scope.btnFile=false;
                            $scope.btnFile_AC = false;
                        }else{
                            $scope.btnFile = true;
                            $scope.btnFile_AC = true;
                        }
                    }

                    $scope.listfile = [];
                    $scope.dt={};
                    // upload file của anh
                   
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
                    var subdepartment = {TableName:"Department", Lang:lang};
                    var centerdepartment = {TableName:"CenterDepartment", Lang:lang};
                        //--CenterDepartment----
                    CReportService.GetBasic(centerdepartment,function (data) {
                        $scope.center_dpm = data;
                    }, function (error) {
                    })
                    //--SubDepartment------ USE FOR BOTH REPORT
                    CReportService.GetBasic(subdepartment,function (data) {
                        $scope.sub_dpm = data;
                    }, function (error) {
                        
                    })

                    /**
                     * Init Data to save
                     */

                    function saveInitDataIC() {
                        var note = {};
                        note.Rp_ID = $scope.recordIC.rp_id || '';

                        $scope.lsFile = []; 
                        if ($scope.listfile.length > 0) {
                            $scope.listfile.forEach(element => {
                                $scope.f.File_ID = element.name;
                                $scope.f.ColumnName = element.col;
                                $scope.f.Rp_ID = $scope.recordIC.rp_id || '';
                                $scope.lsFile.push($scope.f);
                                $scope.f = {};
                            })
                        }

                        note.Rp_Status = $scope.recordIC.status || '';
                        note.Rp_Type = 'IC';
                        note.RpIC_Group = $scope.recordIC.icGroup;
                        note.Rp_DepartmentID = $scope.recordIC.ic_departmentid;
                        note.Rp_SubDepartmentID =  $scope.recordIC.ic_SubDeparmentid;
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

                    $scope.SaveICReport = function () {
                        var note = saveInitDataIC();
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

