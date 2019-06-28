/**
 * 
 * create guest, guest of truck user ,it don't need leader check 
 * 
 * 
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('guestUser', ['$filter', '$http', 
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'EngineApi',
        'GateGuest', '$translate','$q',
        function ($filter, $http, $routeParams,
            $resource, $location, $interval, Notifications, Forms, Auth, 
            EngineApi, GateGuest,$translate,$q) {
            return{
                restrict: 'E',
                controller: function ($scope) {
                    var lang = window.localStorage.lang||'EN';
                    $scope.recod={};
                    $scope.guestItems=[];
                    $scope.GuestWorkflow='FEPVGateGuest';//workflow name
                    /**
                     * get guest defined key
                     */
                    function GuestDefineKey(){
                        var deferred = $q.defer();
                        EngineApi.getKeyId().getkey({'key': $scope.GuestWorkflow}).$promise.then(function (FlowDefinition) {
                            if (FlowDefinition.id) {
                                deferred.resolve(FlowDefinition.id);
                            } else {
                                deferred.reject('get workflow key is error.');
                            }
                        })
                        return deferred.promise;
                    }
                    /**
                     * get guest type
                     */
                    GateGuest.GuestBasic().getGuestType({ language: lang }).$promise.then(function (res) {
                        $scope.kind = res;
                        $scope.start_kind=res[1].ID;
                    }, function (errResponse) {
                        Notifications.addError({ 'status': 'error', 'message': errResponse });
                    });
                    GateGuest.GuestBasic().getGuestRegions({ language: lang }).$promise.then(function (res) {
                        $scope.regions = res;
                        $scope.start_area=res[0].ID;
                    }, function (errResponse) {
                        Notifications.addError({ 'status': 'error', 'message': errResponse });
                    });

                    $scope.searchEmployeeInfo = function () {
                        if (document.getElementById('EmployeeName').readOnly != false) {
                            document.getElementById('EmployeeName').readOnly = false;
                            document.getElementById('EmployeeID').readOnly = true;
                            $scope.recod.start_code = '';
                        } else {
                            document.getElementById('EmployeeID').readOnly = false;
                            document.getElementById('EmployeeName').readOnly = true;
                        }
                    }
                    $scope.$watch('recod.start_code', function(n) {
                        if (n !== undefined ) {
                            if (n.length == 10) {
                                var query = {};
                                query.UserID = Auth.username;
                                query.EmployeeID = n;
                                GateGuest.GuestBasic().getNameByEmployeeID(query).$promise.then(function(res) {
                                    $scope.recod.start_name = res[0].Name;
                                    $scope.recod.DepartmentSpc = res[0].Specification;
                                }, function(errResponse) {
                                    Notifications.addError({ 'status': 'error', 'message': errResponse });
                                });
                            } else {
                                $scope.recod.start_name = '';
                            }
                        }
                    });
                    $scope.addGuestItemG = function() {
                        if ($scope.gd != null || $scope.gd != {}) {
                            $scope.guestItems.push($scope.gd);
                            $scope.gd = {};
                        }
                    };
                    $scope.deleteGuestItemG = function(index) {
                        $scope.guestItems.splice(index, 1);
            
                    };
                    /**
                     * assignment for data model
                     */
                    function ModelInit(){
                        var dateObj = {};
                        var note = {};
                        note.VoucherID = $scope.recod.start_voucherid || '';
                        note.Content = $scope.recod.start_reason;
                        if ($scope.start_kind == '2') { //SaveGuest
                            note.IsNeedConfirm = false;
                            dateObj.confirm = 'NO'
                        } else {
                            note.IsNeedConfirm = true;
                            dateObj.confirm = 'YES'
                        }

                        note.GuestType = $scope.start_kind;
                        note.Region = $scope.start_area;
                        var employeeID = $scope.recod.start_code;
                        note.Respondent = employeeID.toUpperCase();
                        note.DepartmentSpc = $scope.recod.DepartmentSpc;
                        note.ExtNO = $scope.recod.start_phone;
                        note.Enterprise = $scope.recod.start_company;
                        note.ExpectIn = $scope.recod.start_date;
                        note.UserID = Auth.username;
                      
                        for (var i = 0; i < $scope.guestItems.length; i++) {
                            if ($scope.guestItems[i].IdCard === '' || !$scope.guestItems[i].IdCard) {
                                $scope.guestItems[i].IdCard = i;
                            }
                        }
                        note.GuestItems = $scope.guestItems;
                        note.ExpectOutTime = $scope.recod.ExpectOutTime;
                        note.VehicleNo = $scope.recod.VehicleNo;
                        dateObj.note = note;
                        return dateObj;
                       
                    }
                    /**
                     * sumbit data  and create processing workflow
                     * @param {*voucherid for bussiness key} voucherID 
                     * @param {*data model} dateObj 
                     */
                    function GuestSubmit(voucherID,dateObj){
                        var outputdate = moment($scope.recod.start_date).add(1, 'days').format('YYYY-MM-DD');
                        var deferred = $q.defer();
                        var formfiled = GuestParastFiled([], voucherID, outputdate, dateObj);
                        var variablesMap = Forms.variablesToMap(formfiled.formVariables);
                        var _historyVariable = Forms.variablesToMap(formfiled.historyVariable);
                        var datafrom = {
                            formdata: variablesMap,
                            businessKey: voucherID,
                            historydata: _historyVariable
                        };
                        EngineApi.doStart().start({ 'id': $scope.GuestdefinitionID }, datafrom).$promise.then(function (processres) {
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
                    $scope.saveGuestsubmit = function() {
                        //kinds for checker ,truck guest don't leader checker
                        //var kinds = $scope.recod.start_area + '|'+ $scope.start_kind;
                        var keypromise = GuestDefineKey() 
                        keypromise.then(function(keyres) {
                            $scope.GuestdefinitionID=keyres;
                            var dateObj = ModelInit();
                            var promise = SaveGuest(dateObj.note); 
                            promise.then(function(voucherID) {
                                var submitPromise = GuestSubmit(voucherID,dateObj); 
                                submitPromise.then(function() {
                                    $scope.clear();
                                }, function(submitReason) {
                                    Notifications.addError({'status': 'error', 'message': submitReason});
                                })
                            }, function(reason) {
                                Notifications.addError({'status': 'error', 'message': reason});
                            })
                        }, function (error) {
                            Notifications.addError({'status': 'error', 'message': 'Get WORKFLOW KEY: ' + error});
                        });
                       
                    }
                    /**
                     * write processing and history log
                     * @param {leader checker } leaderList 
                     * @param {guest planid*} voucherID 
                     * @param {validate end} outputdate 
                     * @param {model data} dateObj 
                     */
                    function GuestParastFiled(leaderList,voucherID,outputdate,dateObj){
                        var formVariables = [];
                        var historyVariable=[];
                        formVariables.push({name: 'VoucherID', value: voucherID});
                        //$scope.formVariables.push({name: "GuestChecherArray", value: leaderList});
                        formVariables.push({name: 'start_endDate', value: outputdate});
                        formVariables.push({name: 'IsChecker', value: dateObj.confirm});
                        formVariables.push({name: 'start_confirm', value: dateObj.confirm});
                        formVariables.push({name: 'start_area', value: dateObj.note.Region});
                        formVariables.push({name: 'JWUser', value: 'Guard'});
                        formVariables.push({name: 'start_date', value: dateObj.note.ExpectIn});
                        formVariables.push({name: 'start_kind', value: dateObj.confirm});
                        formVariables.push({name: 'start_reason', value:dateObj.note.Content||''});
                        formVariables.push({name: 'ExpectOutTime', value: dateObj.note.ExpectOutTime});
                        formVariables.push({name: 'VehicleNo', value: dateObj.note.VehicleNo});

                        historyVariable.push({name:'VoucherID',value:voucherID});
                        historyVariable.push({name:'IsChecker',value:dateObj.confirm});
                        historyVariable.push({name:'GuestType',value:dateObj.note.GuestType});
                        historyVariable.push({name:'Respondent',value:dateObj.note.Respondent});
                        historyVariable.push({name:'DepartmentSpc',value:dateObj.note.DepartmentSpc});
                        historyVariable.push({name:'ExpectIn',value:dateObj.note.ExpectIn});
                        return {'formVariables':formVariables,'historyVariable':historyVariable}
                    }
                    /**
                     * save Guest info
                     * @param {*guest model} note 
                     */
                    function SaveGuest(note) {
                        var msg=checkErr();
						var deferred = $q.defer();
                        if(msg){
                            deferred.reject(msg);
                        }else{
                            var deferred = $q.defer();
                            GateGuest.SaveGuest().save(note).$promise.then(function (res) {
                                var voucherid = res.VoucherID;
                                if (voucherid) {

                                    deferred.resolve(voucherid);
                                } else {
                                    deferred.reject($translate.instant('saveError'))
                                }
                            }, function (errormessage) {
                                deferred.reject(errormessage);
                            });
                        }
                        
                        return deferred.promise;
                    }
                
                    $scope.clear=function(){
                        $scope.recod= {};
                        $scope.guestItems=[];
                        $('#myGuestModal').modal('hide');
                    }
                    /**
                     * 
                     */
                    function checkErr() {
                        var startDate =  $scope.recod.start_date;
                        var endDate = $scope.recod.ExpectOutTime;
                        if (new Date(startDate) > new Date(endDate)) {
                            return 'End Date should be greater than Start Date';      
                        }else{
                            return '';
                        }
                    }
                   
                },
                templateUrl: './forms/GateUnjointTruck/GuestModelTemplate.html'
            }
        
        
        }]);       
        
})