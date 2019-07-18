define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller('ChartController', ['$scope', '$filter', '$http', '$q', '$compile', '$routeParams', '$resource', '$location', 'i18nService',
        'Notifications', 'Auth', '$translate', 'LIMSService', 'LIMSBasic',
        function ($scope, $filter, $http, $q, $compile, $routeParams, $resource, $location, i18nService, Notifications, Auth,
            $translate, LIMSService, LIMSBasic) {
            $scope.lang = window.localStorage.lang || 'EN';
            $scope.note = {};
            $scope.note.Charttype = '5';
            var mycharts = [];
            $scope.datashow = false;
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });
            var q_category = {
                userid: Auth.username,
                Language: $scope.lang
            };
            $scope.note.BeginTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm');
            $scope.note.EndTime = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm');
            LIMSBasic.GetCategorys(q_category, function (data) {
                console.log(data)
                $scope.CategoryList = data;
            });
            $scope.$watch('note.TypeID', function (n) {
                if (n != null) {
                    var q_sample = {
                        userid: Auth.username,
                        TypeID: $scope.note.TypeID
                    };
                    LIMSBasic.GetSamplesByCategory(q_sample, function (data) {
                        console.log(data)
                        $scope.SampleList = data;
                    });
                }
            });
            $scope.$watch('note.SampleName', function (n) {
                if (n !== undefined) {
                    LIMSBasic.GetMaterial({
                        userid: Auth.username,
                        sampleName: $scope.note.SampleName,
                        query: '0'
                    }, function (res) {
                        if (res.length == 0) {
                            $scope.note.Material = '';
                        }
                        $scope.materialList = res;
                        console.log(res);
                    });
                    LIMSBasic.GetAttribute({
                        sampleName: $scope.note.SampleName
                    }, function (res) {
                        if (res.length == 0) {
                            $scope.note.attribute = '';
                        }
                        $scope.Attributs = res;
                        console.log(res);
                    });
                    LIMSBasic.GetLinesByAB({
                        userid: Auth.username,
                        sampleName: $scope.note.SampleName,
                        ab: ''
                    }, function (res) {
                        $scope.LinesList = res;
                    });
                }

            })

            function SingleChart(chartname, chartData,title) {
                var obj = $(chartname);
                var options = {
                    chart: {
                        renderTo: 'container',
                        marginRight: 70
                    },
                    title: {
                        text: title,
                        x: -20 //center
                    },
                    xAxis: {
                        gridLineWidth: 0,
                        style: {
                            fontFamily: '"Courier New","Arial"',
                            fontSize: '12px'
                        },
                        tickLength: 5
                    },
                    yAxis: {
                        title: {
                            text: title + ' C1, ... C8'
                        },
                        style: {
                            fontFamily: '"Courier New","Arial"',
                            fontSize: '12px'
                        },
                        gridLineWidth: 1,
                        tickLength: 5,
                        tickColor: '#000000'
                    },
                    tooltip: {
                        formatter: function () {
                            var no=this.x-1;
                            var date =  chartData.ChartCreater.MainData[no].ProdDate;                          
                            
                            console.log(date);
                            return '<b>'+date +' :'+ this.x + '</b><br/>' +this.y+
                         '<br/>'

                        }
                    },
                    legend: {
                        enabled: false
                    },
                    
                    series: [{
                            type: 'line',
                            //dashStyle: 'shortdash',
                            point: {
                                color: 'red'
                            }

                        },
                        {
                            type: 'scatter',
                            point: {
                                color: 'black'
                            }
                        },
                        {
                            type: 'scatter',
                            point: {
                                color: 'black'
                            }
                        }
                    ]                    

                }
                options.yAxis.max = chartData.maxValue;
                options.yAxis.min = chartData.minValue;
                options.yAxis.plotLines = [{
                    value: chartData.Model.USL,
                    color: 'red',
                    dashStyle: 'shortdash',
                    width: 2,
                    label: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        text: chartData.Model.Label_USL,
                        y: 4,
                        x: 50
                    }
                }, {
                    value: chartData.Model.LSL,
                    color: 'red',
                    dashStyle: 'shortdash',
                    width: 2,
                    label: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        text: chartData.Model.Label_LSL,
                        y: 4,
                        x: 50
                    }
                }, {
                    value: chartData.Model.X,
                    color: 'green',
                    dashStyle: 'shortdash',
                    width: 2,
                    label: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        text: chartData.Model.X_Lab,
                        y: 4,
                        x: 50
                    }
                }, {
                    value: chartData.Model.LUCL,
                    color: 'red',
                    dashStyle: 'line',
                    width: 2,
                    label: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        text: chartData.Model.Label_LUCL,
                        y: 4,
                        x: 50
                    }
                }, {
                    value: chartData.Model.LLCL,
                    color: 'red',
                    dashStyle: 'line',
                    width: 2,
                    label: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        text: chartData.Model.Label_LLCL,
                        y: 4,
                        x: 50
                    }
                }];

                var RedPoint = chartData.RedPoint;
                options.series[0].data = RedPoint;

                var over1 = chartData.Over1;
                options.series[1].data = over1;

                var over2 = chartData.Over2;
                options.series[2].data = over2;
                obj.highcharts(options);

            }

            function ChartR(chartname, chartData) {
                var obj = $(chartname);
                var optionsR = {

                    title: {
                        text: '移动极差图',
                        x: -20 //center
                    },
                    xAxis: {
                        gridLineWidth: 0,
                        style: {
                            fontFamily: '"Courier New","Arial"',
                            fontSize: '12px'
                        },
                        tickLength: 5
                    },
                    yAxis: {
                        title: {
                            text: '移动极差图'
                        },
                        style: {
                            fontFamily: '"Courier New","Arial"',
                            fontSize: '12px'
                        },
                        gridLineWidth: 1,
                        tickLength: 5,
                        tickColor: '#000000'
                    },
                    tooltip: {
                        formatter: function () {
                            var no=this.x-1;
                            var date =  chartData.ChartCreater.MainData[no].ProdDate;                          
                            console.log(date);
                            return '<b>'+date +' :'+ this.x + '</b><br/>' +this.y+
                         '<br/>'

                        }
                    },
                    legend: {
                        enabled: false
                    },
                    series: [{
                        type: 'line',
                        point: {
                            color: 'red'
                        }

                    }, {
                        type: 'scatter',
                        marker: {
                            radius: 1
                        },
                        point: {
                            color: 'black'
                        }
                    }, {
                        type: 'scatter',
                        marker: {
                            radius: 1
                        },
                        point: {
                            color: 'black'
                        }
                    }]

                }
                optionsR.yAxis.plotLines = [{
                        value: chartData.DicR.UCL,
                        color: 'red',
                        dashStyle: 'shortdash',
                        width: 2,
                        label: {
                            align: 'right',
                            verticalAlign: 'bottom',
                            text: chartData.DicR.Label_UCL,
                            y: 4,
                            x: 50
                        }
                    }, {
                        value: chartData.DicR.LCL,
                        color: 'red',
                        dashStyle: 'shortdash',
                        width: 2,
                        label: {
                            align: 'right',
                            verticalAlign: 'bottom',
                            text: chartData.DicR.Label_LCL,
                            y: 4,
                            x: 50
                        }
                    },
                    {
                        value: chartData.DicR.MR,
                        color: 'green',
                        dashStyle: 'shortdash',
                        width: 2,
                        label: {
                            align: 'right',
                            verticalAlign: 'bottom',
                            text: chartData.DicR.Label_MR,
                            y: 4,
                            x: 50
                        }
                    }
                ];
                optionsR.series[0].data = chartData.TrendR;
                optionsR.series[1].data = chartData.MaxSpotsMR;
                optionsR.series[2].data = chartData.MinSpotsMR;

                obj.highcharts(optionsR);
            }

            function SingleChartData(value, chartname) {
                var deferred = $q.defer();
                LIMSService.Entrusted.SingleTrendChart({}, value).$promise.then(function (res) {
                    if (res.Error) {
                        deferred.reject(res.Error);
                        //Notifications.addError({'status': 'error', 'message': res.error});
                    } else {

                        var plansHeader = [];
                        var date;
                        for (var key in res.ChartCreater.MainData[0]) {
                            date = key;
                            console.log(key);
                            if (key.indexOf('$') < 0) {
                                plansHeader.push(key);
                            }
                        }
                        console.log(plansHeader);
                        var chartdata = res;
                        //ShowChart(  ,res)
                        SingleChart(chartname, chartdata,value.Property);

                    }
                }, function (error) {

                    deferred.reject(error);
                    //Notifications.addError({'status': 'error', 'message': error});
                });

                return deferred.promise;

            }

            function SaveAttribute(value, chartname) {
                $scope.plansHeader = [];
                var deferred = $q.defer();
                console.log(value);
                // var chartname='#chart'+index;
                LIMSService.Entrusted.MRChart({}, value).$promise.then(function (res) {
                    if (res.Error) {
                        deferred.reject(res.Error);
                        //Notifications.addError({'status': 'error', 'message': res.error});
                    } else {
                        var plansHeader = [];
                        for (var key in res.ChartCreater.MainData[0]) {
                            console.log(key);
                            if (key.indexOf('$') < 0) {
                                plansHeader.push(key);
                            }
                        }
                        console.log(plansHeader);
                        $scope.plansHeader = plansHeader;
                        var chartdata = res;
                        //ShowChart(  ,res)
                        var obj = $(chartname);
                        ChartR('#rchart0', chartdata);
                        var Model = chartdata.Model
                        var options = {
                            chart: {
                                marginRight: 70,
                                zoomType: 'x',
                                panning: true
                            },
                            title: {
                                text: '均值控制图',
                                x: -20
                            },
                            xAxis: {
                                gridLineWidth: 0,
                                style: {
                                    fontFamily: '"Courier New","Arial"',
                                    fontSize: '12px'
                                },
                                tickLength: 5
                            },
                            yAxis: {
                                title: {
                                    text: '均值控制图'
                                },
                                style: {
                                    fontFamily: '"Courier New","Arial"',
                                    fontSize: '12px'
                                },
                                gridLineWidth: 1,
                                tickLength: 5,
                                tickColor: '#000000'
                            },
                            tooltip: {
                                formatter: function () {
                                    var no=this.x-1;
                                    var date =  chartdata.ChartCreater.MainData[no].ProdDate;                         
                                    
                                    console.log(date);
                                    return '<b>'+date +' :'+ this.x + '</b><br/>' +this.y+
                                 '<br/>'
        
                                }
                            },
                            legend: {
                                enabled: false
                            },
                            series: [
                                {
                                    type: 'line',
                                    //dashStyle: 'shortdash',
                                    point: {
                                        color: 'red'
                                    }

                                },
                                {
                                    type: 'scatter',
                                    color: '#BF0B23'
                                },
                                {
                                    type: 'scatter',
                                    color: '#BF0B23'
                                }, {
                                    marker: {
                                        radius: 1 //曲线点半径，默认是4
                                    },
                                    type: 'scatter',
                                    point: {
                                        color: 'black'
                                    }
                                }, {
                                    marker: {
                                        radius: 1 //曲线点半径，默认是4
                                    },
                                    type: 'scatter',
                                    point: {
                                        color: 'black'
                                    }
                                }
                            ]
                        };
                        options.yAxis.plotLines = [{
                            value: Model.USL,
                            color: 'black',
                            dashStyle: 'shortdash',
                            width: 2,
                            label: {
                                align: 'right',
                                verticalAlign: 'bottom',
                                text: Model.Label_USL,
                                y: 4,
                                x: 50
                            }
                        }, {
                            value: Model.LSL,
                            color: 'black',
                            dashStyle: 'shortdash',
                            width: 2,
                            label: {
                                align: 'right',
                                verticalAlign: 'bottom',
                                text: Model.Label_LSL,
                                y: 4,
                                x: 50
                            }
                        }, {
                            value: Model.CL,
                            color: 'green',
                            dashStyle: 'shortdash',
                            width: 2,
                            label: {
                                align: 'right',
                                verticalAlign: 'bottom',
                                text: Model.Label_CL,
                                y: 4,
                                x: 50
                            }
                        }, {
                            value: Model.UCL,
                            color: 'red',
                            dashStyle: 'shortdash',
                            width: 2,
                            label: {
                                align: 'left',
                                verticalAlign: 'top',
                                text: Model.Label_UCL,
                                style: {
                                    color: 'black'
                                },
                                y: 4,
                                x: 50
                            }
                        }, {
                            value: Model.LCL,
                            color: 'red',
                            dashStyle: 'shortdash',
                            width: 2,
                            label: {
                                align: 'left',
                                verticalAlign: 'bottom',
                                text: Model.Label_LCL,
                                style: {
                                    color: 'black'
                                },
                                y: 4,
                                x: 50
                            }
                        }, {
                            value: Model.LUCL,
                            color: 'red',
                            dashStyle: 'line',
                            width: 2,
                            label: {
                                align: 'right',
                                verticalAlign: 'bottom',
                                text: Model.Label_LUCL,
                                y: 4,
                                x: 50
                            }
                        }, {
                            value: Model.LLCL,
                            color: 'red',
                            dashStyle: 'line',
                            width: 2,
                            label: {
                                align: 'right',
                                verticalAlign: 'bottom',
                                text: Model.Label_LLCL,
                                y: 4,
                                x: 50
                            }
                        }, {
                            value: Model.X,
                            color: 'gray',
                            dashStyle: 'shortdash',
                            width: 2,
                            label: {
                                align: 'center',
                                verticalAlign: 'bottom',
                                text: 'Model.X_Lab',
                                style: {
                                    color: 'red'
                                },
                                y: 4,
                                x: 50
                            }
                        }];
                        options.series[0].data = chartdata.Trend;
                        options.series[1].data = chartdata.Over1;
                        options.series[2].data = chartdata.Over2;
                        options.series[3].data = chartdata.MaxSpots;
                        options.series[4].data = chartdata.MinSpots;
                        obj.highcharts(options);
                        mycharts.push(chartdata);
                        $scope.mycharts = mycharts;
                        deferred.resolve();
                    }
                }, function (error) {

                    deferred.reject(error);
                    //Notifications.addError({'status': 'error', 'message': error});
                });

                return deferred.promise;

            }
            //趋势图

            $scope.Search = function () {
                $scope.plansHeader = [];
                $scope.note.AB = $scope.note.AB || '-1';
                $scope.note.Grades = '';
                //  $scope.note.TypeID='2';
                console.log($scope.PropertyName);
                $scope.note.Isdelegate = $scope.note.Isdelegate || false;
                //var promises = [];
                mycharts = [];
                if ($scope.note.Charttype == '4') {                
                    //var promise;
                    var promise = SaveAttribute($scope.note, '#chart0');              
                    promise.then(function (ss) {
                        // Notifications.addError({
                        //     'status': 'info',
                        //     'message': 'OK'
                        // });
                        console.log('OK');
                    }, function (error) {
                        Notifications.addError({
                            'status': 'error',
                            'message': error
                        });
                    })
                }
                if ($scope.note.Charttype == '5') {

                    //     var singlepromise = SingleChartData($scope.note, '#gchart0');
                    //     singlepromise.then(function (ss) {
                    //         // Notifications.addError({
                    //         //     'status': 'info',
                    //         //     'message': 'OK'
                    //         // });
                    //         console.log('OK');
                    //     }, function (error) {
                    //         Notifications.addError({
                    //             'status': 'error',
                    //             'message': error
                    //         });
                    //     })
                    // }
                    $scope.chartnotes = mapToVariablesArray($scope.PropertyName, $scope.note)
                    console.log( $scope.chartnotes);
                    angular.forEach( $scope.chartnotes, function (value, index) {
                        SingleChartData(value, '#gchart'+index);
                    });
                }

            }
          /**
           * Create by Isaac
           * 2018-09-14
           * @param {Send Dropdown Parameter} a 
           */
           $scope.myShow = function (a)
            {               
                if(a ==='4')
                {
                    $scope.isVisible = true;      
                     
                }else{
                    $scope.isVisible = false;  
                  
                }
            }
            $scope.butshowData = function () {
                if ($scope.datashow == true) {
                    $scope.datashow = false;
                } else {
                    $scope.datashow = true;
                }
            }

            function mapToVariablesArray(variables_map, note1) {
                var variablesArray = [];
                angular.forEach(variables_map, function (value, index) {                   
                    var note = {};
                    note.Property = value;
                    note.AB = note1.AB;
                    note.BeginTime = note1.BeginTime;
                    note.Charttype = note1.Charttype;
                    note.EndTime = note1.EndTime;
                    note.Grades = note1.Grades;
                    note.Isdelegate = note1.Isdelegate;
                    note.Line = note1.Line;
                    note.LOT_NO = note1.LOT_NO;
                    note.SampleName = note1.SampleName;
                    note.TypeID = '';
                    variablesArray.push(note);

                });

                return variablesArray;
            }
            

        }
    ])

})