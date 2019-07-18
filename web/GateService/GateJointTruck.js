/**
 * Created by wang.chen on 2016/11/11.
 */
define(['app', 'angular'], function (app, angular) {
    app.service("GateJointTruck", ['$resource', '$q', 'Auth', '$location', function ($resource, $q, Auth, $location) {
        function GateJointTruck() {
            this.gateJointTruck = $resource("/ehs/gate/JointTruck/:operation", {}, {
                getVehicleShapes: {method: 'GET', params: {operation: "GetVehicleShapes"}, isArray: true},
                getTruckCompany: {method: 'GET', params: {operation: "GetTruckCompany"}, isArray: true},
                getMaterialTypes: {method: 'GET', params: {operation: "GetMaterialTypes"}, isArray: true},
                getShippingOrders: {method: 'GET', params: {operation: "CanAddedToPlan4VBELVs"}},
                isInBlackList: {method: 'GET', params: {operation: "IsInBlackList"}},
                getFHsByVBELVs4Grid: {method: 'GET', params: {operation: "GetFHsByVBELVs4Grid"}, isArray: true},//已添加的发货单
                saveJointTruck: {method: 'POST', params: {operation: "SaveJointTruck"}},
                getJointTrucks: {method: 'GET', params: {operation: "GetJointTrucks"}},
                isCanUpdate: {method: 'GET', params: {operation: "IsCanUpdate"}},
                deleteJointTruck: {method: 'POST', params: {operation: "DeleteJointTrucks"}},
                jointTruckByVoucherID: {method: 'GET', params: {operation: "JointTruckByVoucherID"}},//得到单据的信息
                writeJointTruckReason: {method: 'GET', params: {operation: "WriteJointTruckReason"}},
                getShippingOrder: {method: 'GET', params: {operation: "GetShippingOrder"}, isArray: true},
                saveVehicleInformation: {method: 'GET', params: {operation: "VehicleInformation"}, isArray: true}
              
            });
            this.saveJointTruck = $resource("/ehs/gate/JointTruck/:operation", {}, {
                save: {method: 'POST', params: {operation: "SaveJointTruck"}}
            });
            this.getGateJointTruckPID = $resource("/gate/GateJointTruck/PID", {
                get: {method: 'GET'}
            })


        }

        GateJointTruck.prototype.JointTruckBasic = function () {
            return this.gateJointTruck;
        };
        GateJointTruck.prototype.GateJointTruckPID = function () {
            return this.getGateJointTruckPID;
        };
        GateJointTruck.prototype.SaveJointTruck = function () {
            return this.saveJointTruck;
        };
        GateJointTruck.prototype.GetGateJointTruckPID = function () {
            return this.getGateJointTruckPID;
        };
        return new GateJointTruck();

    }])


});
