/**
 * Created by wang.chen on 2016/9/13.
 */
define( ['app','angular'],function(app,angular){
 
    app.service("GateGoodsOut",[ '$resource','$q','Auth','$location', function($resource,$q,Auth,$location) {
        function GateGoodsOut(){
            this.getGoodBasic= $resource("/ehs/gate/Goods/:operation",{},{
                getGoodsTypes:{method:'GET',params:{operation:"GetGoodsTypes"},isArray:true},
                getGoodUnit:{method:'GET',params:{operation:"GetUnits"},isArray:true},
                saveGoodInfo:{method: 'POST',params:{operation:"SaveGoodsInfo"}},
                getGoodByVoucherID:{method:'GET',params:{operation:"GetGoodsByVoucherID"},isArray:true},
                getOutReason:{method:'GET',params:{operation:"GetOutReasons"},isArray:true},
                deleteGoods:{method:'DELETE',params:{operation:"DeleteGoods"},isArray:true},
                getGoodsList:{method:'GET',params:{operation:"GetGoods"}},
                canOutIn:{method:'GET',params:{operation:"CanOutIn5X8"}},
                getGoodsByItemID:{method:'GET',params:{operation:"GetGoodsByItemID"},isArray:true},
                saveGoodsBackItemStatus:{method:'POST',params:{operation:"SaveGoodsBackItemStatus"}},
                GetGood:{method:'GET',params:{operation:"GoodsByVoucherID"}},
                saveWorkFlowLogs:{method: 'POST',params:{operation:"SaveWorkFlowLogs"}}
            });
            this.saveGoodOut =  $resource("/ehs/gate/Goods/SaveGoodsInfo",{},{
                complete:{method:'POST'}
            });
            this.getGateGoodsOutPID = $resource("/gate/GateGoodsOut/PID",{},{
                get:{method:'GET'}
            });
            this.setGoodsStatus = $resource("/ehs/gate/Goods/UpdateGoodsStatus",{},{
                setStatus:{method:'PUT'}
            });

        }
        GateGoodsOut.prototype.DoGoodsStatus = function(){
            return this.setGoodsStatus;
        };
        GateGoodsOut.prototype.GoodBasic = function(){
            return this.getGoodBasic;
        };
        GateGoodsOut.prototype.SaveGoodOut = function(){
            return this.saveGoodOut
        };
        GateGoodsOut.prototype.GetGateGoodsOutPID = function(){
            return this.getGateGoodsOutPID
        };
        return new GateGoodsOut();

    }])


});