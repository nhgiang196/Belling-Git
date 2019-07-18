/**
 * Created by Isaac on 2018-09-18.
 */
/*eslint-env jquery*/
define(['myapp', 'angular', 'jquery', 'jszip'], function (myapp, angular, jquery, jszip) {
    myapp.controller('ReportAnalysisController', ['$scope', '$cookies', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', '$upload', '$translatePartialLoader', '$translate', 'LIMSService', 'LIMSBasic',
        function ($scope, $cookies, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, $upload, $translatePartialLoader, $translate, LIMSService, LIMSBasic) {
            // Needed to make DataTables export to Excel work
            window.JSZip = jszip //Very important
            var date = new Date();
            $scope.DateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.DateTo = $filter('date')(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2), 'yyyy-MM-dd');
            $scope.lang = window.localStorage.lang || 'EN';
            var myTable = '#data';
            var q_category = {
                userid: Auth.username,
                Language: $scope.lang
            };
            LIMSBasic.GetCategorys(q_category, function (data) {
                console.log(data)
                $scope.CategoryList = data;

            });
            //UI for query
            $scope.$watch('note.TypeID', function (newValue,oldValue) {   
                if (newValue != null) {
                    var q_sample = {
                        userid: Auth.username,
                        TypeID: $scope.note.TypeID
                    };
                    LIMSBasic.GetSamplesByCategory(q_sample, function (data) {
                        //console.log(data)
                        $scope.SampleList = data;
                        $scope.note.SampleName = '';
                    });
                  
                }             
                
                fnDestroyTable();
            });
            $scope.$watch('note.SampleName', function (newValue,oldValue) {            
                if (newValue !== undefined) {
                    LoadMaterial($scope.note.SampleName);
                }

            })  
          
            /**
             * Get All LOT_NO in Material from SampleName
             * @param {Get SampleName} sampleName
             */
            function LoadMaterial(sampleName) {
                LIMSBasic.GetMaterial({
                    userid: Auth.username,
                    sampleName: sampleName,
                    query: '0'
                }, function (res) {
                    $scope.materialList = res;
                    $scope.note.Material = '';
                });
            }
            /**
             * Filter list TypeName
             */
            $scope.myFilter = function (data) {
                return data.TypeID == '3' || data.TypeID == '5';
            }
            $scope.Search = function () {
                var params = {};
                params.B = $scope.DateFrom;
                params.E = $scope.DateTo;
                params.sampleName = $scope.note.SampleName || '';
                params.material = $scope.note.Material || '';
                params.Lang = $scope.lang;
                params.VoucherType = $scope.note.VoucherType || '%';
                params.TypeID = $scope.note.TypeID || '';
                console.log(params);
                Report(params);

                //string sampleName, DateTime B, DateTime E, string Lang, string VoucherType, string TypeID
            }

            function Report(params) {
                LIMSService.Entrusted.GetAnalysisQuery(params).$promise.then(function (res) {
                    $scope.plansHeader = [];
                    if (res.length > 0) {
                        $scope.plansList = res;
                        var plansHeader = [];
                        for (var key in res[0]) {
                            if (key.indexOf('$') < 0) {
                                plansHeader.push(key)
                            }
                        }
                        $scope.plansHeader = plansHeader;
                        LoadGrid(res, plansHeader);

                    } else {
                        fnDestroyTable();
                    }
                })
            }
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
                        "data": element
                    });
                });
                OtherCreateHTMLTable(displayColumnNames, gridData);
                table = $(myTable).dataTable({
                    processing: true,
                    fixedHeader: true,
                    data: gridData,
                    dom: 'Bfrltip',
                    buttons: [
                        $.extend(true, {}, buttonCommon, {
                            extend: 'copyHtml5'
                        }),
                        $.extend(true, {}, buttonCommon, {
                            extend: 'excelHtml5'
                        })                      
                    ],
                    columns: columnKeys,
                    // responsive: 0,
                    // scrollY: 400,
                    // scrollX: true,
                    deferRender: true,
                    scroller: true,
                    keys: true,
                    lengthMenu: [
                        [-1, 50, 25, 100],
                        ["All", 50, 25, 100]
                    ],
                    //Set column definition initialisation properties.
                    "columnDefs": [{
                            "width": "5%",
                            "targets": [0], //last column
                            "orderable": 2, //set not orderable
                        },
                        {
                            "className": "text-center custom-middle-align",
                            "targets": [1, 2, 3]
                        }
                    ],
                    order: [],
                    rowCallback: function (row, data) {
                        displayColumnNames.forEach((value, index) => {
                            var x = data[value];
                            if (x.contains('*')) {
                                $('td:eq(' + index + ')', row).html(x.substring(1));
                            }
                            if (x.contains('Z')) {
                                $('td:eq(' + index + ')', row).html(x.substring(1)); //.addClass('PropertySpec');
                            }
                            if (x.contains('$')) {
                                $('td:eq(' + index + ')', row).html(x.substring(1)).addClass('Overrange');
                            }
                            switch (x) {
                                case 'N':
                                    $('td:eq(' + index + ')', row).addClass('Overrange');
                                    break;
                                case 'Y':
                                    $('td:eq(' + index + ')', row).addClass('Inrange');
                                    break;
                            }
                        });
                    },
                    // "stripeClasses": [ 'odd-row', 'even-row' ],
                    colReorder: true,
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