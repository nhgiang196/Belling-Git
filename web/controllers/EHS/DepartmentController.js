
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('DepartmentController', ['$upload', '$filter', 'Notifications', 'Auth', '$translate', '$q', '$scope', 'DepartmentService',
        function ($upload, $filter, Notifications, Auth, $translate, $q, $scope, DepartmentService) {

            console.log("Test depart controller");

            $scope.headers = [];
            $scope.list = [];

            $scope.cost = '';
            $scope.spec = '';

            $scope.entity = {};

            DepartmentService.GetDataCompany(function (res) {
                console.log(res);
                ShowData(res);
            })

            $scope.uploadFile = function ($files, size) {
                console.log($files);
                $upload.upload({
                    url: '/Waste/files/Upload',
                    method: "POST",
                    file: $files
                }).progress(function (evt) {
                    console.log(evt);
                })

            }


            $scope.SearchFunction = function () {

                var bienthongso = {
                    costcenter: $scope.cost,
                    spec: $scope.spec
                };
                DepartmentService.GetDataDepartment_Function(bienthongso, function (res) {
                    console.log(res);
                    ShowData(res);
                })


            }



            $scope.AddCompanyFunction = function () {
                DepartmentService.AddCompany($scope.entity, function (res) {
                    if (res.Success) {
                        Notifications.addMessage(
                            { 'status': 'information', 'message': $translate.instant('THêm thành công') });

                    } else {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('saveError') + res.Message
                        });
                    }
                })
            }


            function ShowData(data) {
                $scope.list = data;
                $scope.headers = [];
                for (var key in data[0]) {

                    if (key.indexOf('$') < 0) {
                        $scope.headers.push({ name: key });
                    }
                }
            }


        }])
})