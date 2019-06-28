define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createReportAc', ['CReportService', 'Auth', '$q',
        function (CReportService, Auth, $q) {
            return {
                restrict: 'E', //?
                controller: function ($scope) {
                    $scope.flowkey = 'HW01'; // ??
                    $scope.username = Auth.username;
                    formVariables = $scope.formVariables = []; //???
                    historyVariable = $scope.historyVariable = []; //????

                    function saveInitData() {
                        var note = {};
                        note.Rp_ID = $scope.recod.rp_id || '';
                        note.EmployeeID = $scope.recod.employeeID || '';
                        note.Rp_DateTime = $scope.recod.ac_datetime;
                        note.Rp_Location = $scope.recod.ac_location;
                        note.Rp_Type = $scope.recod.ac_type;
                        note.Rp_PreventMeasure = $scope.recod.ac_prevent;
                        note.RpAC_ImproveSoftware = $scope.recod.ac_improvesoft;
                        note.RpAC_ImproveHardware = $scope.recod.improvehard;
                        note.RpAC_DateComplete = $scope.recod.ac_datecomp;
                        note.RpAC_ResultSoftware = $scope.recod.ac_resultsoft;
                        note.RpAC_ResultHardware = $scope.recod.ac_resulthard;
                        note.Injury_Description = $scope.recod.ac_injury;
                        note.Witness_info = $scope.recod.ac_witness;
                        note.Treatment_Result = $scope.recod.ac_treatment;
                        note.Rp_Status = $scope.recod.status || '';
                        note.Rp_Date = Date.now();
                        note.Rp_Stamp = Date.now();
                        note.Rp_CreatorID = Auth.username;

                        return note;
                    }

                    /**
                     * Update status by updateByID
                     */
                    function updateByID(data) {
                        CReportService.UpdateReportAC(data, function (res) {
                            if (res.Success) {
                                $scope.Search();
                                $('#myModal').modal('hide');
                                $('#messageModal').modal('hide');
                                $('#nextModal').modal('hide');
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
                    function SaveReportAC(data) {
                        CReportService.CreateReportAC(data, function (res) {
                            console.log(res)
                            if (res.Success) {
                                $scope.Search();
                                $('#myModal').modal('hide');
                                $('#messageModal').modal('hide');
                                $('#nextModal').modal('hide');
                            }
                            else {
                                Notifications.addError({ 'status': 'error', 'message': $translate.instant('saveError') + res.Message });
                            }
                        }, function (error) {
                            Notifications.addError({ 'status': 'error', 'message': $translate.instant('saveError') + error });
                        })
                    }

                    /**
                     *reset data function
                     */
                    $scope.reset = function () {
                        $scope.recod = {};
                        $('#myModal').modal('hide');
                    }
                    
                    /**
                     * save submit 
                     */
                    $scope.saveSubmit = function () {
                        var note = saveInitData();
                        var status = $scope.status;
                        switch (status) {
                            case 'N':
                                SaveReportAC(note);
                                break;
                            case 'M':
                                updateByID(note);
                                break;
                            default:
                                SaveReportAC(note);
                                break;
                        }

                    };
                },

                templateUrl: './forms/EHS/CReport/createCReportAC.html'
            }
        }
    ]);
});