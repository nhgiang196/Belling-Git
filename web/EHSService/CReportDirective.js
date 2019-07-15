define(['app'], function (app) {
    app.directive('receiveReport', ['CReportService', 'InfolistService','Auth', '$filter', '$routeParams',
        function (CReportService,InfolistService, Auth, $filter, $routeParams) {
            return {
                restrict: 'AEC',
                link: function (scope, element, attrs) {
                    /**Init scope*/
                    scope.today = $filter('date')(new Date(), "yyyy-MM-dd");
                    scope.ReportDetail = [];
                    scope.UserName = Auth.username;
                    var _Rp_ID = $routeParams.Rp_ID ? $routeParams.Rp_ID : attrs.rpId
                    CReportService.GetInfoBasic.GetDetailReport({
                        Rp_ID: _Rp_ID
                    }, function (data) {
                        console.log("return data:", data);
                        scope.ReportDetail = data.Header[0];
                        scope.FileAttached = data.File;
                        scope.InjuryDetail = data.Detail;

                        // evaluate combobox
                        var evaluatelist = InfolistService.Infolist('evaluate');
                        // location combobox
                        var locationlist = InfolistService.Infolist('location');
                        // incident type combobox
                        var submittypelist = InfolistService.Infolist('SubmitType');

                        scope.ReportDetail.Rp_Location = locationlist.find(item => item.id === scope.ReportDetail.Rp_Location).name;
                        if(scope.ReportDetail.Rp_Type =='IC') {
                            scope.ReportDetail.RpIC_Evaluate = evaluatelist.find(item => item.id === scope.ReportDetail.RpIC_Evaluate).name;
                            scope.ReportDetail.RpIC_IncidentType = submittypelist.find(item => item.id === scope.ReportDetail.RpIC_IncidentType).name;
                        } else {
                            scope.ReportDetail.RpAC_ResultHardware = evaluatelist.find(item => item.id === scope.ReportDetail.RpAC_ResultHardware).name;
                            scope.ReportDetail.RpAC_ResultSoftware = evaluatelist.find(item => item.id === scope.ReportDetail.RpAC_ResultSoftware).name;
                        }
                 
                     
                    });

                    
                    



                },
                templateUrl: './forms/EHS/CReport/CReportDetail.html'
            }
        }
    ]);



});