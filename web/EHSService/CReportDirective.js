define(['app'], function (app) {
    app.directive('receiveReport', ['CReportService', 'InfolistService', 'Auth', '$filter', '$routeParams', '$translate', 'EngineApi',
        function (CReportService, InfolistService, Auth, $filter, $routeParams, $translate, EngineApi) {
            return {
                restrict: 'AEC',
                link: function (scope, element, attrs) {
                    scope.today = $filter('date')(new Date(), "yyyy-MM-dd");
                    scope.ReportDetail = [];
                    scope.UserName = Auth.username;
                    var _Rp_ID = $routeParams.Rp_ID ? $routeParams.Rp_ID : attrs.rpId;
                    if (!_Rp_ID)
                        console.log('No rp_ID to show');
                    else { //else get data and receivers
                        /**Get Data*/
                        CReportService.GetInfoBasic.GetDetailReport({
                            Rp_ID: _Rp_ID
                        }, function (data) {
                            console.log("return data:", data);


                            if (InfolistService.Infolist('IncidentType').find(x => x.id == data.Header[0].RpIC_IncidentType) != undefined)
                                data.Header[0].RpIC_IncidentType = $translate.instant('RpIC_IncidentType-' + data.Header[0].RpIC_IncidentType);

                            scope.ReportDetail = data.Header[0];
                            scope.FileAttached = data.File;
                            scope.InjuryDetail = data.Detail;


                            // evaluate combobox
                            var evaluatelist = InfolistService.Infolist('evaluate');
                            // location combobox
                            var locationlist = InfolistService.Infolist('location');
                            // incident type combobox
                            var submittypelist = InfolistService.Infolist('SubmitType');
                            if (data.Header[0].Rp_SubmitType == 'EVR') {} else {
                                if (data.Header[0].Rp_Type == 'IC') {
                                    scope.ReportDetail.RpIC_IncidentType = submittypelist.find(item => item.id === data.Header[0].RpIC_IncidentType).name;
                                    scope.ReportDetail.RpIC_Evaluate = evaluatelist.find(item => item.id === data.Header[0].RpIC_Evaluate).name;
                                } else {

                                    scope.ReportDetail.RpAC_ResultHardware = evaluatelist.find(item => item.id === data.Header[0].RpAC_ResultHardware).name;
                                    scope.ReportDetail.RpAC_ResultSoftware = evaluatelist.find(item => item.id === data.Header[0].RpAC_ResultSoftware).name;
                                }

                            }




                        });
                        // $(document).ready(function () {
                        //     setTimeout(function () {
                        //         window.print();
                        //     }, 1000);
                        // })



                        /**Get Receiver*/
                        CReportService.CReportHSEPID().get({
                            Rp_ID: _Rp_ID
                        }).$promise.then(function (res) {
                            console.log(res);
                            if (res) {
                                EngineApi.getProcessLogs.getList({
                                    "id": res.ProcessInstanceId,
                                    "cId": ""
                                }, function (data) {
                                    console.log('getdata!', data);
                                    console.log(data[0].Logs);
                                    data.forEach(function (value, index) {
                                        if (index >= 1)
                                            data[0].Logs.push.apply(data[0].Logs, data[index].Logs)
                                    })
                                    var receiver = {};
                                    var taf = TAFFY(data[0].Logs);
                                    receiver[0] = taf({
                                        TaskName: "起始表单"
                                    }).first(); //initiator
                                    receiver[1] = taf({
                                        TaskName: "Leader check C-Report"
                                    }).order("Stamp").limit(1).last();
                                    receiver[2] = taf({
                                        TaskName: "Leader check C-Report"
                                    }).order("Stamp").limit(2).last();
                                    receiver[3] = taf({
                                        TaskName: "Leader HSE check C-Report"
                                    }).order("Stamp").limit(1).last();
                                    receiver[4] = taf({
                                        TaskName: "Leader HSE check C-Report"
                                    }).order("Stamp").limit(2).last();
                                    receiver[5] = taf({
                                        TaskName: "Leader HSE check C-Report"
                                    }).order("Stamp").limit(3).last();
                                    if (receiver[2].UserId == receiver[1].UserId) receiver[2] = null;
                                    if (receiver[4].UserId == receiver[3].UserId) receiver[4] = receiver[5];
                                    if (receiver[5].UserId == receiver[4].UserId) receiver[5] = null;

                                    scope.receiver = receiver;
                                    console.log('receiver: ', receiver);
                                })





                            }
                        }, function (err) {


                        })



                    }

                },
                templateUrl: './forms/EHS/CReport/CReportDetail.html'
            }
        }
    ]);



});


// DepartmentName: "Hóa sợi"
// RpAC_DateComplete: null
// RpAC_ImproveHardware: null
// RpAC_ImproveSoftware: null
// RpAC_ResultHardware: null
// RpAC_ResultSoftware: null
// RpIC_Affect: "Medium"
// RpIC_BasicReason: "132"
// RpIC_Damage: "313"
// RpIC_Description: "123"
// RpIC_DirectReason: "13"
// RpIC_Evaluate: "MD"
// RpIC_Group: "123"
// RpIC_IncidentType: "Gas"
// RpIC_IndirectReason: "13"
// RpIC_NotifPerson: "13"
// RpIC_Process: "1"
// RpIC_ReceivePerson: "123"

// RpIC_Type: null
// Rp_CreatorID: "cassie"
// Rp_Date: "2019-07-18T16:40:02.0696878"
// RpIC_TimeNotif: "2019-07-18T16:39:00"
// Rp_DateTime: "2019-07-18T16:39:00"
// Rp_DepartmentID: "511"
// Rp_ID: "CR190718138"
// Rp_Location: "FC"
// Rp_PreventMeasure: "213"
// Rp_Stamp: "2019-07-18T16:40:27.8170492"
// Rp_Status: "P"
// Rp_SubDepartmentID: "511109000"
// Rp_SubmitType: "EVR"
// Rp_Type: "IC"
// SubDepartmentName: "Quản Lý Hành Chính-Phòng IT"
// __proto__: Object