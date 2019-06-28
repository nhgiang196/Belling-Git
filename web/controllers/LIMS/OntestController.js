/**
 * Created by phkhoi on 2017-11-04.
 */
/*eslint-env jquery*/
define(['myapp', 'angular','jquery'], function (myapp, angular,jquery) {
    myapp.controller('OnTestController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService',
        'Notifications',  'Auth', 'uiGridConstants', '$translatePartialLoader', '$translate','LIMSService','LIMSBasic', 'EngineApi',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, Auth, uiGridConstants,
            $translatePartialLoader, $translate,LIMSService,LIMSBasic,EngineApi) {
            $scope.note = {};
            $scope.flowkey = 'PVLIMS-003';
            $scope.new = {};
            $scope.Tighted={};
            $scope.lang= window.localStorage.lang;
            $scope.note.DateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.note.DateTo = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.new.SheetDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm');
            $scope.new.SampleID = $filter('date')(new Date(), 'yyyyMMddHHmm')
            $scope.owner = true;
            var q_category = {userid: Auth.username, Language: $scope.lang};
            LIMSBasic.GetCategorys(q_category, function (data) {
                console.log(data)
                $scope.CategoryList = data;
                $scope.note.TypeID=2;
            });
            //UI for query
            $scope.$watch('note.TypeID', function (n) {
                if (n != null) {
                    var q_sample = {userid: Auth.username, TypeID: $scope.note.TypeID};
                    LIMSBasic.GetSamplesByCategory(q_sample, function (data) {
                        console.log(data)
                        $scope.SampleList = data;
                    });
                }
            });
            //UI for new
            $scope.$watch('new.TypeID', function (n) {
                if (n != null) {
                    var q_sample = {userid: Auth.username, TypeID: $scope.new.TypeID};
                    LIMSBasic.GetSamplesByCategory(q_sample, function (data) {
                        console.log(data)
                        $scope.SampleList = data;
                    });
                }
            });
            var q_status = {Ctype:'PlanAdd',lang:$scope.lang}
            LIMSBasic.GetStatus(q_status,function(data){
                console.log(data);
                $scope.StatusList= data;
            });
            var q_createtype = {userId:Auth.username, lang:$scope.lang}
            LIMSBasic.GetCreateType(q_createtype,function(data){
                console.log(data)
                $scope.CreateType = data;
            })
            $scope.getSampleName = function (sample) {
                var statLen = $filter('filter')($scope.SampleList, {'SampleName': sample});
                if (statLen.length > 0) {
                    return statLen[0]['Description_'+$scope.lang||'EN'];
                } else {
                    return sample;

                }

            }; 

            $scope.getStatus = function (status) {
                var statLen = $filter('filter')($scope.StatusList, {'State': status});
                if (statLen.length > 0) {
                    return statLen[0].StateSpec;
                } else {
                    return status;

                }

            };

            // Get Material for query page
            $scope.$watch('note.SampleName' , function(n){
                if (n !== undefined && $scope.sampleName !== null) {

                    LIMSBasic.GetMaterial({
                        userid: Auth.username,
                        sampleName: $scope.note.SampleName,
                        query: '0'
                    }, function (res) {
                        $scope.materialList = res;
                    });
                }
                else
                {
                    $scope.note.Material = '';
                }
            })
            // Get Material for Add new modal
            $scope.$watch('new.SampleName', function(n){
                if (n !== undefined && $scope.sampleName !== null) {
                    LIMSBasic.GetMaterial({
                        userid: Auth.username,
                        sampleName: $scope.new.SampleName,
                        query: '0'
                    }, function (res) {
                        $scope.materialList = res;
                    });
                }
            })
            

            $scope.Search = function () {
                Query()
            }
            function Query(){
                var query = {};
                if($scope.owner == true) {
                    query.userID = Auth.username;
                }else{
                    query.userID = '';
                }
                query.begin = $scope.note.DateFrom || '';
                query.end = $scope.note.DateTo || '';
                query.samplename = $scope.note.SampleName || '';
                query.lot_no = $scope.note.Material || '';
              
                LIMSService.Entrusted.QueryPlanAdd(query).$promise.then(function(res){
                    console.log(res);
                    $scope.gridOptions.data = res;
                })
            }
            $scope.savesubmit = function(){
                var outTime = $filter('date')(new Date(), 'yyyy-MM-dd');
                $scope.Tighted.SampleName = $scope.new.SampleName
                $scope.Tighted.LOT_NO = $scope.new.LOT_NO
                $scope.Tighted.LINE = $scope.new.Line
                $scope.Tighted.ProdDate = outTime
                $scope.Tighted.SampleID =  $scope.new.SampleID
                $scope.Tighted.purpose = $scope.new.Purpose
                $scope.Tighted.UserID = Auth.username;  
                $scope.Tighted.State = '0';
                $scope.Tighted.CompanyOfferSample = '';
                $scope.Tighted.CompanyProduce = '';
                $scope.Tighted.POY_LOT_NO = '';
                $scope.Tighted.SheetDate =  $scope.new.SheetDate||'';
                $scope.Tighted.CreateType = $scope.new.CreateType;
                $scope.Tighted.UserID=Auth.username;
                LIMSService.Entrusted.CreatePlanAdd({}, $scope.Tighted).$promise.then(function(res){
                    if(res.Error)
                    {
                        Notifications.addError({'status': 'error', 'message': res.Error});
                    }else{
                        console.log(res);
                        Notifications.addMessage({'status': 'information', 'message': 'Save success !!!'});
                        Query();
                        $('#myModal').modal('hide');
                        Clear();
                    }
                   
                }, function (errormessage) {
                    Notifications.addError({'status': 'error', 'message': errormessage});
                });

            }
            var col = [
                {
                    field: 'VoucherID',
                    displayName: $translate.instant('VoucherID'),
                    minWidth: 100,
                    cellTooltip: true
                },
                {
                    field: 'SampleName',
                    displayName: $translate.instant('SampleName'),
                    minWidth: 100,
                    cellTooltip: true,
                    cellTemplate: '<span  >{{grid.appScope.getSampleName(row.entity.SampleName)}}</span>'
                },
                {
                    field: 'LOT_NO',
                    displayName: $translate.instant('Material'),
                    minWidth: 100,
                    cellTooltip: true
                },
                {field: 'LINE', displayName: $translate.instant('Line'), minWidth: 100, cellTooltip: true},
                {field: 'SheetDate', displayName: $translate.instant('SheetDate'), minWidth: 100, cellTooltip: true},
                {field: 'ProdDate', displayName: $translate.instant('ProdDate'), minWidth: 100, cellTooltip: true},
                {field: 'SampleID', displayName: $translate.instant('SampleID'), minWidth: 100, cellTooltip: true},
                {field: 'State', displayName: $translate.instant('Status'), minWidth: 100, cellTooltip: true,
                    cellTemplate: '<span  >{{grid.appScope.getStatus(row.entity.State)}}</span>'
                },
                {field: 'Purpose', displayName: $translate.instant('Purpose'), minWidth: 100, cellTooltip: true},
                {field: 'UserID', displayName: $translate.instant('Owner'), minWidth: 100, cellTooltip: true},
            ]
            var paginationOptions = {
                pageNumber: 1,
                pageSize: 50,
                sort: null
            };
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
                    EngineApi.getTcodeLink().get({'userid': Auth.username, 'tcode': $scope.flowkey}, function (linkres) {
                        // if (linkres.IsSuccess) {
                        gridApi.core.addToGridMenu(gridApi.grid, gridMenu);

                        // }
                    })
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

            var gridMenu = [{
                title: $translate.instant('Add'),
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
                    var State=selectRows[0].entity.State;
                    if (VoucherID) {
                        if(State!='0')
                        {
                            Notifications.addError({
                                'status': 'error',
                                'message': 'Status is eroor,can not delete'
                            });
                            return;
                        }
                        if (confirm($translate.instant('Delete_IS_MSG') + ' VoucherID: ' + VoucherID)) {

                            LIMSService.Entrusted.DeletePlanAddStatus({
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
                    }   else  {
                        Notifications.addMessage({
                            'status': 'info',
                            'message': 'Please ,Select Row'
                        });
                    }
                },
                order: 4
            }]
            function Clear(){
                $scope.new.SampleName = '';
                $scope.new.LOT_NO = '';
                $scope.new.Line = '';
                $scope.new.DateTo = '';
                $scope.new.Purpose = '';
                $scope.new.CreateType='';

            }

        }])
    ;

})
;