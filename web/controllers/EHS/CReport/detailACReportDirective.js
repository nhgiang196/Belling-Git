define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('detailAcReport', ['CReportService', 'Auth', '$q',
        function (CReportService, Auth, $q) {
            return {
                restrict: 'E', //?
                controller: function ($scope) {},
                   

                templateUrl: './forms/EHS/CReport/detailACReport.html'
            }
        }
    ]);
});