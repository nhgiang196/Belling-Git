define(['app', 'angular'], function(app) {
    app.service('LIMSBasic', ['$resource', '$q', 'Auth', '$location', '$translate', function($resource, $q, Auth, $location, $translate) {
        function LIMSBasic() {

            this.QCBasic = $resource('/LIMS/Basic/:operation', {}, {
                getCategory: { method: 'GET', params: { operation: 'GetCategorys' }, isArray: true },
                getSampleByCategory: { method: 'GET', params: { operation: 'GetSamplesByCategory' }, isArray: true },
                getSample: { method: 'GET', params: { operation: 'GetSamples' }, isArray: true }, //访客类型
                getMaterial: { method: 'GET', params: { operation: 'GetMaterials' }, isArray: true },
                getAttribute: { method: 'GET', params: { operation: 'getAttribute' }, isArray: true },
                getSpec: { method: 'GET', params: { operation: 'getSpec' } },
                getStatus: { method: 'GET', params: { operation: 'getStatus' }, isArray: true },
                getLines: { method: 'GET', params: { operation: 'getLines' }, isArray: true },
                getLinesByAB: { method: 'GET', params: { operation: 'GetLinesByAB' }, isArray: true },
                getCreateType: { method: 'GET', params: { operation: 'getCreateType' }, isArray: true }
               
            });
         
          

        }
      
        LIMSBasic.prototype.GetCategorys = function(query, callback) {
            this.QCBasic.getCategory(query).$promise.then(function(datas) {
                callback(datas);
            }, function(ex) {
                console.log(ex);
                callback(null, ex);
            });
        }
        LIMSBasic.prototype.GetSamplesByCategory = function(query, callback) {
            this.QCBasic.getSampleByCategory(query).$promise.then(function(datas) {
                callback(datas);
            }, function(ex) {
                console.log(ex);
                callback(null, ex);
            });
        }
        LIMSBasic.prototype.GetSamples = function(query, callback) {
            this.QCBasic.getSample(query).$promise.then(function(datas) {
                callback(datas);
            }, function(ex) {
                console.log(ex);
                callback(null, ex);
            });
        }
        LIMSBasic.prototype.GetLinesByAB = function(query, callback) {
            this.QCBasic.getLinesByAB(query).$promise.then(function(datas) {
                callback(datas);
            }, function(ex) {
                console.log(ex);
                callback(null, ex);
            });
        }
        LIMSBasic.prototype.GetMaterial = function(query, callback) {
            this.QCBasic.getMaterial(query).$promise.then(function(datas) {
                callback(datas);
            }, function(ex) {
                console.log(ex);
                callback(null, ex);
            });
        }
        LIMSBasic.prototype.GetAttribute = function(query, callback) {
            this.QCBasic.getAttribute(query).$promise.then(function(datas) {
                callback(datas);
            }, function(ex) {
                console.log(ex);
                callback(null, ex);
            });
        }
        LIMSBasic.prototype.GetSpec = function(query, callback) {
            this.QCBasic.getSpec(query).$promise.then(function(datas) {
                callback(datas);
            }, function(ex) {
                console.log(ex);
                callback(null, ex);
            });
        }
        LIMSBasic.prototype.GetStatus = function(query, callback) {
            this.QCBasic.getStatus(query).$promise.then(function(datas) {
                callback(datas);
            }, function(ex) {
                console.log(ex);
                callback(null, ex);
            });
        }
        LIMSBasic.prototype.GetCreateType = function(query, callback) {
            this.QCBasic.getCreateType(query).$promise.then(function(datas) {
                callback(datas);
            }, function(ex) {
                console.log(ex);
                callback(null, ex);
            });
        }
        return new LIMSBasic();
    }])

});