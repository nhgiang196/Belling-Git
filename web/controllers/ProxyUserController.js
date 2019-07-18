/**
 * Created by wangyanyan on 2016-09-02.
 * 对流程设置代理人
 */
define( ['myapp','angular','bpmn'],function(myapp,angular,Bpmn) {
    myapp.controller("ProxyUserController", ['$scope', '$http', '$compile', '$routeParams', '$resource', '$location', 'Forms', 'EngineApi', 'User', 'Notifications','Auth','filterFilter','GateGuest',
        function ($scope, $http, $compile, $routeParams, $resource, $location, Forms, EngineApi, User, Notifications,Auth,filterFilter,GateGuest) {


            $scope.list=[];
            getProxyWf();



            function getProxyWf() {
                EngineApi.getProxyUser().getProxyWF().$promise.then(function (proxywf) {
                    $scope.list = proxywf;

                    $scope.checkboxes=[];
                });
            }


            $scope.checkboxes = new Array($scope.list.length);
            $scope.isAll = false;
            $scope.checkAll = function(){
                if($scope.isAll) {
                    $scope.checkboxes = $scope.list.map(function(item){return false});
                } else {
                    $scope.checkboxes = $scope.list.map(function(item){return item.id});
                }
            };

            $scope.$watchCollection('checkboxes', function(newC){
                console.log(newC);
                if (newC.every(function(item){return item != false;})) {
                   // $scope.isAll = true;
                } else {
                    $scope.isAll = false;
                }
            });


            $scope.delete = function (name) {
                if(name){
                    EngineApi.getProxyUser().delete({wfname:name}).$promise.then(function () {
                        getProxyWf();
                    })
                }else{
                    EngineApi.getProxyUser().delete().$promise.then(function () {
                        getProxyWf();
                    })
                }

            }

            $scope.$watch("note.ProxyUserId", function (n) {
                if (n !== undefined) {
                    if (n.length ==10) {
                        var query = {};
                        query.UserID = Auth.username;
                        query.EmployeeID = n;
                        GateGuest.GuestBasic().getNameByEmployeeID(query).$promise.then(function (res) {
                            $scope.note.Name = res[0].Name;
                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });
                    }
                }
            });
            $scope.paraFunc = {
                //创建参数
                createPara: function () {
                    $scope.note={};
                   $scope.selectWF=[];

                  $scope.checkboxes.filter(function(item){
                       if(item=="false"  || item==false){
                         // $scope.checked.splice(item, 1);
                       }else{
                           $scope.selectWF.push(item)
                       }
                    });
                    $('#myModal').modal('show');
                },
                savePara: function () {

                console.log(  $scope.selectWF);
                    var recode=[];
                    angular.forEach( $scope.selectWF , function (value, key) {
                        recode.push(  {UserId: Auth.username, ProxyUserId: $scope.note.ProxyUserId, Name: value});

                    })
                    console.log(recode);
                 EngineApi.getProxyUser().add({'record': recode}).$promise.then(function () {

                     getProxyWf();
                        $('#myModal').modal('hide');
                    })

                }

        }
        }])
});