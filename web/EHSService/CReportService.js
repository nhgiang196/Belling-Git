define(['app', 'angular'], function (app, angular) {
    app.service('CReportService', [

        '$resource', '$q', 'Auth', '$location', '$translate', 'EngineApi', 'Forms',
        function ($resource, $q, Auth, $location, $translate, EngineApi, Forms) {
            function CReportService() {

                this.getCReportPID = $resource('/hse/CReportHSE/PID', {}, {
                    get: {
                        method: 'GET'
                    }
                });

                this.SendReminder = $resource('/hse/CReportHSE/PID', {}, {
                    get: {
                        method: 'GET'
                    }
                });
                this.FileManagement = $resource('/Waste/files/:operation', {}, {
                    UploadFile: {
                        method: 'POST',
                        params: {
                            operation: 'Upload'
                        },
                        headers: {
                            enctype: "multipart/form-data",
                            // Content-Type : "multipart/form-data"
                        }
                    },
                    DeleteFile: {
                        method: 'DELETE',
                        params: {
                            operation: 'DeleteFile'
                        }
                    },
                });

                this.GetInfoBasic = $resource('/Waste/CReportController/:operation', {}, {
                    GetDetailReport: {
                        method: 'GET',
                        params: {
                            operation: 'GetFull_CReportDetail'
                        },
                        // isArray: true
                    },

                    SearchCReport: {
                        method: 'GET',
                        params: {
                            operation: 'SearchCReport'
                        },
                        isArray: true
                    },

                    Create: {
                        method: 'POST',
                        params: {
                            operation: 'Create'
                        },
                    },

                    Update: {
                        method: 'POST',
                        params: {
                            operation: 'Update'
                        },
                    },

                    getById: {
                        method: 'POST',
                        params: {
                            operation: 'FindById'
                        }

                    },

                    delete: {
                        method: 'DELETE',
                        params: {
                            operation: 'Delete'
                        }

                    },

                    GetBasic: {
                        method: 'GET',
                        params: {
                            operation: 'GetBasic'
                        },
                        isArray: true

                    },

                    FindIC: {
                        method: 'GET',
                        params: {
                            operation: 'FindIC'
                        },
                        // isArray: true
                    },

                    GetAccidentDetail: {
                        method: 'GET',
                        params: {
                            operation: 'GetAccidentDetail'
                        },
                        // isArray: true
                    },

                    GetEmployee: {
                        method: 'GET',
                        params: {
                            operation: 'GetEmployee'
                        },
                        isArray: true
                    },

                    SubmitStatus: {
                        method: 'POST',
                        params: {
                            operation: 'SubmitStatus'
                        },
                    },

                    GetDataDepartment: {
                        method: 'GET',
                        params: {
                            operation: 'GetDataDepartment'
                        },
                        isArray: true

                    },
                    GetDepartment_RP: {
                        method: 'GET',
                        params: {
                            operation: 'GetDepartment_RP'
                        }

                    },

                    CountReport: {
                        method: 'GET',
                        params: {
                            operation: 'CountReport'
                        },
                        isArray: true

                    }

                })
            }
            CReportService.prototype.CReportHSEPID = function () {
                return this.getCReportPID;
            }


            CReportService.prototype.DeleteFile = function (query, callback) {
                console.log(query);
                this.FileManagement.DeleteFile(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.SearchCReport = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.SearchCReport(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.Create = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.Create(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.Update = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.Update(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.FindByID = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.getById(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.Delete = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.delete(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.GetBasic = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.GetBasic(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.FindIC = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.FindIC(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.GetAccidentDetail = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.GetAccidentDetail(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.GetEmployee = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.GetEmployee(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.SubmitStatus = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.SubmitStatus(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.GetDataDepartment = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.GetDataDepartment(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.GetDepartment_RP = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.GetDepartment_RP(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.CountReport = function (query, callback) {
                console.log(query);
                this.GetInfoBasic.CountReport(query).$promise.then(function (data) {
                    callback(data);
                }, function (ex) {
                    console.log(ex);
                    callback(null, ex);
                })
            }

            CReportService.prototype.SubmitBPM = function (formVariables, historyVariable, businessKey, callback) {
                var variablesMap = Forms.variablesToMap(formVariables);
                var historyVariableMap = Forms.variablesToMap(historyVariable);
                EngineApi.getKeyId().getkey({
                    'key': 'CReportHSE'
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
                        } else {
                            callback('', res.message)

                        }
                    }, function (errResponse) {
                        callback('', errResponse)

                    });

                });


            }






            return new CReportService();
        }
    ]);

    app.service('InfolistService', function () {
        function InfolistService() {
            this.Infolist = function (info) {
                switch (info) {

                    case 'evaluate':
                        var evaluatelist = [

                            {
                                id: 'VG',
                                name: 'VeryGood'
                            },
                            {
                                id: 'G',
                                name: 'Good'
                            },
                            {
                                id: 'MD',
                                name: 'Medium'
                            },
                            {
                                id: 'B',
                                name: 'Bad'
                            },
                            {
                                id: 'VB',
                                name: 'VeryBad'
                            }
                        ];
                        return evaluatelist;
                        break;

                    case 'location':
                        var locationlist = [{
                                id: 'KD',
                                name: 'KnittingDyeing'
                            },
                            {
                                id: 'FC',
                                name: 'FiberChemical'
                            },
                            {
                                id: 'O',
                                name: 'Outside'
                            }
                        ];
                        return locationlist;
                        break;

                    case 'type':
                        var typelist = [{
                                id: '0',
                                name: 'Incident'
                            },
                            {
                                id: '1',
                                name: 'Accident'
                            }
                        ];
                        return typelist;
                        break;

                    case 'status':
                        var statuslist = [{
                            id: 'D',
                            name: 'Draft'
                        }, {
                            id: 'P',
                            name: 'Processing'
                        }, {
                            id: 'S',
                            name: 'Signed'
                        }, {
                            id: 'X',
                            name: 'StatusX'
                        }];
                        return statuslist;
                        break;

                    case 'ACType':
                        var ACTypelist = [{
                                id: 'SA',
                                name: 'Serious'
                            }, {
                                id: 'HA',
                                name: 'Heavy'
                            }, {
                                id: 'MA',
                                name: 'Minor'
                            }

                        ];
                        return ACTypelist;
                        break;

                    case 'SubmitType':
                        var SubmitTypelist = [{
                                id: 'SF',
                                name: 'Safety'
                            },
                            {
                                id: 'EVR',
                                name: 'Environment'
                            },
                            {
                                id: 'FP',
                                name: 'FireProtection'
                            }

                        ];
                        return SubmitTypelist;
                        break;

                }
            }

        }
        return new InfolistService();
    });

});