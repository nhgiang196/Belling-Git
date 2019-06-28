/**
 * Created by wang.chen on 2016/11/16.
 */

define( ['app','angular'],function(app,angular){
    app.service("GatePtaEg",[ '$resource','$q','Auth','$location', function($resource,$q,Auth,$location) {
        function GatePtaEg(){
            this.gatePtgEgTruckBasic = $resource("/ehs/gate/PtaEgTruck/:operation",{},{
                getPtaEgTypes:{method:'GET',params:{operation:"GetPtaEgTypes"},isArray:true},
                savePtaEgTruck:{method:'POST',params:{operation:"SavePtaEgTruck"}},
                ptaEgTruckByVoucherID:{method:'GET',params:{operation:"PtaEgTruckByVoucherID"}},
                getPtaEgTrucks:{method:'GET',params:{operation:"GetPtaEgTrucks"}},
                deletePtaEgTruck:{method:'POST',params:{operation:"DeletePtaEgTrucks"}},
                writePtaEgTruckReason:{method:'GET',params:{operation:"WritePtaEgTruckReason"}},
                getPtaEgTruckByVehicleNO:{method:'GET',params:{operation:"getPtaEgTruckByVehicleNO"},isArray:true}
            });

            this.saveGatePtgEgTruck = $resource("/ehs/gate/PtaEgTruck/:operation",{},{
                save:{method:'POST',params:{operation:"SavePtaEgTruck"}}
            });
            this.getGatePtaEgTruckPID = $resource("/gate/GatePtaEgTruck/PID",{
                get:{method:'GET'}
            });

        }
        GatePtaEg.prototype.GatePtgEgTruckBasic = function(){
            return this.gatePtgEgTruckBasic;
        };
        GatePtaEg.prototype.SaveGatePtgEgTruck = function(){
            return this.saveGatePtgEgTruck;
        };
        GatePtaEg.prototype.GetGatePtaEgTruckPID = function(){
            return this.getGatePtaEgTruckPID;
        };
        return new GatePtaEg();

    }])


});
