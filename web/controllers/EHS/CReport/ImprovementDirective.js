define(['app'], function (app) {
    app.directive('improvementCreport', ['CReportService', 'InfolistService', 'Auth', '$timeout', 'Notifications', '$translate', '$upload',
        function (CReportService, InfolistService, Auth, $timeout, Notifications, $translate, $upload, ) {
            return {
                restrict: 'E',
                controller: function ($scope, $element, $attrs) {

                    $scope.ReportDetail_Ctr = {};

                    $scope.listfile = [];
                    // Notifications.addError({
                    //     'status': 'error',
                    //     'message': $translate.instant('Update_onlyowner_MSG')
                    // });
                    $scope.ReportDetail_Ctr.Rp_ID = $scope.variable.Rp_ID;
                    $scope.LoadImprovementInfo = function () {
                        $scope.ImprovementRecord = {};
                        CReportService.FindByID({
                            Rp_ID: $scope.variable.Rp_ID
                        }, function (data) {
                            $scope.listfileAC = [];
                            $scope.listfile = [];
                            if (new Date(data.RpAC_DateComplete) >= new Date() || $scope.show.isHSEUser) {
                                $scope.ImprovementRecord = data;
                                data.FileAttached.forEach(element => {
                                    var x = {};
                                    x.Rp_ID = element.Rp_ID;
                                    x.name = element.File_ID;
                                    x.col = element.ColumnName;
                                    $scope.listfile.push(x);
                                })
                            } else {
                                $timeout(function () {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': $translate.instant('Date to complete Improvement are out: ' + data.RpAC_DateComplete || '.')
                                    });
                                }, 400);
                            }
                        }, function (error) {});
                        // } else {
                        //     Notifications.addError({
                        //         'status': 'error',
                        //         'message': $translate.instant('Select_ONE_MSG')
                        //     });
                        // }
                    }


                    $scope.btnImprovementSave = function (myrecord) { //Improvement Save button functions
                        var templsFile = [];
                        if ($scope.listfile.length > 0) {
                            $scope.listfile.forEach(element => {
                                templsFile.push({
                                    File_ID: element.name,
                                    ColumnName: element.col,
                                    Rp_ID: myrecord.Rp_ID
                                });
                            })
                        }
                        myrecord.FileAttached = templsFile; //File list
                        console.log(myrecord);
                        CReportService.GetInfoBasic.Update(myrecord, function (res) {
                                if (res.Success) {
                                    $('#modal_Improvement').modal('hide');
                                    $scope.update_msg();
                                } else {
                                    $scope.update_error_msg();
                                }
                            },
                            function (error) {
                                $scope.update_error_msg(error);
                            })
                    };
                },
                templateUrl: './forms/EHS/CReport/updateImprovement.html'
            }
        }
    ]);
});