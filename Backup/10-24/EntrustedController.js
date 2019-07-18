/**
 * Created by ntdung on 11/4/2017.
 */
/*eslint-env jquery*/
define(['myapp', 'angular'], function (myapp) {
    myapp.controller('EntrustedController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location',
        'i18nService', 'Notifications', 'Auth', 'uiGridConstants', '$http',
        '$translatePartialLoader', '$translate', 'LIMSBasic', 'LIMSService', 'EngineApi',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, Auth, uiGridConstants, $http, $translatePartialLoader, $translate, LIMSBasic, LIMSService, EngineApi) {
            $scope.flowkey = 'PVLIMS-004';
            function newinit () {
                $scope.entrust = {};
                $scope.Drafts=[];
                $scope.entrust.GetDate = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm');
                $scope.entrust.SendDate = $filter('date')(new Date(), 'yyyy-MM-dd');
                $scope.entrust.RequireDate = $filter('date')(new Date(), 'yyyy-MM-dd');
            }
            newinit();
            var date = new Date();
            $scope.dateFrom = $filter('date')(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
            $scope.dateTo = $filter('date')(new Date(), 'yyyy-MM-dd');
            var lang = window.localStorage.lang ||'EN';
            $scope.lang =lang;

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
                        $scope.sampleList = data;
                    });
                }
            });

            $scope.getSampleName = function (sample) {
                for(var i =0;i<$scope.sampleList.length;i++){
                    if($scope.sampleList[i].SampleName==sample){
                        console.log($scope.sampleList[i]);
                        return $scope.sampleList[i]['Description_CN'];
                    }
                }
            }; 
            LIMSBasic.GetStatus({ctype:'Requision',lang:lang},function (data) {
                $scope.StatusList = data;
            });
            $scope.getVoucherStatus = function (Status) {
                for(var i =0;i<$scope.StatusList.length;i++){
                    if($scope.StatusList[i].State==Status){
                        return $scope.StatusList[i].StateSpec;
                    }
                }
            };
            $scope.openModalDetail = function (row)
            {
                var voucherid = row.substring(0,12);
                LIMSService.Entrusted.GetDelegateDetailsByVoucherID({voucherid:voucherid}).$promise.then(function(res){
                    console.log(res);
                    $scope.reqHeader=[];
                    if(res.length>0){
                        $scope.reqList  = res;
                        var reqHeader=[];
                        for(var key in res[0]){
                            if(key.indexOf('$')<0 )
                            {
                                reqHeader.push(key)
                            }
                        }
                        $scope.reqHeader = reqHeader;
                        console.log(reqHeader);
                        console.log($scope.reqList)
                    }
                });
                $('#myModalDetail').modal('show');

            };
            var col = [
                {
                    field: 'VoucherID',
                    displayName: $translate.instant('ID'),
                    minWidth: 180,
                    cellTooltip: true,
                    cellTemplate:'<a ng-click="grid.appScope.openModalDetail(row.entity.VoucherID)"  style="padding:5px;display:block; cursor:pointer">{{COL_FIELD}}</a>'
                },
                {
                    field: 'Description_EN',
                    displayName: $translate.instant('SampleName'), minWidth: 200,
                    cellTooltip: true
                    // cellTemplate: '<span >{{grid.appScope.getSampleName(row.entity.SampleName)}}</span>'
                },
                {field: 'LOT_NO', displayName: $translate.instant('MaterialSpec'), minWidth: 180, cellTooltip: true},
                {
                    field: 'State',
                    displayName: $translate.instant('Status'),
                    minWidth: 180, cellTooltip: true,
                    cellTemplate: '<span >{{grid.appScope.getVoucherStatus(row.entity.State)}}</span>'
                },
                {
                    field: 'GetDate',
                    displayName: $translate.instant('SampleExtraction'),
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'SendDate',
                    displayName: $translate.instant('Sample Send Date'),
                    minWidth: 180,
                    cellTooltip: true
                },
                {
                    field: 'Purpose',
                    displayName: $translate.instant('Experimental purposes'),
                    minWidth: 180,
                    cellTooltip: true
                },
                {field: 'SampleFrom', displayName: $translate.instant('Sample From'), minWidth: 80, cellTooltip: true}

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
                    EngineApi.getTcodeLink().get({userid: Auth.username, tcode: $scope.flowkey}, function () {
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
                    var State=selectRows[0].entity.State;
                    if (VoucherID ) {
                        if(State!='0')
                        {
                            Notifications.addError({
                                'status': 'error',
                                'message': 'Status is eroor,can not delete'
                            });
                            return;
                        }
                        if (confirm( 'IS delete this VoucherID: ' + VoucherID)) {

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
                    }   else  {
                        Notifications.addMessage({
                            'status': 'info',
                            'message': 'Please ,Select Row'
                        });
                    }
                },
                order: 4
            }];



            $scope.Close = function () {
                newinit();
                $('#myModal').modal('hide');
            };

            $scope.$watch('entrust.SampleName', function (n) {
                //var entrust.SampleName = $scope.entrust.SampleName.SampleName; we need simple code
                if (n !== undefined && $scope.entrust.SampleName) {
                    $scope.entrust.Properties=[];
                    LIMSBasic.GetMaterial({
                        userid: Auth.username,
                        sampleName: $scope.entrust.SampleName,
                        query: '0'
                    }, function (res) {
                        $scope.materialList = res;
                    });
                    LIMSBasic.GetAttribute({sampleName: $scope.entrust.SampleName}, function (res) {
                        $scope.Attribute = res;
                    });

                    LIMSBasic.GetSpec({sampleName: $scope.entrust.SampleName}, function (res) {
                        $scope.entrust.Spec = res.Msg;

                    });
                }
                else {
                    newinit();
                }
            });

            $scope.Search = function () {
                $scope.Total = 0;
                if($scope.onlyOwner == true)
                {
                    $scope.Owner = Auth.username;
                }
                else
                {
                    $scope.Owner = '';
                }
                LIMSService.Entrusted.GetEntrustVoucher({userID:Auth.username,sendB:$scope.dateFrom,sendE:$scope.dateTo,owner:$scope.Owner||'',state:$scope.Status||''},function(res){

                    $scope.Total=res.length;
                    $scope.gridOptions.data = res;
                });
            };

            $scope.CreateVoucher = function () {
                var  propList=GetProperty();
                if (propList.length <=0) {
                    Notifications.addError({'status': 'error', 'message': 'Please Choose Property!'});
                    return;
                }

                $scope.entrust.UserID = Auth.username;
                $scope.entrust.Properties = propList;
                console.log( $scope.entrust);
                LIMSService.Entrusted.Create({},$scope.entrust).$promise.then(function (res) {
                    console.log(res);
                    if(res.Error)
                    {
                        Notifications.addError({'status': 'error', 'message':res.Error});
                    }else
                    {
                        $scope.entrust.VoucherID =res.VoucherId;
                        $scope.entrust.DraftID=res.DraftID;
                        LIMSService.EntrustedInfo().GetDraft({draftID: $scope.entrust.DraftID}).$promise.then(function (ress) {
                            console.log(ress);
                            $scope.Drafts=ress;
                        }, function (error) {
                            $scope.error=error;
                        });
                    }


                });

                function GetProperty(){
                    var propList=[];
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

        }])
});