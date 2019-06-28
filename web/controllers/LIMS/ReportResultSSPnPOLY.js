/**
 * Created by ptanh on 26/09/2018.
 */
define(['myapp', 'angular', 'jquery'], function (myapp, angular, jquery) {
    myapp.controller('ReportResultSSPnPOLY', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', '$upload',
        '$translatePartialLoader', '$translate', 'LIMSService', 'LIMSBasic', '$q', '$timeout',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, $upload, $translatePartialLoader, $translate, LIMSService, LIMSBasic, $q, $timeout) {
            var date = new Date();
            var parent = $routeParams;
            $scope.DateFrom = parent.F;
            $scope.DateTo = parent.E;
            $scope.Material = parent.S;
            $scope.SampleName = parent.M;
            $scope.Line = parent.L;
            $scope.Monthly = parent.month == 'true' ? true : false;
            $scope.lang = window.localStorage.lang;
            $scope.isVisible = false;

            $scope.isVisible = false;

            $scope.Search = function () {
                var params = {};
                params.from = $scope.DateFrom;
                params.to = $scope.DateTo;
                params.lot_No = $scope.Material != 'null' ? $scope.Material : '' || '';
                params.sampleName = $scope.SampleName || '0';
                params.line = $scope.Line || 'all';
                params.type = $scope.Monthly ||false;
                Report(params);
                if ($scope.Monthly) {
                    $scope.DateFromTo = "从: " + parseInt(new Date($scope.DateFrom).getMonth() + 1) + " 月份至 " + parseInt(new Date($scope.DateTo).getMonth() + 1) + " 月份";
                } else {
                    $scope.DateFromTo = "从: " + $scope.DateFrom + " 号至 " + $scope.DateTo + " 号";
                }
            }
            $scope.Search();
            function Report(params) {
                LIMSService.Entrusted.GetReport(params).$promise.then(function (res) {
                    if (res) {
                        console.log(res);
                        $scope.Tittle = $scope.SampleName.substr($scope.SampleName.length - 1, $scope.SampleName.length) == 2 ? "固聚一科（SSP1）分析日报表" : "聚合一科(Poly52)分析日报表";
                        $scope.MasterHeader = [];
                        $scope.plansHeaderDetail = [];
                        if (res.masterData.length > 0) {
                            $scope.MasterList = res.masterData;
                            $scope.totalItems = $scope.MasterList.length;
                            $scope.numPerPage = 5;
                            $scope.paginate = function (value) {
                                var begin, end, index;
                                begin = ($scope.currentPage - 1) * $scope.numPerPage;
                                end = begin + $scope.numPerPage;
                                index = $scope.MasterList.indexOf(value);
                                return (begin <= index && index < end);
                            };
                            $scope.MasterListDetail = res.detailData;
                            var MasterHeader = [];
                            for (var key in res.masterData[0]) {
                                if (key.indexOf('$') < 0) {
                                    MasterHeader.push(key)
                                }
                            }
                            var plansHeaderDetail = [];
                            for (var key in res.detailData[0]) {
                                if (key.indexOf('$') < 0) {
                                    plansHeaderDetail.push(key.toString())
                                }
                            }
                            var plansHeaderDetailChild = [];
                            for (var value in res.detailData[0]) {
                                for (var child in res.detailData[0][value]) {
                                    if (plansHeaderDetailChild.indexOf(child) == -1) {
                                        plansHeaderDetailChild.push(child);
                                    }
                                }
                            }
                            $scope.MasterHeader = MasterHeader;
                        }
                        $scope.isVisible = true;

                        $scope.filteredData = [];
                        $scope.currentPage = 1;
                        $scope.numPerPage = 50;
                        $scope.maxSize = 5;
                        $scope.firstPage = function () {
                            $scope.currentPage = 1;
                        }
                        $scope.prevPage = function () {
                            if ($scope.currentPage - 1 > 0) {
                                $scope.currentPage--;
                            }
                            console.log($scope.currentPage);
                        };

                        $scope.nextPage = function () {
                            if ($scope.currentPage - 1 < $scope.pagedItems.length - 1) {
                                $scope.currentPage++;
                            }
                            console.log($scope.currentPage);
                        };
                        $scope.lastPage = function () {

                            $scope.currentPage = $scope.pagedItems.length

                        };

                        $scope.setPage = function () {
                            $scope.currentPage = this.n + 1;
                        };
                        $scope.numPages = function () {
                            return Math.ceil($scope.MasterList.length / $scope.numPerPage);
                        };

                        $scope.groupToPages = function () {
                            $scope.pagedItems = [];

                            for (var i = 0; i < $scope.MasterList.length; i++) {
                                if (i % $scope.numPerPage === 0) {
                                    $scope.pagedItems[Math.floor(i / $scope.numPerPage)] = [$scope.MasterList[i]];
                                } else {
                                    $scope.pagedItems[Math.floor(i / $scope.numPerPage)].push($scope.MasterList[i]);
                                }
                            }


                        };
                        $scope.checkInputPage = function () {

                            if ($scope.currentPage > $scope.pagedItems.length) {
                                alert('Input a valid page number');
                                $scope.currentPage = '1';
                                return;
                            }
                        }

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

                }, function (error) {

                })
            }

            $scope.getDetailbyLotNO = function (lotNO, line) {
                var subheader = [];
                for (var i = 0; i < $scope.MasterListDetail.length; i++) {
                    var item = $scope.MasterListDetail[i];

                    for (var value in item) {
                        for (var child in item[value]) {
                            if (subheader.indexOf(child) == -1) {
                                subheader.push(child);
                            }
                        }
                        if (value == lotNO && item[value].LINE == line) {
                            $scope.subheader = subheader;
                            return item;
                        }
                    }
                }
            }
            $scope.findLastIndex = function (value, line, hidden) {
                if (hidden) {
                    var length = $scope.MasterList.length;
                    while (length--) {
                        if ($scope.MasterList[length].LOT_NO === value && $scope.MasterList[length].Line == line) {
                            break;
                        }
                    }
                } else {
                    var length = $scope.pagedItems[$scope.currentPage - 1].length;
                    while (length--) {
                        if ($scope.pagedItems[$scope.currentPage - 1][length].LOT_NO === value && $scope.pagedItems[$scope.currentPage - 1][length].Line == line) {
                            break;
                        }
                    }
                }

                return length;
            }
            $scope.getMonth = function (Monthly) {
                if (Monthly) {
                    $scope.Month = true;
                } else {
                    $scope.Month = false;
                }
            }
            $scope.exportData = function () {
            var html, link, blob, url, css;
                css = (
                '<style>' +
                '@page WordSection1{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}' +
                'div.WordSection1 {page: WordSection1;}' +
                'table{border-collapse:collapse;}td{border:1px gray solid;width:5em;padding:2px;}' +
                '</style>'
                );
                html = document.getElementById('reporthidden').innerHTML;
                blob = new Blob(['\ufeff', css + html], {
                    type: 'application/vnd.ms-excel'
                });
                url = URL.createObjectURL(blob);
                link = document.createElement('A');
                link.href = url;
                link.download = $scope.SampleName.substr($scope.SampleName.length - 1, $scope.SampleName.length) == 2 ? "SSP1Report" : "Poly52Report"; // default name without extension
                document.body.appendChild(link);
                if (navigator.msSaveOrOpenBlob) navigator.msSaveOrOpenBlob(blob, $scope.SampleName.substr($scope.SampleName.length - 1, $scope.SampleName.length) == 2 ? "SSP1Report.xls" : "Poly52Report.xls"); // IE10-11
                else link.click();  // other browsers
                document.body.removeChild(link);

            };
            $scope.ExportWord = function export2Word() {

                var html, link, blob, url, css;
                css = (
                '<style>' +
                '@page WordSection1{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}' +
                'div.WordSection1 {page: WordSection1;}' +
                'table{border-collapse:collapse;}td{border:1px gray solid;width:5em;padding:2px;}' +
                '</style>'
                );

                html = document.getElementById('reporthidden').innerHTML;
                blob = new Blob(['\ufeff', css + html], {
                    type: 'application/msword'
                });
                url = URL.createObjectURL(blob);
                link = document.createElement('A');
                link.href = url;
                link.download = $scope.SampleName.substr($scope.SampleName.length - 1, $scope.SampleName.length) == 2 ? "SSP1Report" : "Poly52Report"; // default name without extension
                document.body.appendChild(link);
                if (navigator.msSaveOrOpenBlob) navigator.msSaveOrOpenBlob(blob, $scope.SampleName.substr($scope.SampleName.length - 1, $scope.SampleName.length) == 2 ? "SSP1Report.doc" : "Poly52Report.doc"); // IE10-11
                else link.click();  // other browsers
                document.body.removeChild(link);


            };
            var specialElementHandlers = {
                // element with id of "bypass" - jQuery style selector
                '.no-export': function (element, renderer) {
                    // true = "handled elsewhere, bypass text extraction"
                    return true;
                }
            };
            $scope.ExportPDF = function exportPDF() {

                var doc = new jsPDF('p', 'pt', 'a4');
                var source = document.getElementById('report').innerHTML;
                var margins = {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    width: 1000
                };

                doc.fromHTML(
                    source, // HTML string or DOM elem ref.
                    margins.left,
                    margins.top, {
                        'width': margins.width,
                        'elementHandlers': specialElementHandlers
                    },

                    function (dispose) {
                        // dispose: object with X, Y of the last line add to the PDF
                        //          this allow the insertion of new lines after html
                        doc.save('Test.pdf');
                    }, margins);
            }
        }]);
});