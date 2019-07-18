/**
 * Created by ntdung on 11/4/2017.
 */
define(['app','angular'], function(app,angular){
    app.service("LIMSEntrusted",['$resource','$q','Auth','$location','$translate',function($resource,$q,Auth,$location,$translate){

        function LIMSEntrusted(){
            this.getInformation= $resource("/ehs/lims/EntrustedController/:operation",{},{
                getSample:{method:'GET', params : {operation: "getSample" },isArray:true},  //访客类型
                getMaterial:{method:'GET', params : {operation: "getMaterial" },isArray:true},
                getAttribute:{method:'GET',params : {operation : "getAttribute"},isArray:true},
                getSpec:{method:'GET',params : {operation : "getSpec"}},
                getReq4Delegate:{method:'GET',params:{operation : "getReq4Delegate"},isArray:true},
                createVoucher:{method:'POST',params: {operation:"CreateVoucher"},isArray:true},
                getPropByVoucherID:{method:'GET' , params:{operation:"getPropByVoucherID"},isArray:true},
                getStatus:{method:'GET' , params:{operation:"getStatus"},isArray:true}
            });
            LIMSEntrusted.prototype.LIMSInfoBasic = function() {
                return this.getInformation;
            };
        }
        return new LIMSEntrusted();

    }])


});