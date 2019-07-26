/**
 * Created by CSP-2015 on 2015-9-14.
 * 承揽商资质
 */
define(['myapp', 'angular'], function (myapp, angular) {
    myapp.controller("ConQuaController", ['$scope', '$filter', '$compile', '$routeParams', '$resource', '$location', 'i18nService', 'Notifications', 'User', 'Forms', 'Auth', 'uiGridConstants', '$http', 'EngineApi', 'TPMEngine', 'ConQuaService', 'ContractorInspectService', '$upload', '$translatePartialLoader', '$translate',
            function ($scope, $filter, $compile, $routeParams, $resource, $location, i18nService, Notifications, User, Forms, Auth, uiGridConstants, $http, EngineApi, TPMEngine, ConQuaService, ContractorInspectService, $upload, $translatePartialLoader, $translate) {
                i18nService.setCurrentLang('zh-cn');
                $scope.filedata = [];
                var col = [
                    {
                        field: 'StatusSpec',
                        displayName: $translate.instant("ConQua_paraDepartment"),
                        minWidth: 80,
                        cellTooltip: true
                    },
                    {field: 'Status', displayName: $translate.instant("Status"), minWidth: 80, cellTooltip: true},
                    {
                        field: 'Employer',
                        displayName: $translate.instant("ConQua_Employer"),
                        minWidth: 100,
                        cellTooltip: true
                    },
                    {field: 'CType', displayName: $translate.instant("ConQua_CType"), minWidth: 105, cellTooltip: true},
                    {
                        field: 'BLValidTo',
                        displayName: $translate.instant("ConQua_BLValidTo"),
                        minWidth: 200,
                        cellTooltip: true
                    },
                    {
                        field: 'OCCValidTo',
                        displayName: $translate.instant("ConQua_OCCValidTo"),
                        minWidth: 200,
                        cellTooltip: true
                    },
                    {
                        field: 'CQValidTo',
                        displayName: $translate.instant("ConQua_CQValidTo"),
                        minWidth: 200,
                        cellTooltip: true
                    },
                    {field: 'Remark', displayName: $translate.instant("Remark"), minWidth: 200, cellTooltip: true}
                ];
                $scope.gridOptions = {
                    columnDefs: col,
                    data: [],
                    enableColumnResizing: true,
                    enableSorting: true,
                    showGridFooter: false,
                    enableGridMenu: true,
                    exporterMenuPdf: false,
                    enableSelectAll: false,
                    enableRowHeaderSelection: true,
                    enableRowSelection: true,
                    multiSelect: false,
                    paginationPageSizes: [50, 100, 200, 500],
                    paginationPageSize: 50,
                    exporterOlderExcelCompatibility: true,
                    useExternalPagination: true,
                    enablePagination: true,
                    enablePaginationControls: true,
                    gridMenuCustomItems: [{
                        title: $translate.instant("Create"),
                        action: function ($event) {
                            $scope.projects = {};
                            $scope.BusinessLicence = [];
                            $scope.OrganizationCodeCertificate = [];
                            $scope.TaxRegistrationCertificate = [];
                            $scope.CQFiles = [];
                            $scope.IsEdit = false;
                            $scope.IsShowRes = false;
                            $scope.IsHideBtnaddInfo = false;
                            $scope.IsHideBtnSAS = true;
                            $("#addModal").modal('show');
                        },
                        order: 1
                    }, {
                        title: $translate.instant("Update"),
                        action: function ($event) {
                            /*   var href =/gate/GoodsOut/:code/:oprea
                             window.open(href);*/
                            var resultRows = $scope.gridApi.selection.getSelectedRows();
                            if (resultRows.length == 1) {
                                var e = resultRows[0];
                                if (e.Status == "审核") {
                                    alert($translate.instant("Edit_Draf_MSG"));
                                    return;
                                }
                                //
                                $scope.IsEdit = true;
                                if (e.Status == "审核通过") {
                                    $scope.IsHideBtnaddInfo = false;

                                    $scope.IsHideBtnSAS = true;
                                }
                                else if (e.Status == "新建") {
                                    $scope.IsHideBtnaddInfo = false;

                                    $scope.IsHideBtnSAS = false;
                                }
                                //
                                $scope.projects = e;
                                $scope.BusinessLicence = e.BusinessLicence || [];
                                $scope.projects.BLValidTo = $filter('date')(e.BLValidTo, "yyyy-MM-dd");
                                $scope.OrganizationCodeCertificate = e.OrganizationCodeCertificate || [];
                                $scope.projects.OCCValidTo = $filter('date')(e.OCCValidTo, "yyyy-MM-dd");
                                $scope.TaxRegistrationCertificate = e.TaxRegistrationCertificate || [];
                                //
                                $scope.IsShowRes = true;
                                //
                                queryCQinfo(e.Employer, function (cqlist) {
                                    $scope.eCQ = cqlist;
                                });
                                //
                                $("#addModal").modal('show');
                                //
                            }
                        },
                        order: 2
                    }, {
                        title: $translate.instant("Delete"),
                        action: function ($event) {
                            /*   var href =/gate/GoodsOut/:code/:oprea
                             window.open(href);*/
                            var resultRows = $scope.gridApi.selection.getSelectedRows();
                            var e = resultRows[0];
                            if (resultRows.length == 1) {
                                var projects = {};
                                projects.Employer = e.Employer;
                                var r = confirm($translate.instant("Delete_IS_MSG") + $translate.instant("Contractor") + "[" + e.Employer + "]？");
                                if (r == true) {
                                    //查找包商信息
                                    ConQuaService.DelContractorQualification(projects, function (message) {
                                        if (message) {
                                            Notifications.addError({
                                                'status': 'error',
                                                'message': $translate.instant("Delete_Failed_Msg") + message
                                            });
                                        } else {
                                            alert($translate.instant("Delete_Succeed_Msg"));
                                            $scope.eCheck.splice($scope.eCheck.indexOf(e), 1);
                                        }
                                    });
                                }
                            }
                        },
                        order:3
            }, {
                title: 'Detail',
                action: function ($event) {
                    /*   var href =/gate/GoodsOut/:code/:oprea
                     window.open(href);*/
                    var resultRows = $scope.gridApi.selection.getSelectedRows();
                    var e = resultRows[0];
                    if (resultRows.length == 1) {
                        var querypara = {};
                        querypara.Employer = e.Employer;
                        querypara.CType = "";
                        querypara.DepartmentID = "";
                        ConQuaService.GetContractorQualification().get(querypara).$promise.then(function (res) {
                            for (var k = 0; k < res.length; k++) {
                                res[k].BusinessLicence = JSON.parse(res[k].BusinessLicence) || [];
                                res[k].OrganizationCodeCertificate = JSON.parse(res[k].OrganizationCodeCertificate) || [];
                                res[k].TaxRegistrationCertificate = JSON.parse(res[k].TaxRegistrationCertificate) || [];
                            }
                            $scope.eCheckModel = res[0];
                        }, function (errResponse) {
                            Notifications.addError({'status': 'error', 'message': errResponse});
                        });
                        //
                        queryCQinfo(e.Employer, function (cqlist) {
                            $scope.eCQ = cqlist;
                        })
                        //
                        $("#detailModal").modal('show');

                    }
                },
                order: 4
            }],
        onRegisterApi
    :
    function (gridApi) {
        $scope.gridApi = gridApi;

    }
};
///得到承揽商mongodb
                ContractorInspectService.getContractors().get(function (res) {
                    console.log(res)
                    $scope.contractors = res;
                });
//得到管理单位
                EngineApi.getDepartment.getList({userid:Auth.username,ctype:""}, function (res) {
                    console.log("===================Get Department=============================");
                    $scope.CDepartmentList = res;
                });


//根据工号等级获取相应部门
EngineApi.getMemberInfo().get({userid: Auth.username}).$promise.then(function (res) {
    console.log(res);
    console.log("DepartmentID---" + res.DepartmentID + "---" + res.EmployeeID + "---" + res.Grade + "---" + res.Specification);
    $scope.DepartmentID = res.DepartmentID;

    //QueryInfoList();
}, function (errResponse) {
    Notifications.addError({'status': 'error', 'message': errResponse});
});

$scope.CTypeList = [{"name": "工程承揽商", "value": "工程承揽商"}
    , {"name": "运输承揽商", "value": "运输承揽商"}
    , {"name": "其他承揽商", "value": "其他承揽商"}];

$scope.QueryInfo = function () {
    QueryInfoList();
};
//查询承揽商资质列表
function QueryInfoList() {
    //
    var querypara = {};
    querypara.Employer = "";
    querypara.CType = $scope.paraCType || "";
    // querypara.DepartmentID = $scope.paraDepartment||$scope.DepartmentID;
    querypara.DepartmentID = "0282400";
    querypara.Language = window.localStorage.lang;
    ConQuaService.GetContractorQualification().get(querypara).$promise.then(function (res) {
        for (var k = 0; k < res.length; k++) {
            res[k].BusinessLicence = JSON.parse(res[k].BusinessLicence) || [];
            res[k].OrganizationCodeCertificate = JSON.parse(res[k].OrganizationCodeCertificate) || [];
            res[k].TaxRegistrationCertificate = JSON.parse(res[k].TaxRegistrationCertificate) || [];
        }
        $scope.eCheck = res;
        $scope.gridOptions.data = res;
    }, function (errResponse) {
        Notifications.addError({'status': 'error', 'message': errResponse});
    });
}

//显示新增界面
$scope.ShowAddInfo = function () {
    //
    $scope.projects = {};
    $scope.IsEdit = false;
    $scope.IsShowRes = false;
    $scope.IsHideBtnaddInfo = false;

    $scope.IsHideBtnSAS = true;
    $("#addModal").modal('show');
    //
};
//新增准备
function IsContractor(querypara, callback) {
    if ($scope.projects.BusinessLicence.length < 1) {
        callback($translate.instant("ConQua_Add_Failed"));
        return;
    } else {

        ConQuaService.GetContractors().get({employer: querypara.Employer}).$promise.then(function (res) {
            if (res) {
                if (res.length > 0) {
                    callback($translate.instant("ConQua_Existed_Msg"))
                } else {
                    callback("");
                }
            } else {
                callback("");
            }

        }, function (checkData, status) {
            callback($translate.instant("error") + status + checkData)
        })
    }
}

//新增
$scope.addInfo = function () {
    console.log("------start newCheck----");
    if ($scope.IsEdit == false) {
        var querypara = {};
        querypara.Employer = $scope.projects.Employer;
        querypara.CType = "";
        querypara.DepartmentID = "";
        querypara.Language = window.localStorage.lang;
        //新建承揽商
        $scope.projects.BusinessLicence = JSON.stringify($scope.BusinessLicence);
        $scope.projects.OrganizationCodeCertificate = JSON.stringify($scope.OrganizationCodeCertificate);
        $scope.projects.TaxRegistrationCertificate = JSON.stringify($scope.TaxRegistrationCertificate);
        $scope.projects.Stamp = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
        $scope.projects.AccDate = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
        $scope.projects.DepartmentID = $scope.DepartmentID;
        $scope.projects.UserID = Auth.username;
        $scope.projects.Status = "N";//N:新建  F:提交审核  Q:审核通过
        console.log($scope.projects);
        ConQuaService.CreateContractorQualification().save($scope.projects).$promise.then(function (message) {
            if (message) {
                Notifications.addError({'status': 'error', 'message': message});
            } else {
                QueryInfoList();
                $scope.filedata = [];
                $scope.IsHideBtnaddInfo = true;
                $scope.IsHideBtnSAS = false;
                $scope.IsShowRes = true;
                $scope.IsEdit = true;
                queryCQinfo($scope.projects.Employer, function (contratorlist) {
                    $scope.eCQ = contratorlist;
                });
                alert($translate.instant("Save_Success_MSG"));
            }
        }, function (errResponse) {
            Notifications.addError({'status': 'error', 'message': errResponse});
        });
    }
    else {
        editsaveCheckInfo(function (message) {
            if (message) {
                Notifications.addError({'status': 'error', 'message': message});
            } else {
                //提交
                QueryInfoList();
            }
        });
    }
};
$scope.projects = {};
//显示编辑界面
$scope.ShowEditInfo = function (e) {
    if (e.Status == "审核") {
        alert("审核中，暂时不能修改！");
        return;
    }
    //
    $scope.IsEdit = true;
    if (e.Status == "审核通过") {
        $scope.IsHideBtnaddInfo = false;

        $scope.IsHideBtnSAS = true;
    }
    else if (e.Status == "新建") {
        $scope.IsHideBtnaddInfo = false;

        $scope.IsHideBtnSAS = false;
    }
    //
    $scope.projects = e;
    console.log(e);
    $scope.projects.BusinessLicence = e.BusinessLicence || [];
    $scope.projects.BLValidTo = $filter('date')(e.BLValidTo, "yyyy-MM-dd");
    $scope.projects.OrganizationCodeCertificate = e.OrganizationCodeCertificate || [];
    $scope.projects.OCCValidTo = $filter('date')(e.OCCValidTo, "yyyy-MM-dd");
    $scope.projects.TaxRegistrationCertificate = e.TaxRegistrationCertificate || [];
    //
    $scope.IsShowRes = true;
    //
    queryCQinfo(e.Employer, function (cqlist) {
        $scope.eCQ = cqlist;
    })
    //
    $("#addModal").modal('show');
    //
}
//编辑保存
function editsaveCheckInfo(callback) {

    $scope.projects.BusinessLicence = $scope.projects.BusinessLicence || [];
    $scope.projects.BLValidTo = $filter('date')($scope.projects.BLValidTo, "yyyy-MM-dd");
    $scope.projects.OrganizationCodeCertificate = $scope.projects.OrganizationCodeCertificate || [];
    $scope.projects.OCCValidTo = $filter('date')($scope.projects.OCCValidTo, "yyyy-MM-dd") || null;
    $scope.projects.TaxRegistrationCertificate = $scope.projects.TaxRegistrationCertificate || [];

    console.log("editsave BusinessLicence---");
    if ($scope.projects.BusinessLicence.length < 1) {
        //   Notifications.addError({'status': 'error', 'message': "保存失败：没有上传营业执照"});
        callback($translate.instant("Msg_Save"));
        return;
    } else {
        ConQuaService.UpdateContractorQualification($scope.projects, function (message) {
            if (message) {
                // Notifications.addError({'status': 'error', 'message': "保存失败：" + message});
                callback($translate.instant("Msg_Save") + message)
            } else {

                $scope.filedata = [];
                //
                callback("");
                return;
            }

        })
    }
}

//保存并提交
$scope.saveAndSubmit = function () {
    console.log("------start saveAndSubmit----");
    //保存
    editsaveCheckInfo(function (message) {
        if (message) {
            Notifications.addError({'status': 'error', 'message': message});
        } else {
            createFlow();
        }
    });
};

//创建工作流
function createFlow() {

    var ChecherArray = [];
    TPMEngine.getCheckLeader($scope.DepartmentID, "1", function (res) {
        console.log(res);
        /*if (!res) {

         Notifications.addError({'status': 'error', 'message': "没找到对应的签核人员"});
         } else {*/

        ChecherArray.push(["cassie"]);
        ChecherArray.push(TPMEngine.GetAnContractor())
        console.log(ChecherArray);
        var promise = EngineApi.startFlowbyKeyname("GateContractorInfoProcess");
        promise.then(function (FlowDefinitionId) {
            console.log(FlowDefinitionId);
            startflowid(ChecherArray, FlowDefinitionId, function (meesage, flowres) {
                if (!meesage) {
                    $scope.projects.Status = "F";//N:新建  F:审核  Q:审核通过
                    ConQuaService.UpdateContractorQualificationStatus($scope.projects, function (message) {
                        if (message) {
                            Notifications.addError({'status': 'error', 'message': "保存失败：" + message});
                        } else {


                            var url = "/taskForm/" + flowres.url
                            $location.url(url);
                            location.reload();
                        }
                    })
                } else {
                    Notifications.addError({
                        'status': 'error',
                        'message': meesage
                    });
                }
            });
        }, function (error) {
            Notifications.addError({
                'status': 'error',
                'message': error
            });
        });

    });
}

//承揽作业资质 - 查询
function queryCQinfo(employer, callback) {
    var querypara = {};
    querypara.Employer = employer;
    ConQuaService.GetConQuaCQ().get(querypara).$promise.then(function (res) {
        for (var k = 0; k < res.length; k++) {
            res[k].CQFiles = JSON.parse(res[k].CQFiles) || [];
        }
        console.log(res);
        callback(res)
    }, function (errResponse) {
        console.log(errResponse)
        callback(null);
    });
}

var employer4CQ = "";
//承揽作业资质 - 显示新增
$scope.showaddCQ = function () {
    //
    $("#addModalCQ").modal('show');
    //
    $scope.add_Employer_CQ = employer4CQ;
}
//新增承揽作业资质
$scope.addsaveCQ = function () {
    console.log("------start addsaveCQ----");
    //
    var projects = {};
    projects.Employer = $scope.projects.Employer;
    projects.CQFiles = JSON.stringify($scope.filedata);
    projects.CQValidTo = $scope.add_CQValidTo;

    ConQuaService.CreateConQuaCQ(projects, function (message) {
        if (message) {
            Notifications.addError({'status': 'error', 'message': "新增失败：" + message});
        } else {
            console.log("新增成功！");
            $scope.filedata = [];
            queryCQinfo($scope.projects.Employer, function (rescontratorlist) {
                console.log(rescontratorlist);
                $scope.eCQ = rescontratorlist;
            })
        }
    })
    console.log("------end save----");
}
//显示编辑承揽作业资质界面
$scope.showeditCQ = function (e) {
    //
    console.log(e);
    $scope.update_ID_CQ = e.ID;
    $scope.update_Employer_CQ = e.Employer;
    $scope.update_CQFiles = e.CQFiles;
    $scope.update_CQValidTo = $filter('date')(e.CQValidTo, "yyyy-MM-dd");

    $scope.filedata = e.CQFiles || [];
    $("#editModalCQ").modal('show');
    //
}
//编辑保存承揽作业资质
$scope.editsaveCQ = function () {
    var projects = {};
    projects.ID = $scope.update_ID_CQ;
    projects.Employer = $scope.update_Employer_CQ;
    projects.CQFiles = JSON.stringify($scope.update_CQFiles);
    projects.CQValidTo = $filter('date')($scope.update_CQValidTo, "yyyy-MM-dd");
    //
    console.log("editsave update_CQFiles---" + $scope.update_CQFiles);
    //
    if (projects.CQFiles.length <= 2) {
        Notifications.addError({'status': 'error', 'message': "保存失败：没有上传作业资质"});
        return;
    }
    //
    ConQuaService.UpdateConQuaCQ(projects, function (message) {
        if (message) {
            Notifications.addError({'status': 'error', 'message': "保存失败：" + message});
        } else {
            alert("保存成功！");
            $scope.update_CQFiles = [];
            $scope.filedata = [];

            queryCQinfo($scope.update_Employer_CQ, function (cqlist) {
                $scope.eCQ = cqlist;
            })
        }
    })
    $("#editModalCQ").modal('hide');
}
//删除承揽作业资质
$scope.deleteCQ = function (e) {
    //
    console.log(e)
    var projects = {};
    projects.ID = e.ID;
    var r = confirm("确认删除该序号[" + e.ID + "]的作业资质吗？");
    if (r == true) {
        ConQuaService.DelConQuaCQ(projects, function (message) {
            if (message) {
                Notifications.addError({'status': 'error', 'message': "删除失败：" + message});
            } else {
                for (var i = 0; i < e.CQFiles.length; i++) {
                    EngineApi.removeDoc().deletefile({"objectId": e.CQFiles[i].DocId}, function (res) {
                        console.log("删除文件成功：");
                    });
                }
                $scope.eCQ.splice($scope.eCQ.indexOf(e), 1);

            }
        })
    }
}
//
//显示承揽商资质明细界面
$scope.ShowInfo = function (e) {
    var querypara = {};
    querypara.Employer = e.Employer;
    querypara.CType = "";
    querypara.DepartmentID = "";
    ConQuaService.GetContractorQualification().get(querypara).$promise.then(function (res) {
        for (var k = 0; k < res.length; k++) {
            res[k].BusinessLicence = JSON.parse(res[k].BusinessLicence) || [];
            res[k].OrganizationCodeCertificate = JSON.parse(res[k].OrganizationCodeCertificate) || [];
            res[k].TaxRegistrationCertificate = JSON.parse(res[k].TaxRegistrationCertificate) || [];
        }
        $scope.eCheckModel = res[0];
    }, function (errResponse) {
        Notifications.addError({'status': 'error', 'message': errResponse});
    });
    //
    queryCQinfo(e.Employer, function (cqlist) {
        $scope.eCQ = cqlist;
    })
    //
    $("#detailModal").modal('show');
    //
}
//

$scope.BusinessLicence = [];
$scope.OrganizationCodeCertificate = [];
$scope.TaxRegistrationCertificate = [];
$scope.CQFiles = [];
//上传按钮
$scope.upAddition = function (type) {
    console.log(111)
    $scope.upType = type;
    switch (type) {
        case "addBL":
            $scope.filedata = $scope.BusinessLicence || [];
            break;
        case "addOCC":
            $scope.filedata = $scope.OrganizationCodeCertificate || [];
            break;
        case "addTRC":
            $scope.filedata = $scope.TaxRegistrationCertificate || [];
            break;
        case "addCQ":
            $scope.filedata = $scope.CQFiles || [];
            break;
    }
    $('#fileModal').modal("show");
}
//保存文件
$scope.saveFile = function (type) {
    switch (type) {
        case "addBL":
            $scope.BusinessLicence = $scope.filedata;
            break;
        case "addOCC":
            $scope.OrganizationCodeCertificate = $scope.filedata;
            break;
        case "addTRC":
            $scope.TaxRegistrationCertificate = $scope.filedata;
            break;
        case "addCQ":
            $scope.CQFiles = $scope.filedata;
            break;
    }
    $scope.filedata = [];
    $('#fileModal').modal("hide");
}

$scope.onFileSelect = function ($files, type, size) {
    console.log($files);
    if (!size) {
        size = 1024 * 1024 * 1;
    }
    if ($files.size > size) {
        Notifications.addError({'status': 'error', 'message': "upload file can't over " + size + "byte"});
        return false;
    } else {
        for (var i = 0; i < $files.length; i++) {
            var $file = $files[i];

            $scope.upload = $upload.upload({
                url: '/api/cmis/upload',
                method: "POST",
                file: $file
            }).progress(function (evt) {
                // get upload percentage
                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function (data, status, headers, config) {
                // file is uploaded successfully
                console.log(data)
                switch (type) {
                    case "addBL":
                        $scope.BusinessLicence = data;
                        break;
                    case "addOCC":
                        $scope.OrganizationCodeCertificate = data;
                        break;
                    case "addTRC":
                        $scope.TaxRegistrationCertificate = data;
                        break;
                    case "addCQ":
                        $scope.CQFiles = data;
                        break;
                    case "addCQV":
                        $scope.filedata = data
                }
            }).error(function (data, status, headers, config) {
                console.log($file);
                console.log(status);
                console.log(data);
            });
        }
    }
};


var formVariables = $scope.formVariables = [];
var historyVariable = $scope.historyVariable = [];
//工作流
function startflowid(ChecherArray, definitionID, callback) {
    //当前部门的科长和安环的人员签核
    $scope.formVariables.push({name: "ChecherArray", value: ChecherArray});
    $scope.formVariables.push({name: "Employer", value: $scope.projects.Employer});
    $scope.formVariables.push({name: "start_remark", value: $scope.projects.Remark});
    $scope.historyVariable.push({name: "承揽商名称", value: $scope.projects.Employer});
    var variablesMap = {};
    variablesMap = Forms.variablesToMap(formVariables)
    historyVariable = Forms.variablesToMap(historyVariable)
    var datafrom = {
        formdata: variablesMap,
        historydata: historyVariable
    };
    console.log(datafrom);
    console.log(definitionID);
    EngineApi.doStart().start({
        "id": definitionID
    }, datafrom, function (res) {
        console.log(res);
        if (res.message) {

            callback(res.message, null);
            return;
        }
        if (!res.result) {
            callback(res.message, null);
        } else {

            callback("", res)
        }
    })
}
}])
;
})
;
