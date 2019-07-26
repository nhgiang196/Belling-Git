/**
 * Created by phkhoi on 2017-11-04.
 *
 /*eslint-env jquery*/
define(['myapp', 'angular', 'controllers/LIMS/GradeCreateController'], function (myapp, angular) {
    myapp.controller('GradeController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService',
        'Notifications', 'Auth', 'uiGridConstants', '$translatePartialLoader', '$translate', 'LIMSService', 'LIMSBasic', 'EngineApi', '$routeParams',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, Auth, uiGridConstants,
            $translatePartialLoader, $translate, LIMSService, LIMSBasic, EngineApi) {
            $scope.flowkey = 'QCGrades';
            $scope.lang = window.localStorage.lang || 'EN';
            $scope.new = {};
            $scope.checkList = {};
            $scope.new.lower = false;
            $scope.new.upper = false;
            $scope.new.IsJudge = false;
            $scope.new.ValueSpec = '';
            $scope.new.lowerVal = '';
            $scope.new.upperVal = '';
            $scope.new.ValidDate = '';
            $scope.note = {};
            $scope.addnew = [];
            $scope.materials = [];
            $scope.qcGrades = [];
            $scope.username = Auth.username;
            $scope.HisttoryData = {};
            $scope.bpmnloaded = false;
            $scope.bpmnloadedHistory = false;
            $scope.bpmnloadedFlow = false;

            $scope.showPng = function (status) {
                if (status == 'history') {
                    $scope.bpmnloadedFlow = false;
                    if ($scope.bpmnloadedHistory == true) {
                        $scope.bpmnloadedHistory = false;
                        $scope.bpmnloaded = false;
                    } else {
                        $scope.bpmnloadedHistory = true;
                        $scope.bpmnloaded = true;

                    }
                }
                if (status == 'flow') {
                    $scope.bpmnloadedHistory = false;
                    if ($scope.bpmnloadedFlow == true) {
                        $scope.bpmnloadedFlow = false;
                        $scope.bpmnloaded = false;
                    } else {
                        $scope.bpmnloadedFlow = true;
                        $scope.bpmnloaded = true;
                    }
                }

            };
            // History menu bar.
            $scope.menuBar = true;
            $scope.bindform = true;
            $scope.toggleCustom = function () {
                //   alert("0o");
                $scope.menuBar = $scope.menuBar === false ? true : false;
                $(".pinned").toggle(function () {
                    $(this).addClass("highlight");
                    $(this).next().fadeOut(1000);
                }, function () {
                    $(this).removeClass("highlight");
                    $(this).next("div .content").fadeIn(1000);
                });
            };

            LIMSBasic.GetStatus({
                ctype: 'Grade',
                lang: $scope.lang
            }, function (data) {
                $scope.StatusList = data;
                $scope.note.status = 'S';
            });

            var q_category = {userid: Auth.username, Language: $scope.lang};
            LIMSBasic.GetCategorys(q_category, function (data) {
                console.log(data)
                $scope.CategoryList = data;
            });
            //UI for query
            $scope.$watch('TypeID', function (n) {
                if (n != null) {
                    var q_sample = {userid: Auth.username, TypeID: $scope.TypeID};
                    LIMSBasic.GetSamplesByCategory(q_sample, function (data) {
                        console.log(data)
                        $scope.SampleList = data;
                    });
                }
            });

            $scope.$watch('Sample', function (n) {
                if (n !== undefined) {
                    $scope.SampleDes = n["Description_" + $scope.lang];
                    //  $scope.MaterialDes= n["Description_"+$scope.lang];
                    $scope.note.SampleName = n.SampleName;
                    LIMSService.gradeVersion.GetGrade({
                        sampleName: $scope.note.SampleName
                    }, function (dataReturn) {
                        $scope.gradesList = dataReturn;
                    });
                    LIMSBasic.GetMaterial({
                        userid: Auth.username,
                        sampleName: $scope.note.SampleName,
                        query: '0'
                    }, function (res) {
                        if(res.length ==0){
                            $scope.note.Material= '';
                        }
                        $scope.materialList = res;
                        console.log(res);
                    });
                }

            });
            $scope.$watch('new.Property', function (n) {
                if (n !== undefined) {
                    $scope.new.Prec = n.Prec;
                }
            });
            $scope.$watch('note.SampleName', function (n) {
                if (n !== undefined) {
                    LIMSBasic.GetAttribute({
                        sampleName: $scope.note.SampleName
                    }, function (res) {
                        $scope.Attribute = res;
                    });
                }


            });
            // Query function
            $scope.Search = function (status) {
                var query = {};
                if ($scope.Sample == undefined || $scope.Sample == '') {
                    Notifications.addError({
                        'status': 'error',
                        'message': 'Please choose SampleName'
                    });
                    return;
                } else {
                    if ($scope.note.Material == undefined || $scope.note.Material == '') {

                        Notifications.addError({
                            'status': 'error',
                            'message': 'Please choose Material'
                        });
                        return;
                    }
                }
                $scope.gridOptions.data = [];
                query.sampleName = $scope.Sample.SampleName;
                query.lotNo = $scope.note.Material;
                query.status = status != undefined && status != '' ? status : $scope.note.status;
                $scope.note.status = query.status;
                query.grades = '';
                LIMSService.gradeVersion.getNewestGrade(query).$promise.then(function (res) {
                    $scope.gridOptions.data = res;
                    if (res.length > 0) {
                        $scope.ID = res[0]['ID'];
                        $scope.status = res[0]['Status'];
                        if (query.status == 'P'||query.status == 'S') {
                            $scope.HisttoryData = {
                                'sampleName': $scope.Sample.SampleName,
                                'lotNo': $scope.note.Material,
                                'grades': res[0].Grades
                            };
                        }
                    }
                    $scope.gridOptions.data = res;
                }, function (errormessage) {
                    Notifications.addError({
                        'status': 'error',
                        'message': errormessage
                    });
                })

            };
            var col = [{
                field: 'ID',
                visible: false,
                displayName: $translate.instant('VoucherID'),
                minWidth: 80,
                cellTooltip: true
            },
            {
                field: 'PropertyName',
                displayName: $translate.instant('PropertyName'),
                minWidth: 80,
                cellTooltip: true
            },
            {
                field: 'Grade',
                displayName: $translate.instant('Grade'),
                minWidth: 100,
                cellTooltip: true
            },
            {
                field: 'Grades',
                visible: false,
                displayName: $translate.instant('Grades'),
                minWidth: 80,
                cellTooltip: true
            },
            {
                field: 'MinValue',
                displayName: $translate.instant('MinValue'),
                minWidth: 80,
                cellTooltip: true
            },
            {
                field: 'MaxValue',
                displayName: $translate.instant('MaxValue'),
                minWidth: 80,
                cellTooltip: true
            },
            {
                field: 'ValueSpec',
                displayName: $translate.instant('ValueSpec'),
                minWidth: 180,
                cellTooltip: true
            },
            {
                field: 'ValidDate',
                displayName: $translate.instant('ValidDate'),
                minWidth: 180,
                cellTooltip: true
            },
            {
                field: 'Prec',
                displayName: $translate.instant('Prec'),
                minWidth: 60,
                cellTooltip: true
            },
            {
                field: 'ENABLE',
                displayName: $translate.instant('Enable'),
                minWidth: 100,
                cellTooltip: true,
                cellTemplate: '<input  style="width: 70%" type="checkbox" ng-checked="{{COL_FIELD}}" disabled>'
            },
            {
                field: 'Version',
                visible: false,
                displayName: $translate.instant('Version'),
                minWidth: 100,
                cellTooltip: true
            },
            {
                field: 'VersionSpc',
                displayName: $translate.instant('Version'),
                minWidth: 100,
                cellTooltip: true
            },
            {
                field: 'ValidTODate',
                displayName: $translate.instant('ValidTODate'),
                minWidth: 100,
                cellTooltip: true
            },{
                field: 'Remark',
                displayName: $translate.instant('Remark'),
                minWidth: 100,
                cellTooltip: true
            }

            ];
            var paginationOptions = {
                pageNumber: 1,
                pageSize: 50,
                sort: null
            };
            var gridMenu = [{
                title: $translate.instant('Version_create'),
                action: function ($event) {
                    $scope.isShow = false;
                    clearModal();
                    if ($scope.SampleDes && $scope.note.Material ) {
                        $scope.isCopy = true;
                        $scope.IsModify = false;
                        $('#myModal').modal('show');
                    } else {
                        Notifications.addMessage({
                            'status': 'info',
                            'message': 'Please ,Select SampleName and LotNO'
                        });
                    }
                },
                order: 1
            }, {
                title: $translate.instant('Version_copy'),
                action: function ($event) {
                    clearModal();
                    $scope.IsModify = false;
                    $scope.isShow = false;
                    var copy = {};
                    copy.sampleName = $scope.Sample.SampleName;
                    copy.lotNo = $scope.note.Material;
                    copy.grades = '00';
                    if ($scope.gridOptions.data[0].STATUS != 'S') {
                        Notifications.addError({
                            'status': 'error',
                            'message': 'Only can Copy Publish Grade !'
                        });
                    } else {
                        LIMSService.GradeVersion().GetCreateVersion(copy).$promise.then(function (res) {
                            $scope.isCopy = true;
                            angular.forEach($scope.gradesList, function (value) {
                                if (value.Grade === res[0].Grade) {
                                    $scope.new.Grade = value;
                                }
                            });
                            $('#myModal').modal('show');
                            $scope.new.ValidDate =  $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
                            $scope.materials = res;
                        }, function (errResponse) {
                            Notifications.addError({
                                'status': 'error',
                                'message': errResponse.data.Message
                            });
                        });
                    }
                },
                order: 2
            }, {
                title: $translate.instant('Version_modify'),
                action: function ($event) {
                    console.log($scope.username);
                    var params ={
                        UserID : $scope.username
                    }
                    LIMSService.CanUpdateGrades(params,(res)=>{
                        clearModal();
                        if(res[0].Result ==0)
                        {
                            Notifications.addError({
                                'status': 'error',
                                'message': 'Only modify voucher draft '
                            });
                        }
                        else
                        {
                            if ($scope.gridOptions.data.length > 0) {
                                var id = $scope.gridOptions.data[0].ID;
                                $scope.ID = id;
                                $scope.IsModify = false;
                                $scope.isCopy = true;
                               
                                LIMSService.gradeVersion.GetGradeProcessing({
                                    id: id
                                }).$promise.then(function (res) {
                                    if (res.Status === 'N' || res.Status ==='S') {
        
                                     $scope.isShow = (res.Status ==='S'? true:false);//Create by Isaac 07-11-2018
                                      
                                        console.log(res);
                                        if (res.Grades.length > 0) {
                                            for (var i = 0; i < res.Grades.length; i++) {
                                                res.Grades[i].ValidDate = $filter('date')(new Date(res.Grades[i].ValidDate), 'yyyy-MM-dd hh:mm:ss');
                                                res.Grades[i].MaxValue = res.Grades[i].MaxValue == '' ? '' : roundDown(res.Grades[i].MaxValue, res.Grades[i].Prec);
                                                res.Grades[i].MinValue = res.Grades[i].MinValue == '' ? '' : roundDown(res.Grades[i].MinValue, res.Grades[i].Prec);
                                                res.Grades[i].Enable = res.Grades[i].Enable.toLowerCase().trim();
                                            }
                                        }
                                        $scope.materials = res.Grades;
                                        angular.forEach($scope.gradesList, function (value) {
                                            if (value.Grade === res.Grades[0].Grade) {
                                                $scope.new.Grade = value;
                                            }
                                        });
                                        $scope.new.ValidDate =  $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
                                        $('#myModal').modal('show');
                                    } else {
                                        Notifications.addError({
                                            'status': 'error',
                                            'message': 'Only modify voucher draft '
                                        });
                                    }
                                }, function (errormessage) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': errormessage
                                    });
                                });
        
                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': 'Please select one row '
                                });
                            }
                        }
                    })
                   
                  
                   
                },
                order: 3
            }, {
                title: $translate.instant('Version_delete'),
                action: function ($event) {
                    clearModal();
                    var id = $scope.gridOptions.data[0].ID;
                    var version = $scope.gridOptions.data[0].Version;
                    if (id && version) {
                        if (confirm($translate.instant('Delete_IS_MSG') + ' version: ' + version)) {
                            LIMSService.gradeVersion.DeleteVersion({
                                id: id,
                                version: version
                            }, {}).$promise.then(function (res) {
                                Notifications.addMessage({
                                    'status': 'info',
                                    'message': 'Delete success'
                                });
                                //query,get gird data
                                $scope.Search('X');

                            }, function (errResponse) {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': 'Can not delete because : ' + errResponse.data.Message
                                });
                            });
                        }

                    } else {
                        Notifications.addMessage({
                            'status': 'info',
                            'message': 'Please ,Select Row'
                        });
                    }

                },
                order: 4

            },
            {
                title: $translate.instant('Version_upgrade'),
                action: function ($event) {
                    clearModal();
                    if (!$scope.Sample || !$scope.note.Material) {
                        Notifications.addError({
                            'status': '',
                            'message': 'Select SampleName and material'
                        });
                        return;
                    }
                    var modify = {};


                    modify.sampleName = $scope.Sample.SampleName;
                    modify.lotNo = $scope.note.Material;
                    modify.grades = '00';
                    LIMSService.gradeVersion.GetCreateVersion(modify).$promise.then(function (res) {
                        angular.forEach($scope.gradesList, function (value) {
                            if (value.Grade === res[0].Grade) {
                                $scope.new.Grade = value;
                            }
                        });
                        $scope.IsModify = true;
                        $scope.isShow = false;
                        $('#myModal').modal('show');
                        if (res.length > 0) {
                            for (var i = 0; i < res.length; i++) {
                                res[i].ValidDate = $filter('date')(new Date(res[i].ValidDate), 'yyyy-MM-dd hh:mm:ss');
                            }
                        }
                        $scope.new.ValidDate =  $filter('date')(new Date(), 'yyyy-MM-dd hh:mm:ss');
                        $scope.materials = res;

                    }, function (errResponse) {
                        Notifications.addError({
                            'status': 'error',
                            'message': errResponse.data.Message
                        });
                    });

                },
                order: 6
            },

            {
                title: $translate.instant('Cur_version_log'),
                action: function () {
                    LIMSService.QCGradesPID().get({ ID: $scope.ID }).$promise.then(function (res) {
                        console.log(res);
                        if (res) {
                            window.open('#/processlog/' + res.ProcessInstanceId);
                        }

                    }, function (err) {
                        Notifications.addError({
                            'status': 'error',
                            'message': err
                        });
                    })

                },
                order: 7

            }, {
                title: $translate.instant('Version_history'),
                action: function () {
                    if ($scope.note.status == 'P' && $scope.gridOptions.data.length > 0) {
                        $scope.dataTest = {
                            'sampleName': $scope.Sample.SampleName,
                            'lotNo': $scope.note.Material,
                            'grades': '00'
                        };

                    }

                },
                order: 8

            }];
            $scope.gridOptions = {
                columnDefs: col,
                data: [],
                enableColumnResizing: true,
                enableSorting: true,
                showGridFooter: true,
                enableGridMenu: true,
                exporterOlderExcelCompatibility: true,
                enableSelectAll: false,
                enableRowHeaderSelection: true,
                enableRowSelection: true,
                multiSelect: false,
                paginationPageSizes: [50, 100, 200, 500],
                paginationPageSize: 50,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({
                        'userid': Auth.username,
                        'tcode': $scope.flowkey
                    }, function (linkres) {
                        // if (linkres.IsSuccess) {
                        gridApi.core.addToGridMenu(gridApi.grid, gridMenu);

                        // }
                    });
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.selectedVoucherid = row.entity.VoucherID;
                    });
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                        //getPage();
                    });
                }

            };

            function roundDown(number, decimals) {

                number = number || 0;

                if (number == '') {
                    return 0;
                } else {
                    return (Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals));
                }

            }


            function clearModal() {
                $scope.new = {};
                $scope.new.lowerVal = '';
                $scope.new.upperVal = '';
                $scope.new.ValidDate = '';
                $scope.new.upper = false;
                $scope.new.lower = false;
                $scope.materials = [];
                $scope.note.remark ='';

            }

        }
    ])
});