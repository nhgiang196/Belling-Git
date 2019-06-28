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
                    GetMaterialOfPlans: { method: 'GET', params: { operation: 'GetMaterialOfPlans' }, isArray: true },
                    GetDraft: { method: 'GET', params: { operation: 'GetDraft' }, isArray: true },
                    GetReport: { method: 'GET', params: { operation: 'GetData4ReportSSPnPoly' } },
                    GetAnalysisQuery: { method: 'GET', params: { operation: 'GetAnalysisQuery' }, isArray: true },
                    IsNew_EntrustedVoucher_General: { method: 'GET', params: { operation: 'IsNew_EntrustedVoucher_General' } }, //check status of 'SP' enstrued vouchers and return true if it is true
                    UpdateStatus_EntrustedVoucher_General: { method: 'GET', params: { operation: 'UpdateStatus_EntrustedVoucher_General' } }, // udpate status of a 'SP' entrusted voucher
                    GetReportByVoucherID: { method: 'GET', params: { operation: 'GetReportByVoucherID' }, isArray: true },
                    GetEntrustDepartment: { method: 'GET', params: { operation: 'GetEntrustedDepartment' }, isArray: true },
                    GetOverGradeChart: { method: 'GET', params: { operation: 'GetOverGradeChart' } },

                });

                this.ISOQualify = $resource('/LIMS/ISO/:operation', {}, {
                    CreateVoucher: { method: 'POST', params: { operation: 'CreateVoucher' } },
                    UpdateRYVoucher: { method: 'GET', params: { operation: 'UpdateRYVoucher' } }, //userID voucherID reason solution prevention  (only headers) 
                    UpdateSubmittedVoucher: { method: 'GET', params: { operation: 'UpdateSubmittedVoucher' } }, //update status with detail added and notification
                    SendReminder: { method: 'GET', params: { operation: 'SendReminder' } }, //update status with detail added and notification
                    SearchRYVouchers: { method: 'GET', params: { operation: 'SearchRYVoucher' }, isArray: true }, //search
                    GetNewRYVoucher: { method: 'GET', params: { operation: 'GetRYVoucher' } }, //get by ID the voucher with status N
                    GetDetailReport: { method: 'GET', params: { operation: 'GetDetailReport' }, isArray: true }, //get report printQualifed
                    GetAllUQReport: { method: 'GET', params: { operation: 'GetAllUQReport' }, isArray: true }, //get monthlyreport
                    DetailExport: { method: 'GET', params: { operation: 'DetailExport' }, isArray: true } //get List of details

                });
                this.DeleteVoucher = $resource("/LIMS/ISO/DeleteVoucher", {}, {
                    save: { method: 'PUT' }
                });
                this.gradeVersion = $resource('LIMS/Grades/:operation', {}, {
                    CreateVersion: { method: 'POST', params: { operation: 'Create' } },
                    HistoryGrade: { method: 'GET', params: { operation: 'HistoryGrade' } },
                    HistoryOfGradeVersion: { method: 'GET', params: { operation: 'HistoryOfGradeVersion' }, isArray: true },
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
                    GetPropertyValue: { method: 'GET', params: { operation: 'GetPropertyValue' }, isArray: true },
                    GetCurrentPropertyValue: { method: 'GET', params: { operation: 'GetCurrentPropertyValue' }, isArray: true }, //created by Jang 2019-01-19
                    UpdateCurrentGradeStatus: { method: 'POST', params: { operation: 'UpdateCurrentGradeStatus' } }, //Create by Isaac in 31-10-2018
                    CanUpdateGrades: { method: 'GET', params: { operation: 'CanUpdateGrades' }, isArray: true }

                });

                this.getQCGradesPID = $resource('/lims/QCGrades/PID', {}, {
                    get: { method: 'GET' }
                });
                this.getQCOverGradesPID = $resource('/lims/QCOverGrade/PID', {}, {
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

            // //Create by Isaac in 31-10-2018
            LIMSService.prototype.UpdateCurrentGradeStatus = function (query, callback) {
                console.log(query);
                this.gradeVersion.UpdateCurrentGradeStatus(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }
            /**
             * Create by Isaac 07-11-2018
             * check for Exist Department in Lab
             */
            LIMSService.prototype.CanUpdateGrades = function (query, callback) {
                console.log(query);
                this.gradeVersion.CanUpdateGrades(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            LIMSService.prototype.CreateRYVoucher = function (query, callback) {
                console.log(query);
                this.ISOQualify.CreateVoucher(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }
            LIMSService.prototype.DeleteRYVoucher = function () {
                return this.DeleteVoucher;
            }

            LIMSService.prototype.UpdateRYVoucher = function (query, callback) {
                console.log(query);
                this.ISOQualify.UpdateRYVoucher(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }
            LIMSService.prototype.UpdateRYStatusVoucher = function (query, callback) {
                console.log(query);
                this.ISOQualify.UpdateSubmittedVoucher(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }
            LIMSService.prototype.SendReminder = function (query, callback) {
                console.log(query);
                this.ISOQualify.SendReminder(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }
            LIMSService.prototype.QCGradesPID = function () {
                return this.getQCGradesPID;
            }

            LIMSService.prototype.QCOverGradePID = function () {
                return this.getQCOverGradesPID;
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
            LIMSService.prototype.QueryPlans = function () {
                return this.queryPlans;
            };

            LIMSService.prototype.EntrustedInfo = function () {
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
