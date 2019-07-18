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
                scope.header = {};
                scope.finalData = {};
                var mydata = JSON.parse(attrs.test);

                LIMSService.gradeVersion.HistoryGrade({ sampleName: mydata.sampleName, lotNo: mydata.lotNo, grades: mydata.grades }).$promise.then(function (res) {
                    scope.header = res.Header;
                    scope.header.splice(scope.header.indexOf('Status'), 1);
                    scope.finalData = res.Item;
                    console.log(res);
                    var maxVersion = [];
                    for (var i = 0; i < res.Item.length; i++) {
                        maxVersion = res.Item[i].Versions;
                        if (res.Item[i].Status == 'P') {
                            maxVersion = maxVersion-1;
                        }
                    }
                    scope.MaxVersion = (Math.max(maxVersion));
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
                    if(Property!=undefined){
                        if(Property.MaxValue!=undefined){
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


                LIMSService.gradeVersion.GetGradeProcessing({ id: attrs.voucherId }).$promise.then(function (res) {

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



});
