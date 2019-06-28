//marco history direcive
//elro current grade 
define(['app', 'bpmn'], function (app) {
    app.directive('showHistoryGrades', ['$resource', 'EngineApi', 'LIMSService', function ($resource, EngineApi, LIMSService) {
        return {
            restrict: 'EAC',
            link: function (scope, element, attrs) {
                scope.linkClick = function (data, header) {
                    scope.dataLinkClick = data;
                    scope.HeaderName = header;
                    $('#showPropertyDetails').modal('show');
                };
                // scope.finalData = {};
                var mydata = JSON.parse(attrs.test);
                LIMSService.gradeVersion.HistoryOfGradeVersion({
                    sampleName: mydata.sampleName,
                    lotNo: mydata.lotNo,
                    grades: mydata.grades
                }).$promise.then(function (res) {
                    var headers = [];
                    if (res.length > 0) {
                        for (var key in res[0]) {
                            if (['Status'].indexOf(key) < 0 && key.indexOf(['$'])<0)
                                headers.push(key);
                        }
                        scope.header = headers;
                        scope.MaxVersion = TAFFY(res)({ Status: 'S' }).max('Version');
                        scope.finalData = res;
                        console.log(res);
                        console.log(scope.MaxVersion);
                    }
                    else
                        Notifications.addError({
                            'status': 'error',
                            'message': 'There is no data'
                        });
                });
            },
            templateUrl: '/forms/QCGrades/gradeHistory.html'
        }
    }]);
    app.directive('tooltipGradeVersion', ['$filter', function ($filter) {
        return {
            restrict: 'AEC',
            link: function (scope, element, attrs) {
                if (attrs.tooltipGradeVersion != undefined) {
                    var Property = scope.$eval(attrs.tooltipGradeVersion);
                    if (Property != undefined) {
                        if (Property.MaxValue != undefined) {
                            var Max = Property.MaxValue == '' ? '' : 'Max Value: ' + $filter('number')(Property.MaxValue, Property.Prec);
                            var min = Property.MinValue == '' ? '' : '\nMin Value: ' + $filter('number')(Property.MinValue, Property.Prec);
                            var enable = '\nEnable: ' + Property.Enable;
                            element
                                .attr('title', Max + min + enable);
                        }
                    }
                } else {
                    //element
                    //    .attr('title', 'Max Value: ' + '0' + '\nMin Value: ' + '0');
                }
            }
        }
    }]);
    app.directive('showHistoryProcess', ['$resource', 'EngineApi', 'LIMSService', 'LIMSBasic', 'Auth', '$filter', function ($resource, EngineApi, LIMSService, LIMSBasic, Auth, $filter) {
        return {
            restrict: 'AEC',
            link: function (scope, element, attrs) {
                scope.GradeMaterial = [];
                scope.lang = window.localStorage.lang;
                LIMSService.gradeVersion.GetGradeProcessing({
                    id: attrs.voucherId
                }).$promise.then(function (res) {
                    scope.Material = 'MaterialDescription_' + scope.lang;
                    scope.SampleNames = 'SampleDescription_' + scope.lang;
                    scope.Grade = res;
                    if (scope.Grade.Grades.length > 0) {
                        for (var i = 0; i < scope.Grade.Grades.length; i++) {
                            scope.Grade.Grades[i].ValidDate = $filter('date')(new Date(scope.Grade.Grades[i].ValidDate), 'yyyy-MM-dd hh:mm:ss');
                            scope.Grade.Grades[i].Enable = scope.Grade.Grades[i].Enable.toLowerCase();
                        }
                    }
                    scope.dataTest = {
                        'sampleName': scope.Grade.SampleName,
                        'lotNo': scope.Grade.LOT_NO,
                        'grades': scope.Grade.Grade
                    };
                });
            },
            templateUrl: 'forms/QCGrades/GradeInProcessing.html'
        };
    }]);
    app.directive('numberOnly', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                elm.on('keydown', function (event) {
                    if (event.which == 64 || event.which == 16) {
                        // to allow numbers
                        return false;
                    } else if (event.which >= 48 && event.which <= 57) {
                        // to allow numbers
                        return true;
                    } else if (event.which >= 96 && event.which <= 105) {
                        // to allow numpad number
                        return true;
                    } else if ([8, 13, 27, 37, 38, 39, 40, 110, 190, 16, 36, 35, 189, 109, 46].indexOf(event.which) > -1) {
                        // to allow backspace, enter, escape, arrows
                        return true;
                    } else {
                        event.preventDefault();
                        // to stop others
                        return false;
                    }
                });
            }
        }
    }]);
    app.directive('limitNumber', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                elm.on('keydown', function (event) {
                    if (event.which >= 96 && event.which <= 104) {
                        // to allow numbers
                        return true;
                    } else if (event.which >= 96 && event.which <= 105) {
                        // to allow numpad number
                        return true;
                    } else if (event.which >= 48 && event.which <= 56) {
                        // to allow numbers
                        return true;
                    } else if ([8, 13, 27, 37, 38, 39, 40, 110, 190, 16, 36, 35, 46].indexOf(event.which) > -1) {
                        // to allow backspace, enter, escape, arrows
                        return true;
                    } else {
                        event.preventDefault();
                        // to stop others
                        return false;
                    }
                });
            }
        }
    }]);


    /**DIRECTIVE FOR OVERGRADE (QUALIFED CONTROL) REPORTS AND APPROVATION FORM */
    app.directive('approvalMaster', ['LIMSService', 'Auth', '$q', '$filter', '$routeParams', 'Notifications', 'EngineApi',
        function (LIMSService, Auth, $q, $filter, $routeParams, Notifications, EngineApi) {
            return {
                restrict: 'AEC',
                link: function (scope, element, attrs) {
                    /**Init scope*/
                    scope.UQList = [];
                    scope.plansHeader = {};
                    scope.today = $filter('date')(new Date(), "yyyy-MM-dd");
                    scope.username = Auth.username;
                    //  scope.sampleName = 'aaaaa';
                    /* Submit into BPMN **/
                    LIMSService.ISOQualify.GetDetailReport({
                        voucherID: $routeParams.VoucherID ? $routeParams.VoucherID : attrs.vid
                    }, function (data) {
                        console.log(data);
                        var plansHeader = [];
                        scope.plansHeader = [];
                        if (data.length > 0) {
                            scope.UQList = data;
                            /**add Header of the table */
                            var plansHeader = [];
                            for (var key in data[0]) {
                                if (['VoucherID', 'ColorLabel', 'State', 'VoucherNO',
                                    'CreateDate', 'BeginDate', 'EndDate', 'Stamp', 'Status',
                                    'Reason', 'Solution', 'Prevention', 'Remark', 'CreateBy', 'SampleName', 'LOT_NO', 'LINE'
                                ].indexOf(key) < 0 && key.indexOf('$') < 0) {
                                    plansHeader.push(key);
                                }
                            }

                        }
                        scope.plansHeader = plansHeader;

                        /** Information of Red or Yellow Voucher*/
                        if (data[0].ColorLabel == 'Red') {
                            scope.isRed = true;
                            scope.color = {
                                'TW': '紅',
                                'VN': 'ĐỎ',
                                'ISO': '5VGAAQR140-01', //this ISO number should be stored in Database (they are developing)...
                                'Solution': data[0].Solution
                            };
                        } else {
                            scope.color = {
                                'TW': '黃',
                                'VN': 'VÀNG',
                                'ISO': '5VGAAQR141-01', //...as well as this number
                                'Solution': data[0].Solution
                            };
                            scope.isRed = false; // to define which Color
                        }
                        scope.sampleName = data[0].SampleName;
                        /**set used scope */
                        if (data[0].SampleName == 'S01020002')
                            scope.vdepart = 'SSP';

                        else scope.vdepart = 'POLY';
                        scope.VoucherID = data[0].VoucherID; //set it here. in case some function use it
                        scope.recod = data[0];
                        scope.isShow = (scope.recod.Status === 'N') ? true : false; //show submit button (printQualifed)
                        if (scope.GetInformation != null && !scope.isShow)  //prevent exception of loadding null from leadercheck page
                            scope.GetInformation(scope.VoucherID);


                    });
                },
                templateUrl: './forms/QCOverGrade/ApprovalPage.html'
            }
        }
    ]);


    app.directive('rawAnalysis', ['LIMSService', 'Auth', '$q', '$filter', '$routeParams', 'Notifications', 'EngineApi',
        function (LIMSService, Auth, $q, $filter, $routeParams, Notifications, EngineApi) {
            return {
                restrict: 'AEC',
                link: function ($scope, element, attrs) {
                    $scope.today = $filter('date')(new Date(), "yyyy-MM-dd");
                    //GET BPMN WHO SUBMIT THIS VOUCHER
                    $scope.isShow = true;
                    // $scope.user = Auth.username;
                    // $scope.nickname = Auth.nickname;
                    if ($scope.user || $scope.nickname) $scope.isShow = false;
                    //GET INFORMATION OF THIS VOUCHER
                    var params = {
                        VoucherID: $routeParams.code ? $routeParams.code: attrs.vid ,
                    };
                    $scope.listofMaterial = [];
                    LIMSService.Entrusted.GetReportByVoucherID(params).$promise.then(function (res) {
                        console.log(res);
                        $scope.listofMaterial = res;
                        $scope.recod = res[0];
                        $scope.sampleName = res[0].SampleName;
                    }, function (error) {
                    })

                },
                templateUrl: './forms/RawMaterial/RawAnalysis.html'

            }


        }

    ]);









});
