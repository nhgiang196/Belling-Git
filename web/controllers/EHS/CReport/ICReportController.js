define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('ICReportController', ['$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$routeParams',
        function ($filter, Notifications, Auth, EngineApi, CReportService,InfolistService, $translate, $q, $scope, $routeParams) {

            //evaluate combobox
            $scope.evaluatelist = InfolistService.Infolist('evaluate');
            // location combobox
            $scope.locationlist= InfolistService.Infolist('location');
            // incident type combobox
            $scope.incidentlist= InfolistService.Infolist('incident');
            /**
             * Report init
             */
            var id = $routeParams.code; //param
            console.log(id);
            if(id.includes(':true')){
                $scope.Rp_ID = id.slice(0, id.length-5);
                console.log($scope.Rp_ID);
                $(document).ready(function () {
                    setTimeout(function () {
                        window.print(); 
                    }, 500);
                })
            }else{
                $scope.Rp_ID = id;
            }
            
            
            $scope.ICdetail = {};
            var lang = window.localStorage.lang; //language
            loadDetail();
            console.log($scope.ICdetail);
            function loadDetail() {
                // var deferred = $q.defer();
                CReportService.FindIC({ Rp_ID: $scope.Rp_ID }, function (data) {
                    $scope.ICdetail = data.Table0[0];
                    $scope.ICfile_Description = [];
                    $scope.ICfile_Location = [];
                    data.Table1.forEach(
                        function(element){
                            if(element.ColumnName=='Rp_Description'){
                                $scope.ICfile_Description.push(element);
                            }else{
                                $scope.ICfile_Location.push(element);
                            }
                        }
                    );

                    switch ($scope.ICdetail.RpIC_Evaluate) {
                        case 'VG':
                        $scope.ICdetail.RpIC_Evaluate = $translate.instant($scope.evaluatelist[0].name);
                        break;
                        case 'G':
                        $scope.ICdetail.RpIC_Evaluate = $translate.instant($scope.evaluatelist[1].name);
                        break;
                        case 'MD':
                        $scope.ICdetail.RpIC_Evaluate = $translate.instant($scope.evaluatelist[2].name);
                        break;
                        case 'B':
                        $scope.ICdetail.RpIC_Evaluate = $translate.instant($scope.evaluatelist[3].name);
                        break;
                        case 'VB':
                        $scope.ICdetail.RpIC_Evaluate = $translate.instant($scope.evaluatelist[4].name);
                        break;
                    };

                    switch ($scope.ICdetail.Rp_Location) {
                        case 'DN':
                        $scope.ICdetail.Rp_Location = $translate.instant($scope.locationlist[0].name);
                        break;
                        case 'HS':
                        $scope.ICdetail.Rp_Location = $translate.instant($scope.locationlist[1].name);
                        break;
                        case 'O':
                        $scope.ICdetail.Rp_Location = $translate.instant($scope.locationlist[2].name);
                        break;
                    };

                    switch ($scope.ICdetail.RpIC_IncidentType) {
                        case 'ind1':
                        $scope.ICdetail.RpIC_IncidentType = $scope.incidentlist[0].name;
                        break;
                        case 'ind2':
                        $scope.ICdetail.RpIC_IncidentType = $scope.incidentlist[1].name;
                        break;
                    };
                        
                    
                    $scope.ICdetail.Rp_Date = moment($scope.ICdetail.Rp_Date).format("YYYY") + '年 Năm ' + moment($scope.ICdetail.Rp_Date).format("MM") + '月 Tháng ' + moment($scope.ICdetail.Rp_Date).format("DD") + '日 Ngày ';
                    $scope.ICdetail.Rp_DateTime = moment($scope.ICdetail.Rp_DateTime).format("YYYY") + '年 Năm ' + moment($scope.ICdetail.Rp_DateTime).format("MM") + '月 Tháng ' + moment($scope.ICdetail.Rp_DateTime).format("DD") + '日 Ngày ' + moment($scope.ICdetail.Rp_DateTime).format("HH") + '時 Giờ ' + moment($scope.ICdetail.Rp_DateTime).format("mm") + '分 Phút ';
                }, function (error) {
                    console.log(error);
                    // deferred.reject(error);
                })
            }
            
            

            /** PRINT REPORT */
            // function PrintReport() {
            //     var printContents;
            //     var originalContents = document.body.innerHTML;
            //     document.body.innerHTML = printContents;
            //     window.print();
            //     document.body.innerHTML = originalContents;
            //     printContents.reject();
            // }
            
            
            
        }])
        
})
