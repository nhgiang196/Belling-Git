define(['app'], function (app) {
    app.directive('receiveReport', ['CReportService', 'Auth', '$filter', '$routeParams',
        function (CReportService, Auth, $filter, $routeParams) {
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
                        console.log("return data:",data);
                        scope.ReportDetail = data.Header[0];
                        scope.FileAttached = data.File;
                        scope.InjuryDetail = data.Detail;
                    });
                },
                templateUrl: './forms/EHS/CReport/CReportDetail.html'
            }
        }
    ]);



});