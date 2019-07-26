/**
 * Created by wangyanyan on 14-3-27.
 */
define( ['myapp','angular'],function(myapp,angular){
    myapp.controller("logoutController",['$scope','$location','$cookieStore',function($scope,$location,$cookieStore){
        $cookieStore.remove('username');
        $location.path('/login');
    }])
    myapp.controller("loginController",['$scope','$http','$compile','$routeParams','$resource','$location','Notifications','Forms','Auth','localStorage','$rootScope','$translate','EngineApi',
        function($scope,$http,$compile,$routeParams,$resource,$location,Notifications,Forms,Auth,localStorage,$rootScope,$translate,$translateProvider,EngineApi){

        var user = $.parseJSON(localStorage.getTable('user'));
        $scope.username = user!=null?user.username:"";
        // $scope.password = user!=null?user.password:"";
        $scope.isRemember = user!=null?true:false;
            console.log( window.localStorage.lang);
        $scope.switching = function(lang){
            $translate.use(lang);
            window.localStorage.lang = lang;
            window.location.reload();
       /*     $translateProvider.preferredLanguage(lang);
            $translateProvider.useStaticFilesLoader({
                prefix: '/i18n/Basic/',
                suffix: lang+'.json'
            });*/
        };
        $scope.cur_lang = $translate.use();
        $scope.key_login=function(){
            if (event.keyCode == "13") {//keyCode=13是回车键
               
                loginuser();

            }
        }
        function loginuser(){
            if(CheckBrowser().IsChrome)
            {
                if($scope.isRemember){
                    localStorage.saveTable('user','{"username":"'+$scope.username+'","password":"'+this.password+'"}');
                }
                else{
                    localStorage.saveTable('user','{"username":"'+$scope.username+'","password":""}');
                }
                var authapp =  $resource("/authorize/:operation/:id", { username: "@id" }, {  login: { method: 'POST', params : {operation: "login" }}   });
                authapp.login({username:$scope.username,password:$scope.password||""}).$promise.then(function (data) {


                    Auth.saveUser(data,function(resauth){
                        if(resauth) {
                            $location.url("/");
                        }else{
                            alert('登入失败');
                        }
                    });
                }, function (err) {
                    console.log(err);
                    Notifications.addError({'status': 'error', 'message': err});
                    alert('登入失败:'+err.data+"，登录失败三次用户被锁定！");
                });
            }
            else
            {
                var err = CheckBrowser().msg
                Notifications.addError({'status': 'error', 'message': err});
                alert(err);
            }

        };

        function CheckBrowser()
        {
            if(!!window.chrome && !!window.chrome.webstore)
                return { IsChrome:true, msg:''}
            else
                return { IsChrome:false, msg:'Please use our system on Google Chorme Browser! Download: http://localhost:843/css/GoogleChrome.rar'}
        }
        $scope.login =function(){

            loginuser();
        }



    }]);
});