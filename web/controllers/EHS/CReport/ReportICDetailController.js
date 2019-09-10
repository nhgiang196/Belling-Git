define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('ICReportController', ['$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$routeParams',
        function ($filter, Notifications, Auth, EngineApi, CReportService, InfolistService, $translate, $q, $scope, $routeParams) {
            var id = $scope.Rp_ID = $routeParams.code; //param
            $(document).ready(function () {
                setTimeout(function () {
                    window.print();
                }, 500);
            })
        }
    ])

})