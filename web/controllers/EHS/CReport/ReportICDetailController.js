define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('ICReportController', ['$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$routeParams',
        function ($filter, Notifications, Auth, EngineApi, CReportService, InfolistService, $translate, $q, $scope, $routeParams) {

            /**
             * Report init
             */
            var id = $routeParams.code; //param
            console.log(id);
            if (id.includes(':true')) {
                $scope.Rp_ID = id.slice(0, id.length - 5);



                console.log($scope.Rp_ID);
                $(document).ready(function () {
                    setTimeout(function () {
                        window.print();
                    }, 500);
                })
            } else {
                $scope.Rp_ID = id;
            }
            var lang = window.localStorage.lang; //language
            $(document).ready(function () {
                setTimeout(function () {
                    window.print();
                }, 500);
            })


        }
    ])

})