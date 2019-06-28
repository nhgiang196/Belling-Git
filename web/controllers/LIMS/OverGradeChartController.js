define(['myapp', 'angular', 'higthchartexport'], function (myapp, angular) {
    myapp.controller('OverGradeChartController', ['$scope', '$filter', '$http', '$q', '$compile', '$routeParams', '$resource', '$location', 'i18nService',
        'Notifications', 'Auth', '$translate', 'LIMSService', 'LIMSBasic',
        function ($scope, $filter, $http, $q, $compile, $routeParams, $resource, $location, i18nService, Notifications, Auth,
            $translate, LIMSService, LIMSBasic) {

            $scope.isRun = false;
            var lang = window.localStorage.lang || 'EN';
            $scope.lang = lang;
            var obj = $('#mychart');
            //Default test case --------------------
            $scope.dateFrom = moment(new Date()).subtract(1, 'months').date(1).format('YYYY-MM-DD');
            $scope.dateTo = moment(new Date()).date(1).subtract(1, 'days').format('YYYY-MM-DD');
            $scope.SampleName = 'S01020002';
            //----------------------------------------


            /** SET HIGHTCHART OPTIONS SETTING */
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });

            var options = {
                chart: {
                    // renderTo: 'container',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
                },
                // colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],

                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b style="color:{point.labelcolor};font-weight: bold;"> {point.name} : {point.percentage:.2f} %</b>',
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: 'Total',
                    colorByPoint: true,
                    // data: [
                    //     {
                    //         name: 'CB-612',
                    //         y: 31.81,
                    //     }, {
                    //         name: 'CB-602',
                    //         y: 15.99
                    //     }
                    // ]
                }]

            }
            LIMSBasic.GetSamples({ userid: Auth.username, query: '5' }, function (data) {
                $scope.sampleList = data.filter((el) => {
                    return (el.SampleName === 'S01020001' || el.SampleName === 'S01020002')
                })
            });
            $scope.$watch('SampleName', function (n) {
                if (n !== undefined) {
                    LIMSBasic.GetAttribute({
                        sampleName: $scope.SampleName
                    }, function (res) {
                        if (res.length == 0) {
                            $scope.note.attribute = '';
                        }
                        $scope.Attributs = res;
                    });
                    LIMSBasic.GetLinesByAB({
                        userid: Auth.username,
                        sampleName: $scope.SampleName,
                        ab: ''
                    }, function (res) {
                        $scope.LinesList = res;
                    });
                }

            })
            $scope.Print = function () {
                window.print();
            }
            $scope.Search = function () {
                $scope.isRun = false;
                var query = {
                    samplename: $scope.SampleName,
                    propertyname: $scope.PropertyName || '',
                    B: $scope.dateFrom,
                    E: $scope.dateTo,
                    line: $scope.Line || ''
                }
                console.log(query);
                LIMSService.Entrusted.GetOverGradeChart(query, function (res) {
                    //Parse to float to show value. Because hightcharts wont work with string
                    options.colors = ['#fdda10', '#000000', '#5edfff', '#fa773b', '#010c70', '#a6e235', '#f682e3', '#b4b4b4', '#fdc610']
                    options.series[0].data = res.getchart;
                    options.title = {
                        // text: '$scope.SampleName + ' (' + $scope.dateFrom + ' - ' + $scope.dateTo + ')''
                        text: '生產產品百分比'
                    }
                    res.getchart.forEach(function (element, index) {
                        // element.name = (element.Grade == "0" ? '(B) ' : '') + element.name;
                        console.log(index);
                        if (element.Grades == '0') options.colors[index] = 'red';
                        element.y = parseFloat(element.y);
                    });
                    /**
                     * res.getchart: chart data
                     * res.getheader:
                     * res.getdetail:
                     */

                    obj.highcharts(options);
                    ShowData(res.getheader, res.getdetail);
                    console.log(res);
                })
            }

            function ShowData(h, d) {
                var ha = h.filter(x => x.Grades == '1');
                var hb = h.filter(x => x.Grades == '0');
                //definition
                if ($scope.SampleName == 'S01020002')
                    $scope.vdepart = 'SSP';
                else $scope.vdepart = 'POLY';

                //GRADE A
                $scope.lenA = ha.length;
                $scope.spanA = ha[0]; //first row of Grade A
                $scope.ha = ha = ha.splice(1, h.length); //other rows of Grade A
                //GRADE B, C,... = Other Grades
                $scope.lenB = hb.length;//h.length - a;
                $scope.spanB = hb[0]; //first row of [Other Grades]
                $scope.hb = hb = hb.splice(1, h.length); //other Rows of [Other Grades]
                //distinct property
                var taf = TAFFY(d);
                $scope.sampleheader = taf().distinct("LOT_NO", "Grades", "Grade");
                $scope.propheader = taf().distinct("PropertyName");
                console.log($scope.sampleheader);
                console.log($scope.propheader);
                //details
                $scope.detail = d;
                $scope.isRun = true;
            }
        }
    ])

})