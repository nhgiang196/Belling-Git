/**
 * Created by Isaac
 */
/*eslint-env jquery*/
define(['myapp', 'angular', 'jquery', 'jszip'], function (myapp, angular, jquery, jszip) {
    myapp.controller('QueryPlansController', ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'LIMSService', 'LIMSBasic',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, LIMSService, LIMSBasic) {
            $scope.note = {};
            $scope.flowkey = 'GateMisUser';
            $scope.note = {};
            $scope.lang = window.localStorage.lang || 'EN';
            $scope.note.DateFrom = $filter('date')(new Date(), 'yyyy-MM-dd');
            $scope.note.DateTo = $filter('date')(new Date(), 'yyyy-MM-dd');
            // Needed to make DataTables export to Excel work
            window.JSZip = jszip //Very important
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

                    } else {
                        fnDestroyTable();
                    }


                })

            }
            /**
             * Scroll Panel
             */
            // When the user scrolls the page, execute myFunction 
            window.onscroll = function () {
                //myFunction(); Scroll Panel Here
            };
            // Get the header
            var header = document.getElementById("myHeader");

            // Get the offset position of the navbar
            var sticky = header.offsetTop;

            // Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
            function myFunction() {
                if (window.pageYOffset > sticky) {
                    header.classList.add("sticky");
                } else {
                    header.classList.remove("sticky");
                }
            }

            var showToolTip = function (data) {
                data = data.replace('^', '').replace('~', '').replace('$', '').replace('#', '').replace('**', 'ValueSpec')
                if (data.contains('|')) {
                    data = data.slice(0, data.indexOf('|'));
                    console.log(data);
                }
                return data;
            };
            var showValue = (data) => {
                var result = data.substr(data.indexOf('|') + 1, 9999);
                return (data.contains('|') ? 'ValueSpec: ' + result : '');
            }
            var buttonCommon = {
                exportOptions: {
                    format: {
                        body: function (data, row, column, node) {
                            // Strip $ from salary column to make it numeric
                            if (data === 'xxx')
                                return '';
                            else
                                return data != null || data != '' ? showToolTip(data) :
                                    data;
                        }
                    }
                }
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
                    buttons: [
                        $.extend(true, {}, buttonCommon, {
                            extend: 'copyHtml5'
                        }),
                        $.extend(true, {}, buttonCommon, {
                            extend: 'excelHtml5'
                        }),
                        // $.extend(true, {}, buttonCommon, {
                            // extend: 'pdfHtml5'
                        // })
                    ],
                    columns: columnKeys,
                    responsive: 0,
                    deferRender: true,
                    scroller: true,
                    keys: true,                  
                    lengthMenu: [
                        [-1, 25, 50, 100],
                        ["All", 25, 50, 100]
                    ],
                    //Set column definition initialisation properties.
                    "columnDefs": [{
                        "width": "5%",
                        "targets": [0], //last column
                        "orderable": 2 //set not orderable
                    }, {
                        "className": "text-center custom-middle-align"
                    }],
                    order: [],
                    rowCallback: function (row, data) {
                        displayColumnNames.forEach((value, index) => {
                            var x = data[value];
                            if (x.contains('#')) {
                                $('td:eq(' + index + ')', row).html(x.substring(1)).addClass('grade-red');
                            }
                            if (x.contains('$')) {
                                $('td:eq(' + index + ')', row).html(x.substring(1)).addClass('result-red');
                            }
                            if (x.contains('~')) {
                                $('td:eq(' + index + ')', row).html(x.substring(1)).addClass('result-yellow');
                            }
                            if (x.contains('^')) {
                                $('td:eq(' + index + ')', row).html(x.substring(1)).addClass('grade-yellow');
                            }
                            if (x.contains('|')) {
                                mdata = showToolTip(x);
                                vdata = showValue(x);
                                $('td:eq(' + index + ')', row).html(mdata)
                                    .attr({
                                        'data-toggle': 'tootlip',
                                        'title': vdata,
                                        'onmouseenter': "$(this).tooltip('show')",
                                        'data-container': 'body'
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
                                    $('td', row).css('background-color', '#80b3bf')
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
