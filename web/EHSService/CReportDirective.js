define(['app'], function (app) {
    app.directive('receiveReport', ['CReportService', 'InfolistService', 'Auth', '$filter', '$routeParams', '$translate', 'EngineApi',
        function (CReportService, InfolistService, Auth, $filter, $routeParams, $translate, EngineApi) {
            return {
                restrict: 'AEC',
                link: function (scope, element, attrs) {
                    scope.today = $filter('date')(new Date(), "yyyy-MM-dd");
                    scope.ReportDetail = [];
                    scope.UserName = Auth.username;
                    var _RpID = $routeParams.Rp_ID ? $routeParams.Rp_ID : attrs.rpId;
                    LoadDetail(_RpID);
                    scope.$watch('ReportDetail_Ctr.Rp_ID', function (val) { //watch from ImprovmentDirective's Controller
                        if (val) LoadDetail(val);
                    })

                    function LoadDetail(_Rp_ID) {
                        if (!_Rp_ID)
                            console.log('No rp_ID to show');
                        else { //else get data and receivers
                            /**Get Data*/
                            CReportService.GetInfoBasic.GetDetailReport({
                                Rp_ID: _Rp_ID
                            }, function (data) {
                                console.log("return data:", data);
                                scope.ReportDetail = data.Header[0];
                                scope.FileAttached = data.File;
                                scope.InjuryDetail = data.Detail;

                                scope.ShowReportType =
                                    data.Header[0].Rp_SubmitTypeCode == 'EVR' ? 1 :
                                    data.Header[0].Rp_TypeCode == 'IC' ? 2 : 3;

                                if (['S'].indexOf(data.Header[0].Rp_Status) >= 0) {
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
                                                var stamptime = taf({
                                                    TaskName: 'Initiator re-update and submit'
                                                }).min('Stamp') || '2010-01-01 00:00';
                                                receiver[0] = taf({
                                                    TaskName: "起始表单"
                                                }).first(); //initiator
                                                receiver[1] = taf({
                                                    TaskName: "Leader check C-Report",
                                                    Stamp: {
                                                        gt: stamptime
                                                    }
                                                }).order("Stamp DESC").limit(3).last();
                                                receiver[2] = taf({
                                                    TaskName: "Leader check C-Report",
                                                    Stamp: {
                                                        gt: stamptime
                                                    }
                                                }).order("Stamp DESC").limit(2).last();

                                                if (receiver[2].UserId == receiver[1].UserId) // move rev2 to rev1 if it's the same person
                                                    receiver[1] = null;


                                                receiver[3] = taf({
                                                    TaskName: "Leader check C-Report",
                                                    Stamp: {
                                                        gt: stamptime
                                                    }
                                                }).order("Stamp DESC").limit(1).last();

                                                if (receiver[3].UserId == receiver[2].UserId) // move rev2 to rev1 if it's the same person
                                                    receiver[2] = null;

                                                receiver[4] = taf({
                                                    TaskName: "Leader HSE check C-Report",
                                                    Stamp: {
                                                        gt: stamptime
                                                    }
                                                }).order("Stamp DESC").limit(3).last();
                                                receiver[5] = taf({
                                                    TaskName: "Leader HSE check C-Report",
                                                    Stamp: {
                                                        gt: stamptime
                                                    }
                                                }).order("Stamp DESC").limit(2).last();
                                                receiver[6] = taf({
                                                    TaskName: "Leader HSE check C-Report",
                                                    Stamp: {
                                                        gt: stamptime
                                                    }
                                                }).order("Stamp DESC").limit(1).last();
                                                /** This part could be changed later because there is a list for show specific role
                                                 * not from Creator -  Leader -  Header Factory - Supervisor -  Leader - Manager
                                                 */
                                                // if (receiver[6].UserId == receiver[5].UserId) // move rev5 to rev4 if it's the same person
                                                //     receiver[6] = null;
                                                // if (receiver[5].UserId == receiver[4].UserId) // move rev4 to rev3 if it's the same person. rev4 take from rev5. Why? I don't really know.
                                                //     receiver[5] = receiver[6];

                                                scope.receiver = receiver;
                                                console.log('receiver: ', receiver);
                                            })
                                        }
                                    }, function (err) {})
                                }
                            });
                            // $(document).ready(function () {
                            //     setTimeout(function () {
                            //         window.print();
                            //     }, 1000);
                            // })
                        }
                    }


                },
                templateUrl: './forms/EHS/CReport/CReportDetail.html'
            }
        }
    ]);


    app.directive('ehsLeaderCheck', ['$resource', 'Auth', 'CReportService', '$compile',
        function ($resource, Auth, CReportService) {
            return {
                restrict: 'EAC',
                link: function (scope, element, attrs) {

                },

                controller: function ($scope, $element, $attrs) {
                    console.log($attrs.userName);
                    console.log($attrs.flowKey);
                    geHSEChecker($attrs.submitdepartid);

                    function geHSEChecker(department) {
                        CReportService.HSEChecker().get({
                            flowname: $attrs.flowKey,
                            userid: Auth.username,
                            submitdepartid: department || '',
                            kinds: $attrs.kinds || '',
                        }).$promise.then(function (leaderlist) {
                            if (leaderlist.length > 0) {
                                var checkList = [];
                                for (var i = 0; i < leaderlist.length; i++) {
                                    checkList[i] = leaderlist[i].Person;
                                }
                                $scope.checkList = checkList;
                                $scope.leaderlist = leaderlist;
                                console.log("Checklist", $scope.checkList);
                                console.log("leaderlist", $scope.leaderlist);
                                if ($scope.HSE_ReceiveCheck) {
                                    if ($scope.ReportDetail.Rp_SubmitTypeCode == 'EVR') { //user 'EVR', see line 36 in CreportDirective for more inforation
                                        $scope.checkList.splice(0, 1, 'FEPV000096');
                                        $scope.leaderlist.splice(0, 1, {
                                            $$hashKey: "",
                                            LevelNameVN: "Kiểm tra 審核人員",
                                            Person: "FEPV000096" // Thi Sinh
                                        });
                                    }
                                    if ($scope.ReportDetail.Rp_SubmitTypeCode == 'SF') { //same as above, had to change this (by mistake =.=!)
                                        $scope.checkList.splice(0, 1, 'FEPV000559');
                                        $scope.leaderlist.splice(0, 1, {
                                            $$hashKey: "",
                                            LevelNameVN: "Kiểm tra 審核人員",
                                            Person: "FEPV000559" // Xi long
                                        });
                                    }
                                    if ($scope.ReportDetail.Rp_SubmitTypeCode == 'FP') { //same as above, had to change this (by mistake =.=!)
                                        $scope.checkList.splice(0, 1, 'FEPV000944');
                                        $scope.leaderlist.splice(0, 1, {
                                            $$hashKey: "",
                                            LevelNameVN: "Kiểm tra 審核人員",
                                            Person: "FEPV000944" //other
                                        });
                                    }
                                };
                            };
                        }, function (errormessage) {
                            console.log(errormessage);
                        })
                    }

                },
                templateUrl: '../TemplateViews/ShowLeaderTemplate.html'
            }
        }
    ]);

});