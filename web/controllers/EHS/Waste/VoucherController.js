define(['myapp', 'controllers/EHS/Waste/Directive/VoucherDirective', 'angular', 'jszip', 'xlsx'], function (myapp, angular, jszip, xlsx) {
    myapp.controller('VoucherController', ['$filter', 'Notifications', 'Auth', 'EngineApi', 'VoucherService', 'WasteItemService', 'CompanyService', '$translate', '$q', '$scope', '$routeParams',
        function ($filter, Notifications, Auth, EngineApi, VoucherService, WasteItemService, CompanyService, $translate, $q, $scope, $routeParams) {
            var lang = window.localStorage.lang;
            $scope.recod = {};
            $scope.onlyOwner = true;
            $scope.isError = false;
            $scope.status = '';
            var paginationOptions = {
                pageNumber: 1,
                pageSize: 50,
                totalItems: 0,
                sort: null
            };
            var full_lsWastItems = []; //defaul Full list
            var full_lsCompany = [];
            $scope.disableProcessComp = false;
            /**
             * Init data
             */
            
            $q.all([loadDepartment(), loadCompany(), loadWasteItems()]).then(function (result) {
                $scope.statuslist = [{
                    id: 'N',
                    name: $translate.instant('StatusN')
                },
                {
                    id: 'M',
                    name: $translate.instant('StatusM')
                },
                {
                    id: 'X',
                    name: $translate.instant('StatusX')
                }
                ];
                console.log(result);
            }, function (error) {
                Notifications.addError({
                    'status': 'Failed',
                    'message': 'Loading failed: ' + error
                });
            });
            /*
             * Load VoucherDetail
             */
            function loadVoucherDetail(id) {
                var deferred = $q.defer();
                VoucherService.FindByID({
                    VoucherID: id
                }, function (data) {
                    $scope.recod.voucher_id = data.VoucherID;
                    $scope.recod.owner_comp = data.OwnerComp;
                    $scope.recod.process_comp = data.ProcessComp;
                    $scope.recod.voucher_number = data.VoucherNumber; //$scope.recod.voucher_number;
                    $scope.recod.depart_req = data.DepartReq;
                    $scope.recod.depart_process = data.DepartProcess;
                    $scope.recod.internal_phone = data.InternalPhone;
                    $scope.recod.location = data.Location;
                    $scope.recod.date_out = $filter('date')(data.DateOut, 'yyyy-MM-dd');
                    $scope.recod.date_complete = $filter('date')(data.DateComplete, 'yyyy-MM-dd');
                    $scope.recod.return_reason = data.ReturnReason;
                    $scope.recod.create_time = data.CreateTime;
                    $scope.wasteItems = []; //list details of wasteitems
                    $scope.processcomp_reupdate_wastelist(data.ProcessComp);
                    data.VoucherDetails.forEach(element => {
                        var x = {};
                        var item = full_lsWastItems.filter(x => x.WasteID === element.WasteID);
                        if (item.length > 0) {
                            x.method_name = item[0].MethodDescription;
                            x.waste_name = item[0].WasteDescription;
                            x.Quantity = element.Quantity;
                            x.Weight = element.Weight;
                            x.WasteID = element.WasteID;
                            $scope.wasteItems.push(x);
                        }
                    })
                    console.log(data);
                    deferred.resolve(data);
                }, function (error) {
                    deferred.reject(error); P
                })
                return deferred.promise;
            }

            /**
             * Load Department into Combobox
             * */
            function loadDepartment() {
                var deferred = $q.defer();
                var query = {
                    DepartType: 'Department',
                    lang: lang
                };
                VoucherService.GetDepartment(query, function (data) {
                    $scope.departments = data;
                    deferred.resolve(data);
                }, function (error) {
                    deferred.resolve(error);
                })
                query.DepartType = 'CenterDepartment';
                VoucherService.GetDepartment(query, function (data) {
                    $scope.cdepartments = data;
                    deferred.resolve(data);
                }, function (error) {
                    deferred.resolve(error);
                })

            }
            function loadCompany() {
                var deferred = $q.defer();
                CompanyService.GetCompany(function (data) {
                    console.log(data);
                    $scope.company = full_lsCompany = data;
                    deferred.resolve(data);
                }, function (error) {
                    deferred.resolve(error);
                })
            }
            /**
             * Load WasteItems (update entities)
             */
            function loadWasteItems() {
                var deferred = $q.defer();
                var query = {
                    WasteID: '',
                    lang,
                    ProcessComp: ''
                }
                WasteItemService.GetWasteItem(query, function (data) {
                    console.log(data);
                    full_lsWastItems = data;
                    deferred.resolve(data);
                }, function (error) {
                    deferred.resolve(error);
                })
            }

            /**
             * Define All Columns in UI Grid
             */
            var col = [{
                field: 'VoucherID',
                minWidth: 120,
                displayName: $translate.instant('VoucherID'),
                cellTooltip: true,
                visible: true,
                cellTemplate: '<a href="#/waste/Voucher/print/{{COL_FIELD}}" style="padding:5px;display:block; cursor:pointer" target="_blank">{{COL_FIELD}}</a>'

            },
            {
                field: 'UserID',
                minWidth: 100,
                displayName: $translate.instant('CreateBy'),
                cellTooltip: true
            },
            {
                field: 'Status',
                displayName: $translate.instant('Status'),
                minWidth: 110,
                cellTooltip: true,
                cellTemplate: '<span>&nbsp{{grid.appScope.getVoucherStatus(row.entity.Status)}}</span>'
            },
            {
                field: 'OwnerComp',
                displayName: $translate.instant('OwnerComp'),
                minWidth: 120,
                cellTooltip: true,
                visible: false

            },
            {
                field: 'ProcessComp',
                minWidth: 120,
                displayName: $translate.instant('ProcessComp'),
                cellTooltip: true
            },
            {
                field: 'VoucherNumber',
                minWidth: 155,
                displayName: $translate.instant('VoucherNumber'),
                cellTooltip: true
            },
            {
                field: 'DepartReq',
                minWidth: 100,
                displayName: $translate.instant('DepartReq'),
                cellTooltip: true
            },
            {
                field: 'DepartProcess',
                minWidth: 100,
                displayName: $translate.instant('DepartProcess'),
                cellTooltip: true
            },
            {
                field: 'DateOut',
                minWidth: 100,
                displayName: $translate.instant('DateOut'),
                cellTooltip: true
            },
            {
                field: 'InternalPhone',
                minWidth: 80,
                displayName: $translate.instant('InternalPhone'),
                cellTooltip: true
            },
            {
                field: 'Location',
                minWidth: 120,
                displayName: $translate.instant('Location'),
                cellTooltip: true
            },
            {
                field: 'SumTotal',
                minWidth: 80,
                displayName: $translate.instant('SumTotal'),
                cellTooltip: true
            },
            {
                field: 'SumQty',
                minWidth: 80,
                displayName: $translate.instant('SumQty'),
                cellTooltip: true
            },
            {
                field: 'CreateTime',
                displayName: $translate.instant('CreateTime'),
                width: 170,
                minWidth: 150,
                cellTooltip: true
            }
            ];
            $scope.getVoucherStatus = function (id) {
                var statLen = $filter('filter')($scope.statuslist, { 'id': id });
                if (statLen.length > 0) {
                    return statLen[0].name;
                } else {
                    return id;
                }
            };
            /**
             * Query Grid setting
             */
            $scope.gridOptions = {
                columnDefs: col,
                data: [],
                enableColumnResizing: true,
                enableFullRowSelection: true,
                enableSorting: true,
                showGridFooter: false,
                enableGridMenu: true,
                exporterMenuPdf: false,
                enableSelectAll: false,
                enableRowHeaderSelection: true,
                enableRowSelection: true,
                multiSelect: false,
                paginationPageSizes: [100, 200, 500,1000],
                paginationPageSize: 500,
                enableFiltering: false,
                exporterOlderExcelCompatibility: true,
                useExternalPagination: true,
                enablePagination: true,
                enablePaginationControls: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({
                        'userid': Auth.username,
                        'tcode': 'HW-User'
                    }, function (linkres) {
                        if (linkres.IsSuccess) {
                            //linkres.IsSuccess
                            gridApi.core.addToGridMenu(gridApi.grid, gridMenu);
                        }
                    });
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.selectedSupID = row.entity.SupID;
                    });
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        paginationOptions.pageNumber = newPage;
                        paginationOptions.pageSize = pageSize;
                        $scope.Search();
                    });
                }
            };

            /**
             *search list function
             */
            function SearchList() {
                var query = {};
                query.userID = Auth.username;
                query.lang = lang;
                query.dateFrom = $scope.dateFrom || '';
                query.dateTo = $scope.dateTo || '';
                query.VoucherID = '';
                query.VoucherNumber = $scope.voucher_number || '';
                query.ProcessComp = $scope.process_comp || '';
                query.DepartProcess = $scope.depart_process || '';
                query.InternalPhone = '';
                query.DepartReq = $scope.DepartReq || '';
                query.Status = $scope.s_status || '';
                if ($scope.onlyOwner == true)
                    query.isCheck = 1;
                else query.isCheck = 0;
                return query;
            }

            function deleteById(id) {
                var data = {
                    VoucherID: id
                };
                VoucherService.DeleteByVoucherID(data, function (res) {
                    if (res.Success) {
                        $scope.Search();
                        $('#myModal').modal('hide');
                        $('#messageModal').modal('hide');
                        $('#nextModal').modal('hide');
                    } else {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('saveError') + res.Message
                        });
                    }

                },
                    function (error) {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('saveError') + error
                        });
                    })
            }
            /**
             *Search function for Button Search
             */
            $scope.Search = function () {
                var deferred = $q.defer();
                if (!$scope.checkErr()) {
                    var deferred = $q.defer();
                    var query = SearchList();
                    query.pageIndex = paginationOptions.pageNumber || '';
                    query.pageSize = paginationOptions.pageSize || '';
                    console.log(query);
                    VoucherService.Search(query, function (res) {
                        $scope.gridOptions.data = res.TableData;
                        $scope.gridOptions.totalItems = res.TableCount[0];

                        //deferred.resolve(data);
                    }, function (error) {
                        deferred.reject(error);
                    })
                }
            }

            var gridMenu = [{
                title: $translate.instant('Create'),
                action: function () {
                    $scope.reset();
                    $scope.recod.owner_comp = 'DBF1EA58-1326-442B-B4C3-897063F4F7FE';
                    $scope.status = 'N';
                    $scope.lsWastItems = [];
                    // $("#ProcessComp").prop('disabled', false);
                    $("#DateOut").prop('disabled', false);
                    $("#DeparReq").prop('disabled', false);
                    $('#myModal').modal('show');
                },
                order: 1
            }, {
                title: $translate.instant('Update'),
                action: function () {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    $scope.recod.comp_id = resultRows
                    $scope.status = 'M'; //Set update Status
                    if (resultRows.length == 1) {
                        if (resultRows[0].Status != 'X' && resultRows[0].Status != 'M') {
                            if (resultRows[0].UserID == Auth.username) {
                                $scope.gd = {};
                                var querypromise = loadVoucherDetail(resultRows[0].VoucherID);
                                $("#ProcessComp").prop('disabled', true); //disable ProcessComp text
                                $("#DateOut").prop('disabled', true);
                                $("#DeparReq").prop('disabled', true);
                                $scope.company = full_lsCompany;
                                querypromise.then(function () {
                                    $('#myModal').modal('show');
                                }, function (error) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': error
                                    });
                                })
                            }
                            else {
                                Notifications.addError({ 'status': 'error', 'message': $translate.instant('ModifyNotBelongUserID') })
                            }


                        }
                        else {
                            Notifications.addError({
                                'status': 'error',
                                'message': resultRows[0].Status == 'M' ? $translate.instant('Modified_Once') : $translate.instant('Modified_to_X')
                            });
                        }

                    } else {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('Select_ONE_MSG')
                        });
                    }
                },
                order: 2
            },
            {
                title: '🖨️ '+$translate.instant('PrintReport'),
                action: function () {
                    var resultRows = $scope.gridApi.selection.getSelectedRows();

                    if (resultRows.length == 1) {
                        var href = '#/waste/Voucher/print/' + resultRows[0].VoucherID;
                        window.open(href);
                    } else {
                        Notifications.addError({
                            'status': 'error',
                            'message': $translate.instant('Select_ONE_MSG')
                        });
                    }
                },
                order: 4
            },
            {
                title: '📗 '+$translate.instant('DetailExport'),
                action: function () {
                    var req = SearchList();
                    VoucherService.ExportXLSData(req, function (res) {
                        console.log(res);
                        if (res.length > 0) {
                            /**Add another header row before adding data */
                            var headArray =
                                [
                                    $translate.instant('VoucherID'),
                                    $translate.instant('VoucherNumber'),
                                    $translate.instant('OwnerComp'),
                                    $translate.instant('ProcessComp'),
                                    $translate.instant('DepartProcess'),
                                    $translate.instant('DepartReq'),
                                    $translate.instant('InternalPhone'),
                                    $translate.instant('Location'),
                                    $translate.instant('DateOut'),
                                    $translate.instant('DateComplete'),
                                    $translate.instant('UserID'),
                                    $translate.instant('CreateTime'),
                                    $translate.instant('Stamp'),
                                    $translate.instant('Status'),
                                    $translate.instant('ItemCode'),
                                    $translate.instant('WasteItemDescription'),
                                    $translate.instant('State'),
                                    $translate.instant('Weight'),
                                    $translate.instant('SumTotal'),
                                    $translate.instant('Quantity')
                                ];
                            res.forEach(function(item, index, arr){
                                item.Status =   $translate.instant('Status'+item.Status);
                                switch (item.State){
                                    case 'S': item.State= $translate.instant('Solid'); break;
                                    case 'L': item.State= $translate.instant('Liquid'); break;
                                    case 'M': item.State= $translate.instant('Sludge'); break;
                                }
                            } )

                            
                            var ws = XLSX.utils.aoa_to_sheet([headArray]);
                            /** xlsx - add data to file, ingore original header */
                            XLSX.utils.sheet_add_json(ws, res, { skipHeader: true, origin: 'A2' });
                            /** make workbook */
                            var wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, $translate.instant('DetailExport'));
                            /** write and download file */
                            XLSX.writeFile(wb, $translate.instant('Report') + '_EHS.xls');
                        }
                        else Notification.addError({
                            'status': 'error',
                            'message': $translate.instant('Get no data.')
                        })
                    })


                },
                order: 5
            }
            ];
            /**
             * Trigger option changedValue of wasteitem to find method
             */
            $scope.$watch('gd.WasteID', function (n) {
                if (n !== undefined && $scope.gd.WasteID !== null) {
                    var data = full_lsWastItems.filter(x => x.WasteID === n);
                    if (data.length > 0) {
                        $scope.gd.method_name = data[0].MethodDescription;
                        $scope.gd.waste_name = data[0].WasteDescription;
                    }
                }
            })
            $scope.changedValue = function (item) {
                //console.log(item);

            }
            /**
             * Add wasteitem in param table (Voucherdetail)
             */
            $scope.addWasteItem = function () {
                if ($scope.gd != null || $scope.gd != {}) {
                    var data = $scope.wasteItems.filter(x => x.waste_name === $scope.gd.waste_name);

                    if (data.length != 0) {
                        alert($scope.gd.waste_name + ": " + $translate.instant('waste_name_existed'));
                        $scope.gd = {};
                    }
                    else {
                        if ($scope.gd.Quantity < 0 || $scope.gd.Weight <= 0) {
                            alert($scope.gd.waste_name + ": " + $translate.instant('positive_quantity_weight'));
                            $scope.gd.Quantity = null;
                            $scope.gd.Weight = null;
                        }
                        else {
                            $scope.wasteItems.push($scope.gd);
                            $scope.gd = {};
                        }
                    }
                }
            };
            /**Modal: detail slice WasteItem from list */
            $scope.deleteWasteItem = function (index) {
                $scope.wasteItems.splice(index, 1);

            };
            $scope.clear = function () {
                $scope.recod = {};

                $('#myModal').modal('hide');
            }

            /**Choose process to show Waste Items */
            $scope.processcomp_reupdate_wastelist = function (process_comp) {

                $scope.gd = {};
                if (process_comp == null || process_comp == '') return;
                WasteItemService.GetWasteByCompany({ comp: process_comp, lang: lang }, function (res) {
                    if (res.length > 0)
                        $scope.lsWastItems = res;
                    else $scope.lsWastItems = [];
                })
                $scope.wasteItems = [];
            };
            /**check erorr before search */
            $scope.checkErr = function () {
                var startDate = $scope.dateFrom;
                var endDate = $scope.dateTo;
                $scope.errMessage = '';
                if (new Date(startDate) > new Date(endDate)) {
                    $scope.isError = true;
                    $scope.errMessage = 'End Date should be greater than Start Date';
                    Notifications.addError({
                        'status': 'error',
                        'message': $scope.errMessage
                    });
                    return true;
                }
                return false;
            };

            /** date check example
                        $scope.dateCheck = function (DO) {
                            if ($filter('date')(new Date(DO), 'MM/dd/yyyy') < $filter('date')(new Date(), 'MM/dd/yyyy')) {
                                Notifications.addError({ 'status': 'error', 'message': $translate.instant('DateOut_check_ISG') });
                                $scope.recod.date_out = '';
                                return false;
                            }
                            else return true;

                        }


            */


        }])
})
