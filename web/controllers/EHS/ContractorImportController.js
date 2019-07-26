/**
 * Created by wangyanyan on 2017/4/7.
 */
define(['myapp', 'angular'], function(myapp, angular) {
    myapp.directive('uploadFile', [function() {
        return {
            link: function(scope, element, attributes) {
                element.bind("change", function(changeEvent) {
                  //  var files = e.target.files;
                  //  var i,f;
                  var  f=  element[0].files[0];
                 //   for (i = 0, f = files[i]; i != files.length; ++i) {
                        var reader = new FileReader();
                if (element[0].files[0].type =="application/vnd.ms-excel") {
                     var name = f.name;
                     reader.onload = function (e) {
                         console.log()
                         var data = e.target.result;
                         scope.parseText(data);
                         /* DO SOMETHING WITH workbook HERE */
                     };
                    reader.readAsBinaryString(f);

                 }else{
                    alert(" you import is not correct with  format！ .xls");
                }
                });
            }
        }
    }]);

    myapp.controller("ContractorImportController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'ConQuaService', '$upload', '$translatePartialLoader', '$translate', 'GateGuest',
        function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, ConQuaService, $upload, $translatePartialLoader, $translate, GateGuest) {
            var lang = window.localStorage.lang;
            var query = {};

            query.employer = "";
            query.cType = "";
            query.departmentID = "";
            ConQuaService.GetContractorQualification().get(query).$promise.then(function (res) {
                $scope.employers = res;
                $scope.EmployerId=res[0].EmployerId;
            }, function (errResponse) {
                Notifications.addError({'status': 'error', 'message': errResponse});
            });
            $scope.parseText = function(data) {
                var workbook = XLSX.read(data, {type: 'binary'});
                var sheet_name_list = workbook.SheetNames;
                sheet_name_list.forEach(function(y) { /* iterate through sheets */
                    var worksheet = workbook.Sheets[y];
                    console.log(worksheet);
                    updateDate = [];
                    var d = {};
                    for (z in worksheet) {
                        /* all keys that do not begin with "!" correspond to cell addresses */
                        if(z[0] === '!') continue;
                        if(z =="A1"  || z =="B1" || z =="C1" ||  z =="D1" || z =="E1" || z =="F1" || z =="G1" || z =="H1" || z =="I1" || z =="J1" || z =="K1" || z =="L1") {

                        }
                        else {
                            if (z[0] === 'A') {

                                d = {};
                                d.Employer = worksheet[z].v;
                            } else if (z[0] === 'B') {
                                d.ValidTo = worksheet[z].v;
                            } else if (z[0] === 'C') {
                                d.IdCard = worksheet[z].v;
                            } else if (z[0] === 'D') {
                                d.Name = worksheet[z].v;
                            } else if (z[0] === 'E') {
                                d.CardNo = worksheet[z].v||"";
                            } else if (z[0] === 'F') {
                                d.Phone = worksheet[z].v;
                            } else if (z[0] === 'G') {
                                d.Remark = worksheet[z].v;
                            } else if (z[0] === 'H') {
                                d.TrainDate = worksheet[z].v;
                            } else if (z[0] === 'I') {
                                d.MedicalInspection = worksheet[z].v;
                            } else if (z[0] === 'J') {
                                d.MIValidTo = worksheet[z].v;
                            } else if (z[0] === 'K') {
                                d.TrainTime = worksheet[z].v;
                            } else if (z[0] === 'L') {
                                d.TTValidTo = worksheet[z].v;
                                updateDate.push(d);
                            }
                        }

                    }
                });
                console.dir(updateDate);
                $scope.gridOptions.data=[];
                $scope.gridOptions.data = updateDate;
                $scope.gridApi.core.refresh();
                $('#importmodel').modal('hide');

            }
            $scope.Search=function(){
                search();
            }
function search() {
    ConQuaService.ContractorList().get({
        IdCard: $scope.IdCard || "",
        EmployerID: $scope.EmployerId || "",
        Department: "",
        Language: lang || "",
        Status: "I"
    }).$promise.then(function (res) {
            $scope.gridOptions.data = [];
            $scope.gridOptions.data = res;
            $scope.gridApi.core.refresh();
        })
}
            $scope.gridOptions = {
                columnDefs: [
                    {field: 'Employer',displayName: '承揽商名称', minWidth: 105, cellTooltip: true},
                    {field: 'ValidTo',displayName: '有效期', minWidth: 105,  cellTooltip: true},
                    {field: 'IdCard',displayName: '证件号', minWidth: 105, cellTooltip: true},
                    {field: 'Name',displayName: '姓名', minWidth: 105, cellTooltip: true},
                    {field: 'CardNo',displayName: '卡号', minWidth: 105, cellTooltip: true},
                    {field: 'Phone',displayName: '电话', minWidth: 105, cellTooltip: true},
                    {field: 'Remark',displayName: '备注', minWidth: 105, cellTooltip: true},
                    {field: 'TrainDate',displayName: '安环培训日期', minWidth: 105, cellTooltip: true},
                    {field: 'MedicalInspection',displayName: '健检资料', minWidth: 105, cellTooltip: true},
                    {field: 'MIValidTo',displayName: '健检有效期', minWidth: 105, cellTooltip: true},
                    {field: 'TrainTime',displayName: '受训时数', minWidth: 105, cellTooltip: true},
                    {field: 'TTValidTo',displayName: '受训有效期', minWidth: 105, cellTooltip: true}

                ],
                data: [],
                enableSorting: true,
                enableGridMenu: true,
                rowEditWaitInterval :-1,
                showGridFooter: true,

                onRegisterApi: function(gridApi) {
                    $scope.gridApi = gridApi;
                    EngineApi.getTcodeLink().get({"userid": Auth.username, "tcode": "FEPVContratorImport"}, function (linkres) {
                        if (linkres.IsSuccess) {
                            gridApi.core.addToGridMenu(gridApi.grid, gridMenu);

                        }
                    })
                }
            }


var gridMenu=[{
    title: $translate.instant("importExcel"),
    action: function($event) {
        $('#importmodel').modal('show');
    },
    order: 1
},{
    title: $translate.instant("Save"),
    action: function($event) {
        var con={};
        con.Contractorxls=$scope.gridOptions.data;
        con.userid=User;
       /* con.EmployerId=$scope.EmployerId;*/
        ConQuaService.ContractorImport().save( con).$promise.then(function (res) {
            Notifications.addMessage({'status': 'information', 'message': $translate.instant('Save_Success_MSG')});
        }, function (errResponse) {
            if(errResponse.data){
Notifications.addError({'status': 'error', 'message': errResponse.data.Message});
            }else{
            Notifications.addError({'status': 'error', 'message': errResponse});
        }
        });
    },
    order: 2
},{
    title: $translate.instant("Remove"),
    action: function($event) {

        var resultRows = $scope.gridApi.selection.getSelectedRows();
        console.log(resultRows[0])
        if (resultRows.length == 1) {
            var query={};
            query.IdCard=resultRows[0].IdCard;
            query.userid=User;
            query.employerId  = resultRows[0].EmployerId;
            if (confirm(resultRows[0].Employer +  $translate.instant("Delete_IS_MSG"))) {
                ConQuaService.ContractorImportRemove().remove(query, {}).$promise.then(function (res) {
                    Notifications.addMessage({'status': 'information', 'message': $translate.instant('Delete_Success_MSG')});
                    search();

                }, function (errResponse) {
                    Notifications.addError({'status': 'error', 'message': errResponse});
                });
            }
        } else {
            Notifications.addError({'status': 'error', 'message': $translate.instant("Select_ONE_MSG")});
        }

    },
    order: 4
},
    {
        title:  $translate.instant("Update"),
        action: function ($event) {
            var resultRows = $scope.gridApi.selection.getSelectedRows();
            console.log(resultRows[0])
            if (resultRows.length == 1) {
                if (resultRows[0].Status == "I" && resultRows[0].UserID == Auth.username) {
                    $location.url("/ContractorQua?EmployerId=" + resultRows[0].EmployerId + "&IdCard=" + resultRows[0].IdCard);
                }
                else{
                    Notifications.addError({'status': 'error', 'message': 'You can only edit your draft'});
                }
            } else {
                Notifications.addError({'status': 'error', 'message': $translate.instant("Edit_Draf_MSG")});
            }
        },
        order: 5
    } ];

       /*     document.getElementById("file").addEventListener('change', handleFile, false);
        function IsHeader(z){


        }
        */



        }])


});