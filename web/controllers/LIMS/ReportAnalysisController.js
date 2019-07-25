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
            $scope.$watch('note.TypeID', function (newValue, oldValue) {
                console.log('newValue = ' + newValue);
                console.log('oldValue = ' + oldValue);
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
            $scope.$watch('note.SampleName', function (newValue, oldValue) {
                console.log('newValue = ' + newValue);
                console.log('oldValue = ' + oldValue);
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
                        "data": element,
                        "mRender": function (data, type, full) {
                            if (element == 'VoucherID')
                                return "<a href='#/Lims/ReportAnalysis/PrintAnalysisReport/" + data + "' target='_blank' title='" + data + "'>" + data + "</a>";
                            else {
                                if (data.contains('*ValueSpec')) {
                                    return 'ValueSpec';
                                }
                             
                                var rest = data.match(/\w*-\w*.pdf/);//Get string filename
                                var value = data.split(/@\w*-\w*.pdf/gm);

                                if (data.contains('$')) { /*OVERRANGE NUMBER VALUE*/                                   
                                    if(!data.contains('@'))
                                        return '<span class="Overrange">' + data.substring(1) + '</span>';
                                    else 
                                    {                                       
                                        if( data.contains('$') && data.contains('@'))
                                        {
                                           return '<span class="Overrange">' +  value[0].substring(1) + '</span>' + '  <a  href='+rest+' target="_blank"><span style="color: #563d7c" class="glyphicon glyphicon-file"></span></a>';                         
                                        }else
                                        {                                           
                                            var rs = value[0].substring(1) + '  <a  href='+rest+' target="_blank"><span style="color: #563d7c" class="glyphicon glyphicon-file"></span></a>';                         
                                            return rs;
                                        }
                                    }                                  
                                }
                                else
                                {
                                    if(!data.contains('@'))
                                        return '<span>' + data + '</span>';
                                    else 
                                    {                                       
                                        return value[0] + '  <a  href='+rest+' target="_blank"><span style="color: #563d7c" class="glyphicon glyphicon-file"></span></a>';                                  
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
                        }
                    });
                });
                OtherCreateHTMLTable(displayColumnNames, gridData);
                table = $(myTable).dataTable({
                    processing: true,
                    fixedHeader: true,
                    data: gridData,
                    dom: 'Bfrltip',
                    buttons: [
                        'copyHtml5',
                        'excelHtml5'
                    ],
                    columns: columnKeys,
                    responsive: 0,
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
                    createdRow: function (row, data, dataIndex) {
                        // $compile(angular.element(row).contents())($scope);
                    },
                    rowCallback:function(row,data){
                        // displayColumnNames.forEach((value,index)=>{
                        //     if (x.contains('@')) {                                                         
                        //         var rest = x.match(/\w*-\w*.pdf/);//Get string filename
                        //         var value = x.split(/@\w*-\w*.pdf\|\w*±\w*.\w*/gm);
                        //         var rs = '<a href='+rest+' target="_blank">' + value[0] + ' <span style="color: #563d7c" class="glyphicon glyphicon-file"></span></a>';                         
                        //        $('td:eq(' + index + ')', row).html(rs)
                        //    }
                        // })
                    },
                    order: [],
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
                    ;
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
    myapp.controller('RawMaterialAnalysisReport', ['$scope', '$cookies', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', '$upload', '$translatePartialLoader', '$translate', 'LIMSService', 'LIMSBasic','GateGuest',
        function ($scope, $cookies, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, $upload, $translatePartialLoader, $translate, LIMSService, LIMSBasic,GateGuest) {
            /**init */
            var username = Auth.username;
            $scope.recod = {};
            $scope.flowKey = 'RawMaterial';
            $scope.UQList = [];
            $scope.plansHeader = {};
            $scope.enableSubmit = false;
            var _VoucherID = $routeParams.code;
            /*******************GET INFORMATION ********************************************************* */

            function getGateCheck() {
                GateGuest.GetGateCheckers().getCheckers({
                    owner: username,
                    fLowKey: $scope.flowKey,
                    Kinds: $scope.sampleName,
                    CheckDate: NaN
                }).$promise.then(function (leaderlist) {
                    $scope.$loaded = true;
                    var checkList = [];
                    for (var i = 0; i < leaderlist.length; i++) {
                        checkList[i] = leaderlist[i].Person;
                    }
                    $scope.$parent.checkList = checkList;
                    $scope.checkList = checkList; //list for submitting next candidates
                    $scope.leaderlist = leaderlist; //list of showing
                    console.log(checkList);
                }, function (errormessage) {
                    console.log(errormessage);
                })
            }

            /*********************** $WATCH ****************************************************** */
            // $scope.checkList = ['981023', 'cassie']; //#TEMP
            $scope.$watch('sampleName', function (newVal) {
                console.log('SampleName: ' + newVal);
                if (newVal && $scope.recod.StatusOfSubmit == 'N') {
                    getGateCheck();
                }
            })
            $scope.$watch('checkList', function (newVal) {
                console.log('checkList: ' + newVal);
                if (newVal) {
                    $scope.enableSubmit = true;
                }
            });
            /***********************SUBMIT BUTTON****************************************************** */
            $scope.SubmitVoucher = function () {
                var formVariables = [];
                var historyVariable = [];
                if ($scope.checkList.length<1) { //if not exist checklist
                    alert("Error: Don\'t get leader");
                    return;
                }

                formVariables.push({ name: 'QC_Checklist', value: $scope.checkList });

                if (confirm('Would you like submit this Voucher: ' + _VoucherID)) {
                    /**Check if Voucher is submited (status changed to P) */
                    LIMSService.Entrusted.IsNew_EntrustedVoucher_General({ voucherid: _VoucherID }, function (res) {
                        if (res.IsNewVoucher) {
                            formVariables.push({ name: 'RawID', value: _VoucherID });
                            historyVariable.push({ name: 'workflowKey', value: $scope.flowKey });
                            /**Submit to BPMN */
                            LIMSService.SubmitBPM($scope.flowKey, formVariables, historyVariable, '', function (res, message) {
                                if (message) {
                                    alert('Can\'t submit this voucher because : ' + message.data);
                                } else {
                                    /**Save to Server */
                                    saveSubmit(function (res, err) {
                                        if (res.Success) {
                                            alert('Your voucher ' + _VoucherID + ' submitted')
                                            close();;
                                        }
                                    })
                                }
                            })
                        }
                        else
                            alert('This voucher has been submit befored!');
                    })
                }

                /**Save to SQL server function */
                function saveSubmit(callback) {
                    LIMSService.Entrusted.UpdateStatus_EntrustedVoucher_General({
                        voucherid: _VoucherID,
                        statusofsubmit: 'P',
                        qualifedstring: $scope.qual
                    }).$promise.then(function (req) {
                        callback(req);
                    }, function (errResponse) {
                        callback(errResponse);
                    });
                }
            }
            $scope.Close = function () {
                window.top.close();
            }
        }
    ]);
});