define(['app', 'angular'], function (app, angular) {
    app.service('CReportService', [
        
        '$resource', '$q', 'Auth', '$location', '$translate', 'EngineApi', 'Forms', 
        function ($resource, $q, Auth, $location, $translate, EngineApi, Forms) {
        function CReportService() {

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
                
                SearchIC: {
                    method: 'GET',
                    params: {
                        operation: 'SearchIC'
                    },
                    isArray: true
                },
               

                SearchAC: {
                    method: 'GET',
                    params: {
                        operation: 'SearchAC'
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

                getById:
                {
                    method:'POST',
                    params :{operation :'FindById'}
                  
                },

                delete:
                {
                    method:'DELETE',
                    params :{operation :'Delete'}
                  
                },

                GetBasic:
                {
                    method:'GET',
                    params :{operation :'GetBasic'},
                    isArray: true
                  
                },

                FindIC:
                {
                    method:'GET',
                    params :{operation :'FindIC'},
                    // isArray: true
                },

                GetAccidentDetail: {
                    method: 'GET',
                    params: {operation: 'GetAccidentDetail'},
                    // isArray: true
                },

                GetEmployee: {
                    method: 'GET',
                    params: {operation: 'GetEmployee'},
                    isArray: true
                },

                SubmitStatus: {
                    method: 'POST',
                    params: {operation: 'SubmitStatus'},
                }
        
            })
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

        CReportService.prototype.SearchIC = function (query, callback) {
            console.log(query);
            this.GetInfoBasic.SearchIC(query).$promise.then(function (data) {
                callback(data);
            }, function (ex) {
                console.log(ex);
                callback(null, ex);
            })
        }

        CReportService.prototype.SearchAC = function (query, callback) {
            console.log(query);
            this.GetInfoBasic.SearchAC(query).$promise.then(function (data) {
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


        CReportService.prototype.SubmitBPM = function (formVariables, historyVariable, businessKey, callback) {
            var variablesMap = Forms.variablesToMap(formVariables);
            var historyVariableMap = Forms.variablesToMap(historyVariable);
            EngineApi.getKeyId().getkey({
                'key': 'CReportHSE2'
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






        return new CReportService();
    }]);

    app.service('InfolistService',function(){
        function InfolistService(){
            this.Infolist = function(info){
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
                        var locationlist = [
                            {
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

                    case 'incident':
                   
                        var incidentlist = [
                            {
                                id: 'ind1',
                                name: 'Loại hình sự cố 1'
                            },
                            {
                                id: 'ind2',
                                name: 'Loại hình sự cố 2'
                            }
                        ];
                        return incidentlist;
                    break;

                    case 'type':
                        var typelist = [
                            {
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
                        var statuslist = [
                            {
                                id: 'D',
                                name: 'Draft'
                            },
                            {
                                id: 'P',
                                name: 'Processing'
                            },
                            {
                                id: 'S',
                                name: 'Signed'
                            },
                            {
                                id: 'X',
                                name: 'StatusX'
                            }
            
                        ];
                        return statuslist;
                    break;
                    
                    case 'ACType':
                        var ACTypelist = [
                            {
                                id: 'SA',
                                name: 'Serious'
                            },
                            {
                                id: 'HA',
                                name: 'Heavy'
                            },
                            {
                                id: 'MA',
                                name: 'Minor'
                            }
            
                        ];
                        return ACTypelist;
                    break;

                }
            }

        }
            return new InfolistService();
    });

});