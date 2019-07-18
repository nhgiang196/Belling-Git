/**
 * Created by wangyanyan on 2017/2/20.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("ConQuaDetailController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate) {

            var lang = window.localStorage.lang;
            $scope.bpmnloaded=false;
            $scope.flowkey="GateContractorInfoProcess";
            $scope.project={};
            ConQuaService.ContractorQualification().getDetailHeader({"employerid": $routeParams.employerId,language:lang}).$promise.then(function (res) {
                console.log(res);
                var emID=  res[0].EmployerId;
                $scope.project=res[0];
                ConQuaService.ContractorQualification().getFiles({"employerId":emID,kind:true}).$promise.then(function (fileres) {
                    console.log(fileres);
                    //  $scope.project.files=fileres
                    $scope.BusinessLicence = parseData( fileres,"BusinessLicence")||[];
                    $scope.Cer2 = parseData( fileres,"Cer2")||[];
                    $scope.Cer3 = parseData( fileres,"Cer3")||[];
                    $scope.Cer4 = parseData(fileres,"Cer4")||[];
                });
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            $scope.showPng = function () {
                if ($scope.bpmnloaded == true) {
                    $scope.bpmnloaded = false;
                } else {
                    $scope.bpmnloaded = true;
                }
            }
            //附近的拆和 合并
            var parseData = function(data,filetype) {
                var arr=[];
                for(var i=0;i<data.length;i++) {
                    if(data[i].FileType==filetype){
                        arr.push(data[i]);
                    }
                }
                return arr;
            }
            $scope.showPID=function() {
                ConQuaService.GetGateGoodsOutPID().get({  VoucherID: $scope.VoucherID, activityName: "StartEvent_1" }).$promise.then(function (res) {
                    $scope.processInstanceId = res.ProcessInstanceId;
                });
            }
        }])
})