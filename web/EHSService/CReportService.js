define(['app', 'angular'], function (app, angular) {
    app.service('CReportService', ['$resource', '$q', 'Auth', '$location', '$translate', function ($resource, $q, Auth, $location, $translate) {
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

        CReportService.prototype.FindByID= function(query,callback){
            console.log(query);
            this.GetInfoBasic.getById(query).$promise.then(function(data){
                callback(data);
            }, function(ex){
                console.log(ex);
                callback(null,ex);            
            })
        }

        CReportService.prototype.Delete= function(query,callback){
            console.log(query);
            this.GetInfoBasic.delete(query).$promise.then(function(data){
                callback(data);
            }, function(ex){
                console.log(ex);
                callback(null,ex);            
            })
        }

        CReportService.prototype.GetBasic= function(query,callback){
            console.log(query);
            this.GetInfoBasic.GetBasic(query).$promise.then(function(data){
                callback(data);
            }, function(ex){
                console.log(ex);
                callback(null,ex);            
            })
        }

        CReportService.prototype.FindIC= function(query,callback){
            console.log(query);
            this.GetInfoBasic.FindIC(query).$promise.then(function(data){
                callback(data);
            }, function(ex){
                console.log(ex);
                callback(null,ex);            
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
                                id: 'N',
                                name: 'New'
                            },
                            {
                                id: 'M',
                                name: 'Modify'
                            },
                            {
                                id: 'P',
                                name: 'Pro'
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