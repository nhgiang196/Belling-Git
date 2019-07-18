/**
 * Created by wang.chen on 2016/11/16.
 */

define(['app', 'angular'], function (app, angular) {
    app.service('GateUnJointTruck', ['$resource', '$q', 'Auth', '$location', function ($resource, $q, Auth, $location) {
        function GateUnJointTruck() {
            this.gateUnJointTruck = $resource('/ehs/gate/UnJointTruck/:operation', {}, {
                getVehicleTypes: {method: 'GET', params: {operation: 'GetVehicleTypes'}, isArray: true},
                //   saveUnJointTruck:{method:'POST',params:{operation:"SaveUnJointTruck"}}, there is a bug
                unJointTruckByVoucherID: {method: 'GET', params: {operation: 'UnJointTruckByVoucherID'}},
                getUnJointTrucks: {method: 'GET', params: {operation: 'GetUnJointTrucks'}},
                deleteUnJointTruck: {method: 'POST', params: {operation: 'DeleteUnJointTrucks'}},
                getLevelType: {method: 'GET', params: {operation: 'GetLevelType'}, isArray: true},
                getVehicleTransfer: {method: 'GET', params: {operation: 'VehicleTransfer'}, isArray: true},
                //CheckContainerisExist:{method:'GET',params:{operation:"CheckContainerisExist"}},
                isExistByVehicleNoandMaterial: {method: 'GET', params: {operation: 'isExistByVehicleNoandMaterial'}},
                getVehicleData: {method: 'GET', params: {operation: 'VehicleTransfer_New'}},
                updateUnJointTruckStatus: {method: 'PUT', params: {operation: 'UpdateUnJointTruckStatus'}},
                updateUnJointTruckVehicleNo: {method: 'PUT', params: {operation: 'UpdateVehicleContainer'}},
                getOldContainerNO: {method: 'GET', params: {operation: 'GetOldContainerNO'}, isArray: true}
            });
            this.saveUnJoint = $resource('/ehs/gate/UnJointTruck/:operation', {}, {
                save: {method: 'POST', params: {operation: 'SaveUnJointTruck'}}
            });

            this.saveUnJointList = $resource('/ehs/gate/UnJointTruck/:operation', {}, {
                save: {method: 'POST', params: {operation: 'SaveUnJointTruckList'}}
            });
            this.getGateUnjointTruckPID = $resource('/gate/GateUnjointTruck/PID', {
                get: {method: 'GET'}
            });

        }

        GateUnJointTruck.prototype.UnJointTruckBasic = function () {
            return this.gateUnJointTruck;
        };
        GateUnJointTruck.prototype.SaveUnJointTruck = function () {
            return this.saveUnJoint;
        };
        GateUnJointTruck.prototype.SaveUnJointList = function () {
            return this.saveUnJointList;
        };
        GateUnJointTruck.prototype.GetGateUnjointTruckPID = function () {
            return this.getGateUnjointTruckPID;
        };
        return new GateUnJointTruck();

    }])


});
