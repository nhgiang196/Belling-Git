define(['app', 'bpmn'], function (app) {
    /**DIRECTIVE FOR OVERGRADE (QUALIFED CONTROL) REPORTS AND APPROVATION FORM */
    app.directive('receiveReport', ['CReportService', 'Auth', '$q', '$filter', '$routeParams', 'Notifications', 'EngineApi',
        function (CReportService, Auth, $q, $filter, $routeParams, Notifications, EngineApi) {
            return {
                restrict: 'AEC',
                link: function (scope, element, attrs) {
                    /**Init scope*/
                    scope.today = $filter('date')(new Date(), "yyyy-MM-dd");
                    scope.ReportDetail = [];
                    var _Rp_ID = $routeParams.Rp_ID ? $routeParams.Rp_ID : attrs.rpId
                    /* Submit into BPMN **/
                    CReportService.FindByID({
                        Rp_ID: _Rp_ID
                    }, function (data) {
                        console.log(data);
                        scope.ReportDetail = data;
                        scope.ACfile_Injury_Description = [];
                        scope.ACfile_Location = [];
                        scope.ICfile_Description = [];
                        scope.ICfile_Location = [];
                        data.FileAttached.forEach(
                            function (element) {
                                if (element.ColumnName == 'Rp_Location') {
                                    scope.ACfile_Location.push(element);
                                } else if (element.ColumnName == 'Injury_Description' && element.Profile_ID == scope.EmployeeID) {
                                    scope.ACfile_Injury_Description.push(element);
                                }

                                if (element.ColumnName == 'Rp_Description') {
                                    scope.ICfile_Description.push(element);
                                } else {
                                    scope.ICfile_Location.push(element);
                                }
                            }
                        );

                        if (data.Rp_Type == 'IC') {
                            CReportService.FindIC({
                                Rp_ID: _Rp_ID
                            }, data => {
                                console.log('findic', data);
                            })

                        } else {
                            CReportService.GetAccidentDetail({
                                Rp_ID: _Rp_ID,
                                EmployeeID: data.AccidentDetail[0].EmployeeID
                            }, data => {
                                scope.Injuries = [];
                                scope.Injuries = data.Table0[0];
                                console.log('GetAccidentDetail', data);
                            })
                        }
                        // scope.ICdetail.Rp_Date = moment(scope.ICdetail.Rp_Date).format("YYYY") + '年 Năm ' + moment(scope.ICdetail.Rp_Date).format("MM") + '月 Tháng ' + moment(scope.ICdetail.Rp_Date).format("DD") + '日 Ngày ';
                        // scope.ICdetail.Rp_DateTime = moment(scope.ICdetail.Rp_DateTime).format("YYYY") + '年 Năm ' + moment(scope.ICdetail.Rp_DateTime).format("MM") + '月 Tháng ' + moment(scope.ICdetail.Rp_DateTime).format("DD") + '日 Ngày ' + moment(scope.ICdetail.Rp_DateTime).format("HH") + '時 Giờ ' + moment(scope.ICdetail.Rp_DateTime).format("mm") + '分 Phút ';
                        // scope.ACdetail.Rp_Date = moment(data.Table0[0].Rp_Date).format('DD/MM/YYYY');
                        // scope.ACdetail.Hiring = moment(data.Table0[0].Hiring).format('DD/MM/YYYY');
                        // scope.ACdetail.RpAC_DateComplete = moment(data.Table0[0].RpAC_DateComplete).format('DD/MM/YYYY');
                        // scope.ACdetail.Rp_DateTime = moment(data.Table0[0].Rp_DateTime).format("YYYY") + ' 年 Năm    ' + moment(data.Rp_DateTime).format("MM") + ' 月 Tháng   ' + moment(data.Rp_DateTime).format("DD") + '日 Ngày    ' + moment(data.Rp_DateTime).format("HH") + '時 Giờ    ' + moment(data.Rp_DateTime).format("mm") + ' 分 Phút    ';
                    }, function (err) {
                        console.log(err)
                    });
                },
                templateUrl: './forms/EHS/CReport/CReportDetail.html'
            }
        }
    ]);



});