/**
 * Created by ptanh on 4/11/2018. create_joint_voucher
 */
define(['myapp', 'angular'], function (myapp,angular) {
    myapp.directive('createJointVoucher', ['$filter', '$http',
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'uiGridConstants', 'EngineApi', 
        'GateGuest', 'GateJointTruck', '$translate', '$q',
        function ($filter, $http, $routeParams,
            $resource, $location, $interval, Notifications, Forms, Auth, uiGridConstants,
            EngineApi, GateGuest, GateJointTruck, $translate, $q) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                  
                    // var shippingorder = [];
                    /**
                     *reset data function
                     */
                    $scope.onReset  =   function () {
                        // shippingorder = [];
                        $scope.note = {};
                        $scope.vouchergridOptions.data = [];
                    }
                    /**
                     *check vehicle into Vehicle black list
                     */
                    function IsBlackList() {
                        var deferred = $q.defer();
                        GateJointTruck.JointTruckBasic().isInBlackList({vehicle: $scope.note.VehicleNO, type: 'Truck'}).
                            $promise.then(function (res) {
                                if (res.msg) {
                                    deferred.reject(res.msg);
                                } else {
                                    deferred.resolve();
                                }

                            }, function (error) {
                                deferred.reject(error);
                            });
                        return deferred.promise;
                    }
                    /**
                     *checking Shipping Order is Valid or invalid
                     */
                    function getShippingOrders(pageStatus,ShippingOrder,Trantype,MaterielType,CompanyCode){
                        var deffered = $q.defer();
                      
                        GateJointTruck.JointTruckBasic().getShippingOrders({
                            vs: ShippingOrder,
                            VoucherID: '',
                            PageStatus: pageStatus,//'New',
                            mType: MaterielType || '',
                            companycode: CompanyCode
                        }).$promise.then(function (res) {
                            if (res.msg == '') {
                                //VH

                                if($scope.userinfo.Company=='VH')
                                {
                                    GateJointTruck.JointTruckBasic().getFHsByVBELVs4Grid({vs: ShippingOrder
                                    }).$promise.then(function (vhres) {
                                        deffered.resolve(vhres[0]);
                                        // $scope.vouchergridOptions.data = vhres;

                                    }, function (errResponse) {
                                        deffered.reject(errResponse);
                                    });
                                }else{
                                    //VC
                                    GateJointTruck.JointTruckBasic().getShippingOrder({
                                        Outno: ShippingOrder,
                                        Trantype: Trantype
                                    }).$promise.then(function (res) {
                                        if (res[0].ErrMsg == '') {
                                            deffered.resolve(res[0]);
                                        }
                                        else {
                                            deffered.reject(res[0].ErrMsg);
                                        }
                                    }, function (error) {
                                        deffered.reject(error);
                                    });

                                }

                               

                            }
                            else {
                               
                                deffered.reject(res.msg);
                            }
                        }, function (errResponse) {
                           
                            deffered.reject(errResponse);
                        });
                        return deffered.promise;
                    }
                    
                    /**
                     *Save into Shipping grid
                     */
                    $scope.saveSO = function () {

                        var pageStatus='New'; //Update
                        var items= $scope.vouchergridOptions.data||[];
                        for (var i = 0; i < items.length; i++) {
                            console.log(items[i]['ShippingOrder']);//发货单
                            if ($scope.ShippingOrder == items[i]['ShippingOrder']) {
                                $scope.ShippingOrder = '';
                                Notifications.addError({'status': 'error', 'message':$translate.instant('ShippingDuplicate') });
                               
                                return;
                            }
                        }
                        var promise= getShippingOrders(pageStatus,$scope.ShippingOrder,$scope.Trantype,$scope.MaterielType||'',$scope.userinfo.Company)
                      
                        promise.then(function(res){
                            var so = {};

                            if($scope.userinfo.Company=='VH')
                            {
                                so.ShippingOrder = res.VBELN;
                                so.Direction = res.Direction;
                                so.MaterialSpc = res.AB;
                                so.Stamp = $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss');
                                so.STREET=res.STREET;
                                so.Plant =res.Plant;
                                so.CustomerName=res.CustomerName;
                                so.CenterID=res.CenterID;
                                so.DirectionSPC= res.DirectionSPC;
                                so.WADAT= res.WADAT;

                            }else{
                                so.ShippingOrder = res.OUTNO;
                                so.Direction = res.DIRECTION;
                                so.MaterialSpc = res.UNICODE;
                                so.PRquan = res.PRQUAN;
                                so.Requan = res.REQUAN;
                                so.Unit = res.unit;
                                so.Isprn = res.isprn;
                                so.Stamp = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');
                            }

                            $scope.vouchergridOptions.data.push(so);
                            $scope.ShippingOrder = '';
                        },function(error){
                            Notifications.addError({'status': 'error', 'message': error});
                        })
                    };
                    /**
                     *Delete the row was selected on Shipping grid
                     */
                    $scope.delOrder = function () {
                        var selectRows = $scope.ordergridApi.selection.getSelectedGridRows();
                        for (var i = 0; i < $scope.vouchergridOptions.data.length; i++) {
                            if ($scope.vouchergridOptions.data[i].ShippingOrder == selectRows[0].entity.ShippingOrder) {
                                $scope.vouchergridOptions.data.splice(i, 1);
                                break;
                            }
                        }
                    };
                    function saveTransfer(shippingorder, callback) {
                        var outTime = $filter('date')($scope.note.ExpectIn, 'HHmm');
                        GateJointTruck.JointTruckBasic().saveVehicleInformation({
                            orders: shippingorder,
                            GDELINO: $scope.note.TransferCompany,
                            TRUCKNO: $scope.note.VehicleNO,
                            CDRIVER: $scope.note.Driver,
                            OUTTIME: outTime
                        }).$promise.then(function (res) {
                            callback('')
                        }, function (errResponse) {
                            callback(errResponse)
                        });
                    }
                    /**
                     *Save data function
                     */
                    function saveDraft(status){
                        var deferred = $q.defer();
                        var promise = IsBlackList();
                        promise.then(function () {
                            var savepromise =SaveJointTruckVoucher(status);
                            savepromise.then(function (voucherID) {
                                $scope.note.VoucherID = voucherID;
                                deferred.resolve(voucherID);
                            },function(error){
                                deferred.reject(error);
                            })
                        },function(error){
                            deferred.reject(error)
                        })
                        return deferred.promise;
                    }
                    /**
                     *Save data function
                     */
                    function SaveJointTruckVoucher(Status) {
                        var deferred = $q.defer();
                        var query = {};
                        query = $scope.note;
                        query.UserID = Auth.username;
                        query.Status = Status;
                        query.Driver = $scope.note.Driver || '';
                        query.DriverPhone = $scope.note.DriverPhone || '';
                        query.Remark == $scope.note.Remark || '';
                        query.JointTruckItems = $scope.vouchergridOptions.data||'';
                        if(!$scope.userinfo.Company){
                            deferred.reject('Company is null');
                            
                        }else{
                            query.CompanyCode=$scope.userinfo.Company;
                            var shippingOrders=[];
                            for (var i = 0; i < query.JointTruckItems.length; i++) {
                                console.log(query.JointTruckItems[i]['ShippingOrder']);//发货单
                                shippingOrders.push(query.JointTruckItems[i]['ShippingOrder']);
                            }
                            query.ShippingOrder = shippingOrders.join(',');
                            GateJointTruck.SaveJointTruck().save(query).$promise.then(function (res) {
                                var voucherid = res.VoucherID;
                                if (voucherid) {
                                    deferred.resolve(voucherid);
                                } else {
                                    deferred.reject('No voucherID');
                                }
                            }, function (errResponse) {
                                deferred.reject(errResponse);
                            });
                        }
                        return deferred.promise;
                    }
                    /**
                     * create data for BPMN service
                     */
                    function CommonParastFiled(voucherid) {
                        var formVariables = [];
                        var historyVariable = [];
                        formVariables.push({name: 'start_remark',value: $scope.note.VoucherID + $scope.note.MaterielType});
                        formVariables.push({name: 'VoucherID', value: voucherid});
                        formVariables.push({name: 'start_endDate',value: moment($scope.note.ValidatePeriod).add(1, 'days').format('YYYY-MM-DD')});
                        formVariables.push({name: 'JWUser', value: 'Guard'});
                        formVariables.push({name: 'IsChecker', value: 'NO'});
                        historyVariable.push({name: 'start_remark',value: $scope.note.VoucherID + $scope.note.MaterielType});
                        historyVariable.push({name: 'VoucherID', value: voucherid});
                        historyVariable.push({name: 'start_endDate',value: moment($scope.note.ValidatePeriod).add(1, 'days').format('YYYY-MM-DD')});
                        historyVariable.push({name: 'JWUser', value: 'Guard'});
                        historyVariable.push({name: 'IsChecker', value: 'NO'});
                        return {'formVariables': formVariables, 'historyVariable': historyVariable}
                    }
                    /**
                     * Push data to BPMN service
                     */
                    function submitJoinTruck(voucherID) {
                        var variablesMap={};
                        var formfiled = CommonParastFiled(voucherID);
                        variablesMap = Forms.variablesToMap(formfiled.formVariables);
                        var _historyVariable = Forms.variablesToMap(formfiled.historyVariable);
                        var datafrom = {
                            formdata: variablesMap,
                            businessKey: voucherID,
                            historydata: _historyVariable
                        };
                        var deferred = $q.defer();
                        EngineApi.doStart().start({'id': $scope.definitionID}, datafrom).$promise.then(function (processres) {
                            if (processres.message) {
                                deferred.reject(processres.message);
                            } else {
                                deferred.resolve(voucherID);
                            }

                        }, function (error) {
                            deferred.reject(error);
                        });
                        return deferred.promise;
                    }
                    /**
                     * Save Draft
                     */
                    $scope.savedraft = function () {
                        var savepromise=saveDraft('N');
                        savepromise.then(function(result){
                            $('#myModal').modal('hide');
                            $scope.Search();
                            // Notifications.addMessage({'status': 'info', 'message': 'Success: ' + result});
                        },function(error){
                            Notifications.addError({'status': 'error', 'message': error});
                        })
                    };
                    function IsJOBVar(voucherID,status,validatePeriod,nowValidatePeriod){
                        var deferred = $q.defer();
                        if (status != 'N') {
                            if(validatePeriod ===nowValidatePeriod){
                                deferred.resolve();
                            }else{
                                var proID =getProcessInstanceId(voucherID);
                                proID.then(function(pid){
                                    if(pid){
                                        var jobpro=getJobID(pid);
                                        jobpro.then(function(jobid){
                                            if(jobid){
                                                var startend=moment($scope.note.ValidatePeriod).add(1, 'days').format('YYYY-MM-DD');
                                                var varpro=UpdateJobVar(jobid,startend);
                                                varpro.then(function(){
                                                    deferred.resolve();
                                                },function(error){
                                                    deferred.reject(error);
                                                })
                                            }else{
                                                deferred.resolve();
                                            }

                                        },function(error){
                                            deferred.reject(error);
                                        })
                                    }else{
                                        deferred.resolve();
                                    }
                                }, function (error) {
                                    deferred.reject(error);
                                });
                            }
                        }   
                        else{
                            deferred.resolve();
                        }
                        return deferred.promise;
                    }
                    /**
                     * Submit dont have leader check
                     */
                    $scope.savesubmit = function () {
                        if(!$scope.note.VoucherID){
                            var savepromise= saveDraft('N');
                            savepromise.then(function(result){
                                var submitPromise = submitJoinTruck(result);
                                submitPromise.then(function (submitResult) {
                                    if(submitResult){
                                        $scope.vouchergridOptions.data = [];
                                        Notifications.addError({'status': 'info', 'message': 'Create Success'});
                                    }
                                },function(error){
                                    Notifications.addError({'status': 'error', 'message': error});
                                })
    
                            },function(error){
                                Notifications.addError({'status': 'error', 'message': error});
                            })
                        }else{
                            GateJointTruck.JointTruckBasic().jointTruckByVoucherID({voucherid: $scope.note.VoucherID}).$promise.then(function (res) {
                                var status=res.Status;
                                var preValidatePeriod= $filter('date')(res.ValidatePeriod, 'yyyy-MM-dd');                           
                                if (status != $scope.note.Status) {
                                    Notifications.addError({'status': 'error', 'message': 'Please refresh first！'});
                                    return;
                                }else{
                                    var savepromise =SaveJointTruckVoucher(status);
                                    savepromise.then(function (voucherID) {
                                        //  if(preValidatePeriod!==$scope.note.ValidatePeriod)
                                        //{
                                        var jobpromiss=  IsJOBVar(voucherID,status,preValidatePeriod,$scope.note.ValidatePeriod);
                                        jobpromiss.then(function(){
                                            if(status !='N')
                                            {
                                                $('#myModal').modal('hide');
                                                $scope.Search();
                                            }else{
                                                //it is draf ,need commite workflow  
                                                var submitPromise = submitJoinTruck(voucherID);
                                                submitPromise.then(function (submitResult) {
                                                    if(submitResult){
                                                        Notifications.addError({'status': 'info', 'message': 'Create Success'});
                                                        $('#myModal').modal('hide');
                                                        $scope.Search();
                                                    }
                                                },function(error){
                                                    Notifications.addError({'status': 'error', 'message': error});
                                                })
                                            }
                                        })
                                    },function(error){
                                        Notifications.addError({'status': 'error', 'message': error});
                                    })
                                }
                            });
                        }
                      
                      
                    };
                    /**
                     * ng-keydown for ShippingOrder
                     */
                    $scope.ngkeyDown=function(event){
                        if (event.which === 13){
                            $scope.saveSO();
                        }
                    }
                    /**
                     * modify job datetime
                     * @param {*} jobid 
                     * @param {*} duedate 
                     */
                    function UpdateJobVar(jobid,duedate){
                        var deferred=$q.defer();
                        EngineApi.DoJob().duedate({id: jobid}, {'duedate': $filter('date')(duedate, 'yyyy-MM-ddTHH:mm:ss')}).$promise.then(function (conres) {
                            deferred.resolve('');
                        }, function (errResponse) {
                            deferred.reject(errResponse);
                        });
                        return deferred.promise;
                    }
                    /**
                     * get JOBID
                     * @param {*} pid 
                     */
                    function getJobID(pid){
                        var deferred=$q.defer();
                        EngineApi.DoJob().getList({processInstanceId: pid}).$promise.then(function (res) {
                            if (res.length > 0) {
                                //var jobid = res[0].id;
                                deferred.resolve(res[0].id);
                            } else {                    
                                deferred.resolve(''); 
                            }
                        }, function (errResponse) {
                            deferred.reject(errResponse);
                        });
                        return deferred.promise;
                    }
                    /**
                     *  get PID
                     */
                    function getProcessInstanceId(voucherid) {
                        var deferred=$q.defer();
                        GateJointTruck.GetGateJointTruckPID().get({
                            VoucherID: voucherid,
                            activityId: 'StartGateJointTruck'
                        }).$promise.then(function (res) {
                            if (!res.ProcessInstanceId) {
                                deferred.reject('get PID  failed.');
                            } else {
                                deferred.resolve(res.ProcessInstanceId);
                            }
                        }, function (errormessage) {
                            deferred.reject(errormessage);
                        });
                        return deferred.promise;
                    }
                },
                templateUrl: './forms/GateJointTruck/createJointTruck.html'
            }


        }]);

});