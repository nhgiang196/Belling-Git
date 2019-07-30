define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('ReportACdetailController', ['$filter', 'Notifications', 'Auth', 'EngineApi', 'CReportService', 'InfolistService', '$translate', '$q', '$scope', '$routeParams',
        function ($filter, Notifications, Auth, EngineApi, CReportService, InfolistService, $translate, $q, $scope, $routeParams) {

            //evaluate combobox
            var evaluatelist = InfolistService.Infolist('evaluate');
            // location combobox
            var locationlist = InfolistService.Infolist('location');

            /**
             * Report init
             */
            var id = $routeParams.code; //param
            var other = 1;
            console.log(id);
            if (id.includes('_o')) {
                other = 0;
                if (id.includes(':true')) {
                    $scope.Rp_ID = id.slice(0, 13);
                    $(document).ready(function () {
                        setTimeout(function () {
                            window.print();
                        }, 500);
                    })
                } else {
                    $scope.Rp_ID = id.slice(0, 13);
                }

            } else {
                other = 1;
                if (id.includes(':true')) {
                    $scope.Rp_ID = id.slice(0, 13);
                    $(document).ready(function () {
                        setTimeout(function () {
                            window.print();
                        }, 500);
                    });
                } else {
                    $scope.Rp_ID = id.slice(0, 13);
                }

            };

            // /**Get voucher and voucher detail  */
            // $q.all([loadDetail()]).then(function (result) {
            //     console.log(result);
            // }, function (error) {
            //     Notifications.addError({
            //         'status': 'Failed',
            //         'message': 'Loading failed: ' + error
            //     });
            // });


            //lấy báo cáo phần chung 
            function loadDetail() {
                var deferred = $q.defer();
                CReportService.GetAccidentDetail({
                    Rp_ID: $scope.Rp_ID,
                    Other: other
                }, function (data) {
                    //  $scope.ACdetail = data.Table0;
                    if (other == 1) {

                        $scope.AC = {};
                        $scope.ACdetail = [];
                        for (x = 0; x < data.Table0.length; x++) {
                            $scope.AC.Hiring = moment(data.Table0[x].Hiring).format('DD/MM/YYYY');
                            $scope.AC.EmployeeID = data.Table0[x].EmployeeID;
                            $scope.AC.Name = data.Table0[x].Name;
                            $scope.AC.sex = data.Table0[x].sex;

                            if (data.Table0[x].Birthday === null) {
                                $scope.AC.Age = '';
                            } else {
                                $scope.AC.Age = parseInt(data.Table0[x].Rp_Date) - parseInt(data.Table0[x].Birthday);
                            }

                            $scope.AC.Specification_VN = data.Table0[x].Specification_VN;
                            $scope.AC.PositionName = data.Table0[x].PositionName;
                            $scope.AC.Injury_Description = data.Table0[x].Injury_Description;
                            $scope.AC.Treatment_Result = data.Table0[x].Treatment_Result;
                            $scope.AC.Witness_info = data.Table0[x].Witness_info;
                            $scope.ACdetail.push($scope.AC);
                            $scope.AC = {};

                        }


                    } else {


                        $scope.AC = {};
                        $scope.ACdetail = [];
                        for (x = 0; x < data.Table0.length; x++) {
                            $scope.AC.Hiring = moment(data.Table0[x].Contractor_Victim_DateWork).format('DD/MM/YYYY');
                            $scope.AC.EmployeeID = data.Table0[x].EmployeeID;
                            $scope.AC.Name = data.Table0[x].Contractor_Victim_Name;
                            $scope.AC.sex = data.Table0[x].Contractor_Victim_Sex;
                            $scope.AC.Age = data.Table0[x].Contractor_Victim_Age;
                            $scope.AC.Specification_VN = data.Table0[x].Contractor_Name;
                            $scope.AC.PositionName = data.Table0[x].Contractor_Victim_Work;
                            $scope.AC.Injury_Description = data.Table0[x].Injury_Description;
                            $scope.AC.Treatment_Result = data.Table0[x].Treatment_Result;
                            $scope.AC.Witness_info = data.Table0[x].Witness_info;
                            $scope.ACdetail.push($scope.AC);
                            $scope.AC = {};

                        }

                    }

                    $scope.ACfile_Injury_Description = [];
                    $scope.ACfile_Location = [];
                    data.Table1.forEach(
                        function (element) {
                            if (element.ColumnName == 'Rp_Location') {
                                $scope.ACfile_Location.push(element);
                            } else if (element.ColumnName == 'Injury_Description') {
                                $scope.ACfile_Injury_Description.push(element);
                            }
                        }
                    );

                    $scope.RpAC_ImproveSoftware = data.Table0[0].RpAC_ImproveSoftware;
                    $scope.RpAC_ImproveHardware = data.Table0[0].RpAC_ImproveHardware;
                    $scope.Rp_PreventMeasure = data.Table0[0].Rp_PreventMeasure;

                    $scope.Rp_Location = locationlist.find(item => item.id === data.Table0[0].Rp_Location).name;

                    $scope.RpAC_ResultHardware = evaluatelist.find(item => item.id === data.Table0[0].RpAC_ResultHardware).name;

                    $scope.RpAC_ResultSoftware = evaluatelist.find(item => item.id === data.Table0[0].RpAC_ResultSoftware).name;

                    $scope.Rp_Date = moment(data.Table0[0].Rp_Date).format('DD/MM/YYYY');
                    $scope.RpAC_DateComplete = moment(data.Table0[0].RpAC_DateComplete).format('DD/MM/YYYY');
                    $scope.Rp_DateTime = moment(data.Table0[0].Rp_DateTime).format("YYYY") + ' 年 Năm    ' + moment(data.Rp_DateTime).format("MM") + ' 月 Tháng   ' + moment(data.Rp_DateTime).format("DD") + '日 Ngày    ' + moment(data.Rp_DateTime).format("HH") + '時 Giờ    ' + moment(data.Rp_DateTime).format("mm") + ' 分 Phút    ';
                }, function (error) {
                    deferred.reject(error);
                })
            }




        }
    ])
})

// EmployeeID	Rp_ID	Injury_Description	Witness_info	Treatment_Result	Contractor_Victim_Sex	Contractor_Victim_Name	Contractor_Victim_Age	Contractor_Name	Contractor_Victim_DateWork	Contractor_Victim_Work