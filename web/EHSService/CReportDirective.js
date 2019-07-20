define(['app'], function (app) {
    app.directive('receiveReport', ['CReportService', 'InfolistService', 'Auth', '$filter', '$routeParams', '$translate',
        function (CReportService, InfolistService, Auth, $filter, $routeParams, $translate) {
            return {
                restrict: 'AEC',
                link: function (scope, element, attrs) {
                    /**Init scope*/
                    scope.today = $filter('date')(new Date(), "yyyy-MM-dd");
                    scope.ReportDetail = [];
                    scope.UserName = Auth.username;
                    var _Rp_ID = $routeParams.Rp_ID ? $routeParams.Rp_ID : attrs.rpId
                    CReportService.GetInfoBasic.GetDetailReport({
                        Rp_ID: _Rp_ID
                    }, function (data) {
                        console.log("return data:", data);


                        if (InfolistService.Infolist('IncidentType').find(x=>x.id==data.Header[0].RpIC_IncidentType)!=undefined)
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

                        scope.ReportDetail.Rp_Location = locationlist.find(item => item.id === scope.ReportDetail.Rp_Location).name;
                        if (scope.ReportDetail.Rp_Type == 'IC') {
                            scope.ReportDetail.RpIC_Evaluate = evaluatelist.find(item => item.id === scope.ReportDetail.RpIC_Evaluate).name;
                            scope.ReportDetail.RpIC_IncidentType = submittypelist.find(item => item.id === scope.ReportDetail.RpIC_IncidentType).name;
                        } else {
                            scope.ReportDetail.RpAC_ResultHardware = evaluatelist.find(item => item.id === scope.ReportDetail.RpAC_ResultHardware).name;
                            scope.ReportDetail.RpAC_ResultSoftware = evaluatelist.find(item => item.id === scope.ReportDetail.RpAC_ResultSoftware).name;
                        }


                    });






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