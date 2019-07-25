/**
 * Created by ptanh on 4/14/2018.
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createVisitorVoucher', ['$filter', '$http',
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'uiGridConstants', 'EngineApi', 'GateUnJointTruck',
        'GateGuest', 'GateJointTruck', '$translate', '$q',
        function ($filter, $http, $routeParams,
            $resource, $location, $interval, Notifications, Forms, Auth, uiGridConstants,
            EngineApi, GateUnJointTruck, GateGuest, GateJointTruck, $translate, $q) {
            return {
                restrict: 'E',
                controller: function ($scope) {
                    $scope.flowkey='FEPVGateGuest';
                    $scope.username = Auth.username;
                    var formVariables = [];
                    var historyVariable = [];
                    var variablesMap = {};
                    formVariables = $scope.formVariables = [];
                    historyVariable = $scope.historyVariable = [];
                    /**
                     * Init Data to save
                     */
                    function saveInitData(status){
                        var note = {};
                        note.VoucherID = $scope.recod.start_voucherid || '';
                        note.Content = $scope.recod.start_reason;
                        note.IsNeedConfirm = $scope.recod.start_kind == '2'? false:true;
                        note.GuestType = $scope.recod.start_kind;
                        note.Region = $scope.recod.start_area;
                        note.Respondent = $scope.recod.start_code.toUpperCase();
                        note.DepartmentSpc = $scope.recod.DepartmentSpc;
                        note.ExtNO = $scope.recod.start_phone;
                        note.Enterprise = $scope.recod.start_company;
                        note.ExpectIn = $scope.recod.start_date;
                        note.UserID = Auth.username;
                        note.Status = status;
                        for (var i = 0; i < $scope.guestItems.length; i++) {
                            if ($scope.guestItems[i].IdCard == '' || !$scope.guestItems[i].IdCard) {
                                $scope.guestItems[i].IdCard = i;
                            }
                        }
                        note.GuestItems = $scope.guestItems;
                        note.ExpectOutTime = $scope.recod.ExpectOutTime;
                        note.VehicleNo = $scope.recod.VehicleNo;
                        return note;
                    }

                    /**
                     * Save Voucher
                     */
                    function SaveGuestVoucher(data){
                        var deferred =$q.defer();
                        GateGuest.SaveGuest().save(data).$promise.then(function (res) {
                            if (res.VoucherID) {
                                $scope.recod.start_voucherid = res.VoucherID;
                                deferred.resolve(res.VoucherID);
                            }
                        }, function (error) {
                            deferred.reject(error)
                        });
                        return deferred.promise;
                    }

                    /**
                     * Save Draft
                     */
                    $scope.saveDraft = function () {
                        var note = saveInitData('N');
                        var savepromise=SaveGuestVoucher(note);
                        savepromise.then(function(res){
                            $scope.recod.start_voucherid = res;
                            Notifications.addMessage({'status': 'info', 'message': $translate.instant('saveSuccess')});
                        },function(error){
                            Notifications.addError({'status': 'error', 'message': $translate.instant('saveError') + error});
                        })
                    };
                    /**
                     *trigger modal cancel
                     */
                    $scope.modalCancel = function () {
                        var note = saveInitData('N');
                        var savepromise=SaveGuestVoucher(note);
                        savepromise.then(function(res){
                            $scope.recod.start_voucherid = res;
                            Notifications.addMessage({'status': 'information', 'message': $translate.instant('saveSuccess')});
                            $scope.Search();
                            $('#myModal').modal('hide');
                            $('#messageModal').modal('hide');
                            $('#nextModal').modal('hide');
                        },function(error){
                            Notifications.addError({'status': 'error', 'message': $translate.instant('saveError') + error});
                        })


                    };
                    /**
                     * trigger modal submit
                     */
                    $scope.modalSubmit = function () {
                        var note = saveInitData('F');
                        var savepromise=SaveGuestVoucher(note);
                        savepromise.then(function(res){
                            var submitpromise= submitGateGuest(res);
                            submitpromise.then(function(res){
                                if(res){
                                    $scope.Search();
                                    $('#myModal').modal('hide');
                                    $('#messageModal').modal('hide');
                                    $('#nextModal').modal('hide');
                                }
                            },function(error){
                                Notifications.addError({'status': 'error', 'message': $translate.instant('saveError') + error});
                            })
                        },function(error){
                            Notifications.addError({'status': 'error', 'message': $translate.instant('saveError') + error});
                        })

                    }
                    /**
                     *submit Gate Guest
                     */
                    function submitGateGuest(voucherID) {
                        var formfiled = CommonParastFiled();
                        variablesMap={};
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
                     * Init variable for BPMN
                     */
                    function CommonParastFiled() {
                        formVariables = [];
                        var confirm=$scope.recod.start_kind == '2'? 'NO':'YES';
                        formVariables.push({name: 'VoucherID', value:  $scope.recod.start_voucherid});
                        formVariables.push({name: 'start_date', value:  moment($scope.recod.start_date).format('YYYY-MM-DD')});
                        formVariables.push({name: 'GuestChecherArray', value: $scope.checkList});
                        formVariables.push({name: 'start_kind', value:  $scope.recod.start_kind});
                        formVariables.push({name: 'start_reason', value:  $scope.recod.start_reason});
                        formVariables.push({name: 'start_endDate', value: moment($scope.recod.start_date).add(1, 'days').format('YYYY-MM-DD')});
                        formVariables.push({name: 'IsChecker', value: confirm});
                        formVariables.push({name: 'start_confirm', value: confirm});
                        formVariables.push({name: 'start_area', value: $scope.recod.start_area});
                        formVariables.push({name: 'JWUser', value: 'Guard'});
                        historyVariable = $scope.historyVariable;
                        return {'formVariables': formVariables, 'historyVariable': historyVariable}
                    }

                    /**
                     * save submit voucher
                     */
                    $scope.savesubmit = function () {
                        var note = saveInitData('F')
                        var kinds = note.Region + '|' + note.GuestType;
                        GetBPMCheckers($scope.username,$scope.flowkey,kinds,note.ExpectIn);

                        if ($scope.recod.start_area == '2') {
                            $('#nextModal').modal('show');
                        }
                        if ($scope.recod.start_area == '1') {
                            $('#messageModal').modal('show');

                        }


                    };
                    /**
                     * get Leader check
                     */
                    function GetBPMCheckers(username,flowkey,kinds,checkDate) {
                        GateGuest.GetGateCheckers().getCheckers({
                            owner: username,
                            fLowKey: flowkey,
                            Kinds: kinds || '',
                            CheckDate: checkDate || NaN
                        }).$promise.then(function (leaderlist) {

                            var checkList = [];
                            for (var i = 0; i < leaderlist.length; i++) {
                                checkList[i] = leaderlist[i].Person;

                            }
                            $scope.checkList = checkList;
                            $scope.leaderlist = leaderlist;

                        }, function (errormessage) {
                            console.log(errormessage);
                        })
                    }

                },
                templateUrl: './forms/GateGuest/createVisitorVoucher.html'
            }
        }]);
});