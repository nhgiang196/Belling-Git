/**
 * Modified by Isaac on 2018-12-03.
 */
/*eslint-env jquery*/
define(['myapp', 'jszip'], function (myapp, jszip) {
    myapp.controller('EntrustedController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location',
        'i18nService', 'Notifications', 'Auth', 'uiGridConstants', '$http',
        '$translatePartialLoader', '$translate', 'LIMSBasic', 'LIMSService', 'EngineApi',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, Auth, uiGridConstants, $http, $translatePartialLoader, $translate, LIMSBasic, LIMSService, EngineApi) {
            $scope.flowkey = 'PVLIMS-004';
            // Needed to make DataTables export to Excel work
            window.JSZip = jszip //Very important
            var myTable = '#myTable';
            function newinit() {
                $scope.entrust = {};
                $scope.Drafts = [];
                $scope.entrust.GetDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm');
                $scope.entrust.SendDate = $filter('date')(new Date(), 'yyyy-MM-dd');
                $scope.entrust.RequireDate = $filter('date')(new Date(), 'yyyy-MM-dd');
            }
            $scope.modalWidth = 80;
            newinit();
            var date = new Date();
            $scope.dateFrom = $filter('date')(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
            $scope.dateTo = $filter('date')(new Date(), 'yyyy-MM-dd');
            var lang = window.localStorage.lang || 'EN';
            $scope.lang = lang;

            var q_category = {
                userid: Auth.username,
                Language: $scope.lang
            };
            LIMSBasic.GetCategorys(q_category, function (data) {
                console.log(data)
                $scope.CategoryList = data;
            });
            //UI for query
            $scope.$watch('TypeID', function (n) {
                if (n != null) {
                    var q_sample = {
                        userid: Auth.username,
                        TypeID: $scope.TypeID
                    };
                    LIMSBasic.GetSamplesByCategory(q_sample, function (data) {
                        console.log(data)
                        $scope.sampleList = data;
                    });
                }
            });

            $scope.getSampleName = function (sample) {
                for (var i = 0; i < $scope.sampleList.length; i++) {
                    if ($scope.sampleList[i].SampleName == sample) {
                        console.log($scope.sampleList[i]);
                        return $scope.sampleList[i]['Description_CN'];
                    }
                }
            };
            LIMSBasic.GetStatus({
                ctype: 'Requision',
                lang: lang
            }, function (data) {
                $scope.StatusList = data;
            });
            $scope.getVoucherStatus = function (Status) {
                for (var i = 0; i < $scope.StatusList.length; i++) {
                    if ($scope.StatusList[i].State == Status) {
                        return $scope.StatusList[i].StateSpec;
                    }
                }
            };
            $scope.openModalDetail = function (row) {
                $('#myModalDetail').modal('show');
                var voucherid = row.substring(0, 12);
                LIMSService.Entrusted.GetDelegateDetailsByVoucherID({
                    voucherid: voucherid
                }).$promise.then(function (res) {
                    console.log(res);
                    $scope.reqHeader = [];
                    if (res.length > 0) {
                        $scope.reqList = res;
                        var reqHeader = [];
                        for (var key in res[0]) {
                            if (key.indexOf('$') < 0) {
                                reqHeader.push(key)
                            }
                        }
                        if (reqHeader.length > 8)
                            $scope.modalWidth = 100;
                        else $scope.modalWidth = 80;
                        $scope.reqHeader = reqHeader;
                        LoadGrid(res, reqHeader);
                        console.log(reqHeader);
                        console.log($scope.reqList)
                    }
                });


            };
            var col = [{
                field: 'DraftID',
                displayName: $translate.instant('DraftID'),
                minWidth: 180,
                cellTooltip: true,
                cellTemplate: '<a ng-click="grid.appScope.openModalDetail(row.entity.DraftID)"  style="padding:5px;display:block; cursor:pointer">{{COL_FIELD}}</a>'
            },
            {
                field: 'SampleName',
                displayName: $translate.instant('SampleID'),
                minWidth: 100,
                cellTooltip: true
                // cellTemplate: '<span >{{grid.appScope.getSampleName(row.entity.SampleName)}}</span>'
            },
            {
                field: 'Description_EN',
                displayName: $translate.instant('SampleName'),
                minWidth: 150,
                cellTooltip: true
            },
            {
                field: 'LOT_NO',
                displayName: $translate.instant('LOT_NO'),
                minWidth: 100,
                cellTooltip: true

            },
            {
                field: 'Purpose',
                displayName: $translate.instant('Purpose'),
                minWidth: 100,
                cellTooltip: true

            },
            {
                field: 'CreateDate',
                displayName: $translate.instant('CreateDate'),
                minWidth: 180,
                cellTooltip: true
            },
            {
                field: 'Owner',
                displayName: $translate.instant('Owner'),
                minWidth: 80,
                cellTooltip: true
            },
            {
                field: 'Specification',
                displayName: $translate.instant('Specification'),
                minWidth: 150,
                cellTooltip: true
            },
            {
                field: 'UploadedFile',
                displayName: $translate.instant('UploadedFile'),
                minWidth: 30,
                cellTooltip: true
            }

            ];
            $scope.gridOptions = {
                columnDefs: col,
                data: [],
                enableColumnResizing: true,
                enableSorting: true,
                showGridFooter: true,
                gridFooterTemplate: '<div class="mygridFooter"><b>Total: {{grid.appScope.Total}} items </b></div>',
                // showColumnFooter: true,
                enableGridMenu: true,
                //   exporterMenuPdf: false,
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
                        userid: Auth.username,
                        tcode: $scope.flowkey
                    }, function () {
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
                        $scope.Search();
                    });
                }

            };
            var paginationOptions = {
                pageNumber: 1,
                pageSize: 50,
                sort: null
            };

            var gridMenu = [{
                title: $translate.instant('Create'),
                action: function () {

                    $('#myModal').modal('show');
                },
                order: 1
            },
            {
                title: $translate.instant('Delete'),
                action: function ($event) {
                    var selectRows = $scope.gridApi.selection.getSelectedGridRows();
                    var VoucherID = selectRows[0].entity.VoucherID;
                    var State = selectRows[0].entity.State;
                    if (VoucherID) {
                        if (State != '0') {
                            Notifications.addError({
                                'status': 'error',
                                'message': 'Status is eroor,can not delete'
                            });
                            return;
                        }
                        if (confirm('IS delete this VoucherID: ' + VoucherID)) {

                            LIMSService.Entrusted.DeleteRequisionStatus({
                                voucherID: VoucherID
                            }, {}).$promise.then(function (res) {
                                Notifications.addMessage({
                                    'status': 'info',
                                    'message': 'Delete success'
                                });
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
            }
            ];
            $scope.Close = function () {
                newinit();
                $('#myModal').modal('hide');
            };

            $scope.$watch('entrust.SampleName', function (n) {
                //var entrust.SampleName = $scope.entrust.SampleName.SampleName; we need simple code
                if (n !== undefined && $scope.entrust.SampleName) {
                    $scope.entrust.Properties = [];
                    LIMSBasic.GetMaterial({
                        userid: Auth.username,
                        sampleName: $scope.entrust.SampleName,
                        query: '0'
                    }, function (res) {
                        $scope.materialList = res;
                    });
                    LIMSBasic.GetAttribute({
                        sampleName: $scope.entrust.SampleName
                    }, function (res) {
                        $scope.Attribute = res;
                    });

                    LIMSBasic.GetSpec({
                        sampleName: $scope.entrust.SampleName
                    }, function (res) {
                        $scope.entrust.Spec = res.Msg;

                    });
                } else {
                    newinit();
                }
            });

            /**
             * Load Department into Combobox
             * */
            LIMSService.Entrusted.GetEntrustDepartment({}, function (res) {
                $scope.CDepartmentList = res;
            });

            $scope.Search = function () {
                $scope.Total = 0;
                if ($scope.onlyOwner == true) {
                    $scope.Owner = Auth.username;
                } else {
                    //$scope.Owner = '';
                    $scope.Owner = $scope.department;
                }
                LIMSService.Entrusted.GetEntrustVoucher({
                    userID: Auth.username,
                    sendB: $scope.dateFrom,
                    sendE: $scope.dateTo,
                    owner: $scope.Owner || '',
                    state: $scope.Status || ''
                }, function (res) {

                    $scope.Total = res.length;
                    $scope.gridOptions.data = res;
                });
            };

            $scope.CreateVoucher = function () {
                var propList = GetProperty();
                if (propList.length <= 0) {
                    Notifications.addError({
                        'status': 'error',
                        'message': 'Please Choose Property!'
                    });
                    return;
                }

                $scope.entrust.UserID = Auth.username;
                $scope.entrust.Properties = propList;
                console.log($scope.entrust);
                LIMSService.Entrusted.Create({}, $scope.entrust).$promise.then(function (res) {
                    console.log(res);
                    if (res.Error) {
                        Notifications.addError({
                            'status': 'error',
                            'message': res.Error
                        });
                    } else {
                        $scope.entrust.VoucherID = res.VoucherId;
                        $scope.entrust.DraftID = res.DraftID;
                        LIMSService.EntrustedInfo().GetDraft({
                            draftID: $scope.entrust.DraftID
                        }).$promise.then(function (ress) {
                            console.log(ress);
                            $scope.Drafts = ress;
                        }, function (error) {
                            $scope.error = error;
                        });
                    }
                });
                function GetProperty() {
                    var propList = [];
                    for (var i = 0; i < $scope.Attribute.length; i++) {
                        if ($scope.Attribute[i].Selected) {
                            propList.push($scope.Attribute[i]);
                        }
                    }
                    return propList;
                }
                $scope.Clear = function () {
                    newinit();
                }
            };

            /**
             * Option Report output
             * By Isaac 
             */
            var buttonCommon = {
                exportOptions: {
                    format: {
                        body: function (data, row, column, node) {
                            // Strip $ from salary column to make it numeric                        
                            return data.replace(/[$Z]/g, '');
                        }
                    }
                }
            }

            function LoadGrid(gridData, displayColumnNames) {
                var columnKeys = [];
                displayColumnNames.forEach(element => {
                    columnKeys.push({
                        "data": element,
                        "mRender": function (data, type, full) {
                            if (data.contains('*ValueSpec')) {
                                return 'ValueSpec';
                            }

                            var rest = data.match(/\w*-\w*.pdf/);//Get string filename
                            var value = data.split(/@\w*-\w*.pdf/gm);

                            if (data.contains('$')) { /*OVERRANGE NUMBER VALUE*/
                                if (!data.contains('@'))
                                    return '<span class="Overrange">' + data.substring(1) + '</span>';
                                else {
                                    if (data.contains('$') && data.contains('@')) {
                                        return '<span class="Overrange">' + value[0].substring(1) + '</span>' + '  <a  href=' + rest + ' target="_blank"><span style="color: #563d7c" class="glyphicon glyphicon-file"></span></a>';
                                    } else {
                                        var rs = value[0].substring(1) + '  <a  href=' + rest + ' target="_blank"><span style="color: #563d7c" class="glyphicon glyphicon-file"></span></a>';
                                        return rs;
                                    }
                                }
                            }
                            else {
                                if (!data.contains('@'))
                                    return '<span>' + data + '</span>';
                                else {
                                    return value[0] + '  <a  href=' + rest + ' target="_blank"><span style="color: #563d7c" class="glyphicon glyphicon-file"></span></a>';
                                }

                            }


                            switch (data) {
                                case 'N': /*OVERRANGE STRING VALUE*/
                                    return '<span class="Overrange">' + data + '</span>';
                                    break;
                                case 'Y': /*INRRANGE STRING VALUE*/
                                    return '<span class="Inrange">' + data + '</span>';
                                    break;
                            }
                            return data;

                        }
                    })
                });
                OtherCreateHTMLTable(displayColumnNames, gridData);
                table = $(myTable).dataTable({
                    processing: true,
                    fixedHeader: true,
                    data: gridData,
                    dom: 'Bfrtip',
                    buttons: [
                        // $.extend(true, {}, buttonCommon, {
                        //     extend: 'pdfHtml5',
                        //     text:'Download PDF',                       
                        //     title:'Entrusted Result'
                        // }),
                        // $.extend(true, {}, buttonCommon, {
                        //     extend: 'excelHtml5',
                        //     text:'Download Excel',                       
                        //     title:'Entrusted Result'

                        // })  

                        'copyHtml5',
                        'excelHtml5'
                    ],
                    columns: columnKeys,
                    // scrollY: 400,
                    // autoWidth: true,
                    // scrollX: true,
                    deferRender: true,
                    keys: true,
                    lengthMenu: [
                        [100, 50, 25, -1],
                        [100, 50, 25, "All"]
                    ],
                    order: [],
                    colReorder: true,
                    deferLoading: 57,


                });
            }

            function OtherCreateHTMLTable(columnsName, data) {
                if (data.length > 0) {
                    fnDestroyTable();
                    var $toAttach = $("<thead><tr></tr></thead>");
                    columnsName.forEach(element => {
                        var $thead = $("<th></th>");
                        $thead.text(element);
                        $toAttach.find("tr").append($thead);
                    });
                    $(myTable).append($toAttach);

                } else {
                    fnDestroyTable();
                }
            }

            function fnDestroyTable() {
                if ($.fn.DataTable.isDataTable(myTable)) {
                    $(myTable).dataTable().fnDestroy();
                    $(myTable).empty(); // empty in case the columns change


                }
            }

        }
    ])
});