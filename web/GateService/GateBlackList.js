/**
 * Created by wang.chen on 2016/11/11.
 */
define( ['app','angular'],function(app,angular){
    app.service("GateBlackList",[ '$resource','$q','Auth','$location', function($resource,$q,Auth,$location) {
        function GateBlackList(){
            this.gateBlackListBasic = $resource("/ehs/gate/BL_Request/:operation",{},{
                saveBlackList:{method:'POST',params:{operation:"SaveBlackList"}},
                getBlackListVoucher:{method:'GET',params:{operation:"BlackInfoByVoucherID"}},
                saveBlackListStatus:{method:'POST',params:{operation:"SaveBlackListStatus"}},
                getBlackList:{method:'GET',params:{operation:"GetBlackList"}},
                addBlackInfo:{method:'GET',params:{operation:"AddBlackInfo"}}
            });
            this.getGateBlackListPID = $resource("/gate/GateBlackList/PID",{
                get:{method:'GET'}
            });

        }
        GateBlackList.prototype.GateBlackListBasic = function(){
            return this.gateBlackListBasic;
        };
        GateBlackList.prototype.GetGateBlackListPID = function(){
            return this.getGateBlackListPID;
        };
        return new GateBlackList();

    }])


});
