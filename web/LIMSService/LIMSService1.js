/**
 * LIMS Service API
 */
/* global define: false */

define(['app', 'angular'], function (app) {
    app.service('LIMSService', ['$resource', '$q', 'Auth', '$location', '$translate', 'EngineApi', 'Forms',
        function ($resource, $q, Auth, $location, $translate, EngineApi, Forms) {
            function LIMSService() {
                var sourceAPI = '/LIMS/Entrust/:operation';
                this.Entrusted = $resource(sourceAPI, {}, {
                    Create: { method: 'POST', params: { operation: 'Create' } },
                    MRChart: { method: 'POST', params: { operation: 'MRChart' } },
                    SingleTrendChart: { method: 'POST', params: { operation: 'SingleTrendChart' } },
                    DeletePlanAddStatus: { method: 'POST', params: { operation: 'DeletePlanAddStatus' } },
                    DeleteRequisionStatus: { method: 'POST', params: { operation: 'DeleteRequisionStatus' } },
                    GetEntrustVoucher: { method: 'GET', params: { operation: 'GetEntrustVoucher' }, isArray: true },
                    getPropByVoucherID: { method: 'GET', params: { operation: 'getPropByVoucherID' }, isArray: true },
                    CreatePlanAdd: { method: 'POST', params: { operation: 'CreatePlanAdd' } },
                    QueryPlanAdd: { method: 'GET', params: { operation: 'QueryPlanAdd' }, isArray: true },
                    GetDelegateDetailsByVoucherID: { method: 'GET', params: { operation: 'GetDelegateDetailsByVoucherID' }, isArray: true },
                    queryReceives: { method: 'GET', params: { operation: 'QueryReceive' }, isArray: true },
                    ReceiveDetailsByVoucherID: { method: 'GET', params: { operation: 'ReceiveDetailsByVoucherID' }, isArray: true },
                    GetPlans: { method: 'GET', params: { operation: 'GetPlans' }, isArray: true },
                    GetDraft: { method: 'GET', params: { operation: 'GetDraft' }, isArray: true }
                });

                this.gradeVersion = $resource('LIMS/Grades/:operation', {}, {
                    CreateVersion: { method: 'POST', params: { operation: 'Create' } },
                    HistoryGrade: { method: 'GET', params: { operation: 'HistoryGrade' } },
                    GetGradeProcessing: { method: 'GET', params: { operation: 'GradesProcessing' } },
                    getNewestGrade: { method: 'GET', params: { operation: 'NewestGrade' }, isArray: true },
                    DeleteVersion: { method: 'POST', params: { operation: 'DeleteVersion' } },
                    DeleteItemVersion: { method: 'POST', params: { operation: 'DeleteItemVersion' } },
                    QCUser: { method: 'GET', params: { operation: 'QCUser' } },
                    QCLeader: { method: 'GET', params: { operation: 'QCLeader' } },
                    GetGrade: { method: 'GET', params: { operation: 'GetGrade' }, isArray: true },
                    GetCreateVersion: { method: 'GET', params: { operation: 'GetCreateVersion' }, isArray: true },
                    SaveModifyVersion: { method: 'POST', params: { operation: 'SaveModifyVersion' } },
                    UpdateValidData: { method: 'POST', params: { operation: 'ConfirmData' } },
                    GetPropertyValue: { method: 'GET', params: { operation: 'GetPropertyValue' }, isArray: true }
                });

                this.getQCGradesPID = $resource('/lims/QCGrades/PID', {}, {
                    get: { method: 'GET' }
                });
                this.queryPlans = $resource('/ehs/lims/LIMSController/:operation', {}, {
                    getPlans: { method: 'GET', params: { operation: 'GetPlans' }, isArray: true }
                });
                this.POLY21Controller = $resource('/ehs/lims/POLY21Controller/:operation', {}, {
                    getPOLY21Material: { method: 'GET', params: { operation: 'getPOLY21Material' }, isArray: true },
                    showData: { method: 'GET', params: { operation: 'getPOLY21REPORT' }, isArray: true }
                });
                this.SSPDayController = $resource('/ehs/lims/SSPDayController/:operation', {}, {
                    getSSPMaterial: { method: 'GET', params: { operation: 'getSSPMaterial' }, isArray: true },
                    showData: { method: 'GET', params: { operation: 'getSSPDayREPORT' }, isArray: true }
                });
            }
           

            LIMSService.prototype.QCGradesPID = function () {
                return this.getQCGradesPID;
            }
          

            LIMSService.prototype.POLY21Controller = function () {
                return this.POLY21Controller;
            };
            LIMSService.prototype.SSPDayController = function () {
                return this.SSPDayController;
            }
            LIMSService.prototype.GradeVersion = function () {
                return this.gradeVersion;
            }
            LIMSService.prototype.QueryPlans = function(){
                return this.queryPlans;
            };

            LIMSService.prototype.EntrustedInfo = function(){
                return this.Entrusted;
            };
            LIMSService.prototype.SubmitBPM = function (keyname, formVariables, historyVariable, businessKey, callback) {
                var variablesMap = Forms.variablesToMap(formVariables);
                var historyVariableMap = Forms.variablesToMap(historyVariable);
                EngineApi.getKeyId().getkey({
                    'key': keyname
                }, function (res) {
                    var definitionID = res.id;
                    var datafrom = {
                        formdata: variablesMap,
                        businessKey: businessKey,
                        historydata: historyVariableMap
                    };
                    EngineApi.doStart().start({
                        'id': definitionID
                    }, datafrom).$promise.then(function (res) {
                        console.log(res);
                        if (res.result && !res.message) {
                            callback(res.result, '');
                        }
                        else {
                            callback('', res.message)

                        }
                    }, function (errResponse) {
                        callback('', errResponse)

                    });

                });


            }
            return new LIMSService();
        }])

});
