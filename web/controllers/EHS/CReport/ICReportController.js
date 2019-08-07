define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('ICReportController', ['$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$routeParams',
        function ($filter, Notifications, Auth, EngineApi, CReportService, InfolistService, $translate, $q, $scope, $routeParams) {

            //evaluate combobox
            var evaluatelist = InfolistService.Infolist('evaluate');
            // location combobox
            var locationlist = InfolistService.Infolist('location');
            // incident type combobox
            var submittypelist = InfolistService.Infolist('SubmitType');
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


            $scope.ICdetail = {};
            var lang = window.localStorage.lang; //language
            // loadDetail();
            console.log($scope.ICdetail);
            function loadDetail() {
                // var deferred = $q.defer();
                CReportService.FindIC({ Rp_ID: $scope.Rp_ID }, function (data) {
                    $scope.ICdetail = data.Table0[0];
                    $scope.ICfile_Description = [];
                    $scope.ICfile_Location = [];
                    data.Table1.forEach(
                        function (element) {
                            if (element.ColumnName == 'Rp_Description') {
                                $scope.ICfile_Description.push(element);
                            } else {
                                $scope.ICfile_Location.push(element);
                            }
                        }
                    );

                    $scope.ICdetail.RpIC_Evaluate = evaluatelist.find(item => item.id === $scope.ICdetail.RpIC_Evaluate).name;

                    $scope.ICdetail.Rp_Location = locationlist.find(item => item.id === $scope.ICdetail.Rp_Location).name;

                    $scope.ICdetail.RpIC_IncidentType = submittypelist.find(item => item.id === $scope.ICdetail.RpIC_IncidentType).name;

                    $scope.ICdetail.Rp_Date = moment($scope.ICdetail.Rp_Date).format("YYYY") + '年 Năm ' + moment($scope.ICdetail.Rp_Date).format("MM") + '月 Tháng ' + moment($scope.ICdetail.Rp_Date).format("DD") + '日 Ngày ';
                    $scope.ICdetail.Rp_DateTime = moment($scope.ICdetail.Rp_DateTime).format("YYYY") + '年 Năm ' + moment($scope.ICdetail.Rp_DateTime).format("MM") + '月 Tháng ' + moment($scope.ICdetail.Rp_DateTime).format("DD") + '日 Ngày ' + moment($scope.ICdetail.Rp_DateTime).format("HH") + '時 Giờ ' + moment($scope.ICdetail.Rp_DateTime).format("mm") + '分 Phút ';
                }, function (error) {
                    console.log(error);
                })
            }


        }])

})
