define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('ReportACdetailController', ['$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService','InfolistService', '$translate', '$q', '$scope', '$routeParams',
        function ($filter, Notifications, Auth, EngineApi, CReportService,InfolistService, $translate, $q, $scope, $routeParams) {

            //evaluate combobox
            $scope.evaluatelist = InfolistService.Infolist('evaluate');
            // location combobox
            $scope.locationlist= InfolistService.Infolist('location');
            
            /**
             * Report init
             */
            var id = $routeParams.code; //param
            console.log(id);
            if(id.includes(':true')){
                $scope.Rp_ID = id.slice(0,13);
                $scope.EmployeeID = id.slice(14, id.length-5);
                console.log($scope.Rp_ID);
                console.log($scope.EmployeeID);
                $(document).ready(function () {
                    setTimeout(function () {
                        window.print(); 
                    }, 700);
                })
            }else{
                $scope.Rp_ID = id.slice(0,13);
                $scope.EmployeeID = id.slice(14, id.length);
                console.log($scope.Rp_ID);
                console.log($scope.EmployeeID);
            }

            $scope.ACdetail = {};
            var lang = window.localStorage.lang; //language


            /**Get voucher and voucher detail  */
            $q.all([loadDetail()]).then(function (result) {
                console.log(result);
            }, function (error) {
                Notifications.addError({ 'status': 'Failed', 'message': 'Loading failed: ' + error });
            });

    
            //lấy báo cáo phần chung 
            function loadDetail() {
                var deferred = $q.defer();
                CReportService.GetAccidentDetail({ Rp_ID: $scope.Rp_ID, EmployeeID: $scope.EmployeeID }, function (data) {
                    $scope.ACdetail = data.Table0[0];
                    $scope.ACfile_Injury_Description = [];
                    $scope.ACfile_Location = [];
                    data.Table1.forEach(
                        function(element){
                            if(element.ColumnName=='Rp_Location'){
                                $scope.ACfile_Location.push(element);
                            }else if(element.ColumnName=='Injury_Description' && element.Profile_ID == $scope.EmployeeID){
                                $scope.ACfile_Injury_Description.push(element);
                            }
                        }
                    );

                    switch ($scope.ACdetail.Rp_Location) {
                        case 'DN':
                        $scope.ACdetail.Rp_Location = $translate.instant($scope.locationlist[0].name);
                        break;
                        case 'HS':
                        $scope.ACdetail.Rp_Location = $translate.instant($scope.locationlist[1].name);
                        break;
                        case 'O':
                        $scope.ACdetail.Rp_Location = $translate.instant($scope.locationlist[2].name);
                        break;
                    };

                    switch ($scope.ACdetail.RpAC_ResultHardware) {
                        case 'VG':
                        $scope.ACdetail.RpAC_ResultHardware = $translate.instant($scope.evaluatelist[0].name);
                        break;
                        case 'G':
                        $scope.ACdetail.RpAC_ResultHardware = $translate.instant($scope.evaluatelist[1].name);
                        break;
                        case 'MD':
                        $scope.ACdetail.RpAC_ResultHardware = $translate.instant($scope.evaluatelist[2].name);
                        break;
                        case 'B':
                        $scope.ACdetail.RpAC_ResultHardware = $translate.instant($scope.evaluatelist[3].name);
                        break;
                        case 'VB':
                        $scope.ACdetail.RpAC_ResultHardware = $translate.instant($scope.evaluatelist[4].name);
                        break;
                    };

                    switch ($scope.ACdetail.RpAC_ResultSoftware) {
                        case 'VG':
                        $scope.ACdetail.RpAC_ResultSoftware =$translate.instant( $scope.evaluatelist[0].name);
                        break;
                        case 'G':
                        $scope.ACdetail.RpAC_ResultSoftware =$translate.instant( $scope.evaluatelist[1].name);
                        break;
                        case 'MD':
                        $scope.ACdetail.RpAC_ResultSoftware = $translate.instant($scope.evaluatelist[2].name);
                        break;
                        case 'B':
                        $scope.ACdetail.RpAC_ResultSoftware = $translate.instant($scope.evaluatelist[3].name);
                        break;
                        case 'VB':
                        $scope.ACdetail.RpAC_ResultSoftware = $translate.instant($scope.evaluatelist[4].name);
                        break;
                    };

                    $scope.ACdetail.Rp_Date = moment(data.Table0[0].Rp_Date).format('DD/MM/YYYY');
                    $scope.ACdetail.Hiring = moment(data.Table0[0].Hiring).format('DD/MM/YYYY');
                    $scope.ACdetail.RpAC_DateComplete = moment(data.Table0[0].RpAC_DateComplete).format('DD/MM/YYYY');
                    $scope.ACdetail.Rp_DateTime = moment(data.Table0[0].Rp_DateTime).format("YYYY") + ' 年 Năm    ' + moment(data.Rp_DateTime).format("MM") + ' 月 Tháng   ' + moment(data.Rp_DateTime).format("DD") + '日 Ngày    ' + moment(data.Rp_DateTime).format("HH") + '時 Giờ    ' + moment(data.Rp_DateTime).format("mm") + ' 分 Phút    ';
                }, function (error) {
                    deferred.reject(error);
                })
            }
            

            

        }])
})
