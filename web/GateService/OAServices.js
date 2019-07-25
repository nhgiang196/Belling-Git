/**
 * Created by wang.chen on 2016/11/10.
 */
define( ['app','angular'],function(app,angular){
    app.service("OAServices",[ '$resource','$q','Auth','$location','$translate', function($resource,$q,Auth,$location,$translate) {
        function OAServices(){
            this.getInformation= $resource("/ehs/gate/OAController/:operation",{},{
                getInfo:{method:'GET', params : {operation: "ShowDataByDepartmentID" },isArray:true},  //访客类型
                getInfoByDepartmentID:{method:'GET', params : {operation: "ShowDataByDepartmentID_Details" },isArray:true},
                UploadUserNotInList:{method:'GET', params : {operation: "UploadUserNotInList" },isArray:true},
                UploadUserHandle:{method:'GET',params:{operation:"UploadUserHandle"},isArray:true },
                UploadExcel:{method:'POST',params:{operation:"UploadExcelFile"} }
            });

        }
        OAServices.prototype.GateInfoBacsic = function() {
            return this.getInformation;
        };

        return new OAServices();
    }])

});
