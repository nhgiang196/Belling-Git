/**
 * Created by Isaac
 */
/*eslint-env jquery*/
define(['myapp', 'angular', 'jquery'], function (myapp, angular, jquery) {
    myapp.controller('QueryPlansController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'LIMSService', 'LIMSBasic',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, LIMSService, LIMSBasic) {
            $scope.note = {};
            $scope.flowkey = 'GateMisUser';
            $scope.note = {};
            $scope.lang = window.localStorage.lang || 'EN';
            $scope.note.DateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.note.DateTo = $filter('date')(new Date(), 'yyyy-MM-dd');

            var myTable = '#data';

            var q_category = {
                userid: Auth.username,
                Language: $scope.lang
            };
            LIMSBasic.GetCategorys(q_category, function (data) {
                console.log(data)
                $scope.CategoryList = data;
                $scope.note.TypeID = 2;

            });
            //UI for query
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
                    fnDestroyTable();

                }
            });
            // Load Material on query page

            // Get Material for query page
            $scope.$watch('note.SampleName', function (n) {
                if (n !== undefined && $scope.sampleName !== null) {

                    LIMSBasic.GetMaterial({
                        userid: Auth.username,
                        sampleName: $scope.note.SampleName,
                        query: '0'
                    }, function (res) {
                        $scope.materialList = res;
                    });

                    LIMSBasic.GetLinesByAB({
                        userid: Auth.username,
                        sampleName: $scope.note.SampleName,
                        ab: ''
                    }, function (res) {
                        $scope.LinesList = res;
                    });
                } else {
                    $scope.note.Material = '%';
                    $scope.LinesList = '%';
                }
            })
            $scope.Search = function () {
                Query();
            }

            function Query() {
                var query = {};
                query.b = $scope.note.DateFrom || '';
                query.e = $scope.note.DateTo || '';
                query.sampleName = $scope.note.SampleName || '';
                query.lot_no = $scope.note.Material || '%';
                query.line = $scope.note.Line || '%';
                LIMSService.Entrusted.GetPlans(query).$promise.then(function (res) {
                    console.log(res);
                    $scope.plansHeader = [];
                    if (res.length > 0) {
                        $scope.plansList = res;
                        var plansHeader = [];
                        for (var key in res[0]) {
                            if (key.indexOf('$') < 0) {
                                plansHeader.push(key)
                            }
                        }
                        $scope.headerCount = plansHeader.length * 74;
                        $scope.plansHeader = plansHeader;
                        LoadGrid(res, plansHeader);

                    }else {
                        fnDestroyTable();
                    }
                    

                })

            }
          var showToolTip = function (data) {
                data = data.replace('$', '').replace('#', '').replace('**', 'ValueSpec')
                if (data.contains('|')) {
                    data = data.slice(0, data.indexOf('|'));
                   
                }
                return data;
            };


          var showValue = (data) => {
                var result = data.substr(data.indexOf('|') + 1, 9999);
                return (data.contains('|') ? 'ValueSpec: ' + result : '');
            }
          $('.container')
          .addClass('container-fluid')
          .removeClass('container');
            function LoadGrid(gridData, displayColumnNames) {
                var columnKeys = [];
                displayColumnNames.forEach(element => {
                    columnKeys.push({
                        "data": element
                    });
                });
                OtherCreateHTMLTable(displayColumnNames, gridData);
                table = $(myTable).dataTable({
                    processing: true,
                    fixedHeader: true,
                    data: gridData,
                    dom: 'Bfrltip',
                    buttons: [{
                        extend: 'copyHtml5',
                        className: "btn-sm"
                    },
                        {
                            extend: 'excelHtml5',
                            className: "btn-sm"
                        }
                    ],
                    columns: columnKeys,
                    responsive: 0,
                    scrollY: 400,
                    scrollX: true,
                    deferRender: true,                   
                    scroller: true,
                    keys: true,
                    
                    lengthMenu: [
                        [100, 50, 25, -1],
                        [100, 50, 25, "All"]
                    ],
                    //Set column definition initialisation properties.
                    "columnDefs": [{
                        "width": "5%",
                        "targets": [0], //last column
                        "orderable": 2 //set not orderable
                    }, {
                            "className": "text-center custom-middle-align"                            
                        }
                    ],
                    order: [],
                    rowCallback: function (row, data) {
                        displayColumnNames.forEach((value, index) => {
                            var x = data[value];                          
                            if (x.contains('$')) {
                                $('td:eq(' + index + ')', row).html(x.substring(1)).addClass('Overrange');
                            }
                            if(x.contains('#'))
                            {
                                $('td:eq(' + index + ')', row).html(x.substring(1)).addClass('greenyellow');
                            }
                            if(x.contains('|'))
                            {
                                mdata = showToolTip(x);
                                vdata = showValue(x);
                                $('td:eq(' + index + ')', row).html(mdata)
                                .attr(
                                {
                                    'data-toggle':'tootlip',
                                    'title' :vdata,
                                    'onmouseenter': "$(this).tooltip('show')",
                                    'data-container':'body'
                                })                              
                            }     
                       
                            switch (x) {
                                case 'N':
                                    $('td:eq(' + index + ')', row).addClass('Overrange');
                                    break;
                                case 'Y':
                                    $('td:eq(' + index + ')', row).addClass('Inrange');
                                    break;
                                case 'xxx':
                                $('td:eq(' + index + ')', row).html(x.substring(3));
                                    $('td', row).css('background-color','#80b3bf')
                                    break;
                            }
                                                                         
                        });
                    },
                   // "stripeClasses": [ 'odd-row', 'even-row' ],
                    colReorder :true,
                    deferLoading: 57

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
        
    ]);
  
});

