/**
 * Created by ntdung on 12/19/2017.
 */
/*eslint-env jquery*/
define(['myapp', 'angular','jquery'], function (myapp, angular,jquery) {
    myapp.controller('SSPDayReportController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', '$http', '$upload', '$translatePartialLoader', '$translate','LIMSService',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, $http,   $upload, $translatePartialLoader, $translate,LIMSService)
        {

            $scope.IsGroupCells = function (item) {
                return /MAX|MIN|AVG|STDEV/.test(item)
            };
            $scope.DateFrom = $routeParams.from;
            $scope.endTime = $routeParams.to;

            if($routeParams.material == 'all')
            {
                $scope.lot_No = '';
            }else{
                $scope.lot_No = $routeParams.material;
            }
            if($routeParams.line == 'all')
            {
                $scope.Line = '';
            }
            else {
                $scope.Line = $routeParams.line
            }
            $scope.Month = $routeParams.month;
            $scope.interval = $routeParams.interval||'0';


            var params = {};
            params.beginTime = $scope.DateFrom;
            params.endTime = $scope.endTime;
            params.lot_No = $scope.lot_No||'';
            params.Line = $scope.Line
            params.interval = $scope.Interval||'0';
            params.month = $scope.Month;
            console.log(params)
            LIMSService.SSPDayController.showData(params).$promise.then(function(res){
                console.log(res);
                $scope.headers = [];
                $scope.Data = res;
                for(var i=0 ; i< res.length ; i ++)
                {
                    if(res[i].LOT_NO.contains('AVG')||res[i].LOT_NO.contains('MAX')||res[i].LOT_NO.contains('MIN')||res[i].LOT_NO.contains('STDEV'))
                    {
                        $scope.subLot =  res[i].LOT_NO.substring(8,13);
                        res[i].LOT_NO = $scope.subLot;
                    }
                }
                if(res.length>0){
                    var headers = [];
                    var columnDefines =[];
                    for(var key in res[0]){
                        if(key.indexOf('$')<0)
                        {
                            var col =
                            {
                                field:key,
                                displayName:$translate.instant('key'),
                                minWidth:75
                            }
                            headers.push(key);
                            columnDefines.push(col);
                        }

                    }

                    $scope.headers = headers;
                    $scope.filteredData = [];
                    $scope.currentPage = 0;
                    $scope.numPerPage = 50;
                    $scope.maxSize = 5;
                    $scope.prevPage = function () {
                        if ($scope.currentPage > 0) {
                            $scope.currentPage--;
                        }
                        console.log($scope.currentPage);
                    };

                    $scope.nextPage = function () {
                        if ($scope.currentPage < $scope.pagedItems.length - 1) {
                            $scope.currentPage++;
                        }
                        console.log($scope.currentPage);
                    };

                    $scope.setPage = function () {
                        $scope.currentPage = this.n;
                    };
                    $scope.numPages = function () {
                        return Math.ceil($scope.Data.length / $scope.numPerPage);
                    };

                    $scope.groupToPages = function () {
                        $scope.pagedItems = [];

                        for (var i = 0; i < $scope.Data.length; i++) {
                            if (i % $scope.numPerPage === 0) {
                                $scope.pagedItems[Math.floor(i / $scope.numPerPage)] = [ $scope.Data[i] ];
                            } else {
                                $scope.pagedItems[Math.floor(i / $scope.numPerPage)].push($scope.Data[i]);
                            }
                        }
                    };
                    $scope.groupToPages();
                    $scope.range = function (begin, end) {
                        var ret = [];
                        if (!end) {
                            end = begin;
                            begin = 0;
                        }
                        for (var i = begin; i < end; i++) {
                            ret.push(i);
                        }
                        return ret;
                    };
                }
            })

            $scope.exportData= function(){

                var uri = 'data:application/vnd.ms-excel;base64,'
                    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>'+'' +
                        '<body><div style="text-align: center"><legend> <h1>远纺工业（越南）有限公司</h1></legend></div><div style="text-align: center"><legend> <h3>固聚科分析日报表</h3></legend></div><div><label>{interval}</label>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<label>品技科化验室</label></div><table>{table}</table></body></html>'
                    , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
                    , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }

                var interval = document.getElementById('interval');
                var table = document.getElementById('tableReportHidden');
                var filters = $('.ng-table-filters').remove();
                var ctx = {worksheet: name || 'SSPReport', table: table.innerHTML, interval: interval.innerText};
                $('.ng-table-sort-header').after(filters) ;
                var url = uri + base64(format(template, ctx));
                var a = document.createElement('a');
                a.href = url;
                a.download = 'SSPReport.xls';
                a.click();
            };
        }])
    ;
})
;