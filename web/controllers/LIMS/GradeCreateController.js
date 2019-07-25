define(['myapp', 'angular'], function (myapp, angular) {
    myapp.directive('createGrades', ['$filter', '$http',
        '$routeParams', '$resource', '$location', '$interval',
        'Notifications', 'Forms', 'Auth', 'EngineApi', '$translate', '$q', 'LIMSService',
        function ($filter, $http, $routeParams,
                  $resource, $location, $interval, Notifications, Forms, Auth,
                  EngineApi, $translate, $q, LIMSService) {
            return {
                restrict: 'AEC',
                controller: function ($scope) {
                    var formVariables = [];
                    var historyVariable = [];
                    $scope.materials = [];
                    function roundDown(number, decimals) {

                        if (number == '') {
                            return 0;
                        } else {
                            return (Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals));
                        }

                    }

                    $scope.Caculated = function (atts) {
                        if (atts == 'min') {
                            if ($scope.new.lower == false) {
                                if ($scope.new.upper == true) {
                                    $scope.new.lowerVal = '';
                                    if ($scope.new.upperVal != '' && $scope.new.upperVal != undefined) {
                                        $scope.new.ValueSpec = '≦' + roundDown($scope.new.upperVal, $scope.new.Prec);
                                        document.getElementById('btnAdd').disabled = false;
                                        return;
                                    }
                                }
                            }
                            if ($scope.new.upper == false && $scope.new.lower == false && $scope.new.Property != '') {
                                $scope.new.ValueSpec = '';
                                $scope.new.lowerVal = '';
                                document.getElementById('btnAdd').disabled = false;
                                return;
                            }
                            if ($scope.new.upper == false && $scope.new.lower == false && $scope.new.Property == '') {
                                $scope.new.ValueSpec = '';
                                document.getElementById('btnAdd').disabled = true;
                                return;
                            }

                        }
                        if (atts == 'max') {
                            if ($scope.new.upper == false) {
                                if ($scope.new.lower == true) {
                                    $scope.new.upperVal = '';
                                    if ($scope.new.lowerVal != '' && $scope.new.lowerVal != undefined) {
                                        $scope.new.ValueSpec = '≧' + roundDown($scope.new.lowerVal, $scope.new.Prec);
                                        document.getElementById('btnAdd').disabled = false;
                                        return;
                                    }

                                }

                            }
                            if ($scope.new.upper == false && $scope.new.lower == false && $scope.new.Property != '') {
                                $scope.new.ValueSpec = '';
                                $scope.new.upperVal = '';
                                document.getElementById('btnAdd').disabled = false;
                                return;
                            }
                            if ($scope.new.upper == false && $scope.new.lower == false && $scope.new.Property == '') {
                                $scope.new.ValueSpec = '';
                                document.getElementById('btnAdd').disabled = true;
                                return;
                            }

                        }
                        if ($scope.new.lower && $scope.new.upper) {
                            $scope.new.ValueSpec = '';
                            if ($scope.new.lowerVal != '' && $scope.new.upperVal != '' && $scope.new.lowerVal != undefined && $scope.new.upperVal != undefined) {
                                if (Math.floor($scope.new.lowerVal * 100) > Math.floor($scope.new.upperVal * 100)) {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': 'Lower value have to lower than Upper value'
                                    });
                                    document.getElementById('btnAdd').disabled = true;
                                    $scope.new.ValueSpec = '';

                                } else {

                                    $scope.new.ValueSpec = roundDown(((roundDown($scope.new.upperVal, $scope.new.Prec)) + (roundDown($scope.new.lowerVal, $scope.new.Prec))).toFixed( $scope.new.Prec) / 2, $scope.new.Prec) + '±' + roundDown(((roundDown($scope.new.upperVal, $scope.new.Prec)) - (roundDown($scope.new.lowerVal, $scope.new.Prec))).toFixed( $scope.new.Prec) / 2, $scope.new.Prec);
                                    document.getElementById('ValueSpec').disabled = true;
                                    document.getElementById('btnAdd').disabled = false;
                                }

                            } else {
                                document.getElementById('btnAdd').disabled = true;
                                $scope.new.ValueSpec = '';

                            }
                        }
                        else if ($scope.new.lower && !$scope.new.upper) {
                            if ($scope.new.lowerVal != '' && $scope.new.lowerVal != undefined) {
                                $scope.new.ValueSpec = '≧' + roundDown($scope.new.lowerVal, $scope.new.Prec);
                                document.getElementById('btnAdd').disabled = false;
                            } else {
                                document.getElementById('btnAdd').disabled = true;
                                $scope.new.ValueSpec = '';

                            }
                        }
                        else if (!$scope.new.lower && $scope.new.upper) {
                            if ($scope.new.upperVal != '' && $scope.new.upperVal != undefined) {
                                $scope.new.ValueSpec = '≦' + roundDown($scope.new.upperVal, $scope.new.Prec);
                                document.getElementById('btnAdd').disabled = false;
                            } else {
                                document.getElementById('btnAdd').disabled = true;
                                $scope.new.ValueSpec = '';

                            }
                        }
                    };
                    $scope.$watch('new.Prec', function (n) {
                        if (n !== undefined && $scope.new.lower == true && $scope.new.upper == true) {
                            if ($scope.new.lowerVal != '' && $scope.new.upperVal != '' && $scope.new.lowerVal != undefined && $scope.new.upperVal != undefined) {
                                $scope.new.ValueSpec = roundDown(((roundDown($scope.new.upperVal, $scope.new.Prec)) + (roundDown($scope.new.lowerVal, $scope.new.Prec))).toFixed( $scope.new.Prec) / 2, $scope.new.Prec) + '±' + roundDown(((roundDown($scope.new.upperVal, $scope.new.Prec)) - (roundDown($scope.new.lowerVal, $scope.new.Prec))).toFixed( $scope.new.Prec) / 2, $scope.new.Prec);
                                document.getElementById('btnAdd').disabled = false;
                            }
                        }
                        if (n !== undefined && $scope.new.lower != true && $scope.new.upper == true) {
                            if ($scope.new.upperVal != '' && $scope.new.upperVal != undefined) {
                                $scope.new.ValueSpec = '≦' + roundDown($scope.new.upperVal, $scope.new.Prec).toFixed( $scope.new.Prec);
                                document.getElementById('btnAdd').disabled = false;
                            }
                        }
                        if (n !== undefined && $scope.new.lower == true && $scope.new.upper != true) {
                            if ($scope.new.lowerVal != '' && $scope.new.lowerVal != undefined) {
                                $scope.new.ValueSpec = '≧' + roundDown($scope.new.lowerVal, $scope.new.Prec).toFixed( $scope.new.Prec);
                                document.getElementById('btnAdd').disabled = false;
                            }
                        }
                    });
                    $scope.$watch('new.lowerVal', function (n) {
                        if (n !== undefined && $scope.new.lower == true && $scope.new.upper == false) {
                            if (n != '') {
                                $scope.new.ValueSpec = '≧' + roundDown($scope.new.lowerVal, $scope.new.Prec);
                                document.getElementById('btnAdd').disabled = false;
                            }
                            else {
                                document.getElementById('btnAdd').disabled = true;
                                $scope.new.ValueSpec = '';

                            }
                        }
                        else if (n !== undefined && $scope.new.lower == true && $scope.new.upper == true) {
                            if (n != '') {
                                if ($scope.new.lowerVal != '' && $scope.new.lowerVal != undefined) {
                                    if (Math.floor($scope.new.lowerVal * 100) > Math.floor($scope.new.upperVal * 100)) {
                                        Notifications.addError({
                                            'status': 'error',
                                            'message': 'Lower value have to lower than Upper value'
                                        });
                                        document.getElementById('btnAdd').disabled = true;
                                        $scope.new.ValueSpec = '';

                                    } else {

                                        $scope.new.ValueSpec = roundDown(((roundDown($scope.new.upperVal, $scope.new.Prec)) + (roundDown($scope.new.lowerVal, $scope.new.Prec))).toFixed( $scope.new.Prec) / 2, $scope.new.Prec) + '±' + roundDown(((roundDown($scope.new.upperVal, $scope.new.Prec)) - (roundDown($scope.new.lowerVal, $scope.new.Prec))).toFixed( $scope.new.Prec) / 2, $scope.new.Prec);
                                        document.getElementById('btnAdd').disabled = false;
                                    }
                                }

                            } else {
                                document.getElementById('btnAdd').disabled = true;
                                $scope.new.ValueSpec = '';

                            }

                        } else {
                            if (n != '') {
                                if ($scope.new.lowerVal == '') {
                                    document.getElementById('btnAdd').disabled = false;
                                } else {
                                    document.getElementById('btnAdd').disabled = true;
                                }
                            }
                            if (n == '' && $scope.new.Property == '') {
                                document.getElementById('btnAdd').disabled = true;
                            }
                            if (n == '' && $scope.new.Property != undefined) {
                                document.getElementById('btnAdd').disabled = false;
                            }


                        }
                    });
                    $scope.$watch('new.upperVal', function (n) {
                        if (n !== undefined && $scope.new.upper == true && $scope.new.lower == false) {
                            if (n != '') {
                                $scope.new.ValueSpec = '≦' + roundDown($scope.new.upperVal, $scope.new.Prec);
                                document.getElementById('btnAdd').disabled = false;
                            }
                            else {
                                document.getElementById('btnAdd').disabled = true;
                                $scope.new.ValueSpec = '';

                            }
                        }
                        else if (n !== undefined && $scope.new.lower == true && $scope.new.upper == true) {
                            if (n != '') {
                                if ($scope.new.lowerVal != '' && $scope.new.lowerVal != undefined) {
                                    if (Math.floor($scope.new.lowerVal * 100) > Math.floor($scope.new.upperVal * 100)) {
                                        Notifications.addError({
                                            'status': 'error',
                                            'message': 'Lower value have to lower than Upper value'
                                        });
                                        document.getElementById('btnAdd').disabled = true;
                                        $scope.new.ValueSpec = '';

                                    } else {


                                        $scope.new.ValueSpec = roundDown(((roundDown($scope.new.upperVal, $scope.new.Prec)) + (roundDown($scope.new.lowerVal, $scope.new.Prec))).toFixed($scope.new.Prec) / 2, $scope.new.Prec) +
                                        '±' + roundDown(((roundDown($scope.new.upperVal, $scope.new.Prec)) - (roundDown($scope.new.lowerVal, $scope.new.Prec))).toFixed($scope.new.Prec) / 2, $scope.new.Prec);
                                        document.getElementById('btnAdd').disabled = false;
                                    }
                                }
                            } else {
                                document.getElementById('btnAdd').disabled = true;
                                $scope.new.ValueSpec = '';

                            }
                        } else {
                            if (n != '') {
                                if ($scope.new.upperVal == '') {
                                    document.getElementById('btnAdd').disabled = false;
                                    document.getElementById('ValueSpec').disabled = true;
                                    $scope.new.ValueSpec = '';
                                } else {
                                    document.getElementById('btnAdd').disabled = true;
                                }
                            }
                            if (n == '' && $scope.new.Property == '') {
                                document.getElementById('btnAdd').disabled = true;
                            }
                            if (n == '' && $scope.new.Property != undefined) {
                                document.getElementById('btnAdd').disabled = false;
                            }
                        }
                    });
                    $scope.editItem = function (index) {
                        console.log($scope.materials[index]);
                        var item = $scope.materials[index];

                        angular.forEach($scope.Attribute, function (value) {
                            if (value.PropertyName == item.PropertyName) {
                                $scope.new.Property = value;
                            }
                        });
                        if (item.MinValue) {
                            $scope.new.lower = true;
                            $scope.new.lowerVal = item.MinValue;
                        }
                        if (item.MaxValue) {
                            $scope.new.upper = true;
                            $scope.new.upperVal = item.MaxValue;
                        }
                        if (item.Enable == 'true') {
                            $scope.new.IsJudge = true;
                        } else if (item.Enable == 'false') {
                            $scope.new.IsJudge = false;
                        }
                        $scope.new.Prec = item.Prec;
                        $scope.materials.splice(index, 1);

                    };
                    $scope.CreateVoucher = function () {
                        var isCanCreate = 0;
                        angular.forEach($scope.materials, function (value) {
                            if (value.PropertyName !== $scope.new.Property.PropertyName) {
                                if (value.Grade === $scope.new.Grade.Grade) {
                                    isCanCreate++;
                                } else {
                                    Notifications.addError({
                                        'status': 'error',
                                        'message': 'Grade of property have to similar'

                                    });

                                }

                            }
                            else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': 'this PropertyName is exsit'
                                });

                            }
                        });
                        if (isCanCreate == $scope.materials.length) {

                            $scope.materials.push({
                                Grades: '00',
                                Grade: $scope.new.Grade.Grade,
                                Enable: $scope.new.IsJudge,
                                MaxValue: $scope.new.upperVal == '' || $scope.new.upperVal == undefined ? '' : roundDown($scope.new.upperVal, $scope.new.Prec).toFixed($scope.new.Prec>3?3:$scope.new.Prec),
                                MinValue: $scope.new.lowerVal == '' || $scope.new.lowerVal == undefined ? '' : roundDown($scope.new.lowerVal, $scope.new.Prec).toFixed($scope.new.Prec>3?3:$scope.new.Prec),
                                Prec: $scope.new.Prec,
                                PropertyName: $scope.new.Property.PropertyName,
                                ValueSpec: $scope.new.ValueSpec,
                                LOT_NO: $scope.note.Material,
                                SampleName: $scope.Sample.SampleName,
                                UserID: Auth.username, ValidDate: $scope.new.ValidDate,
                                ValidTODate: null
                            });
                            console.log($scope.materials);
                        }

                        clearData();
                    };
                    $scope.Close = function () {
                        clearModal();
                        $('#myModal').modal('hide');
                    };
                    function clearData() {
                        $scope.new.upperVal = '';
                        $scope.new.lowerVal = '';
                        $scope.new.ValueSpec = '';
                        $scope.new.IsJudge = '';
                        $scope.new.Prec = '';
                        $scope.new.Property = '';
                        $scope.new.upper = false;
                        $scope.new.lower = false;

                    }

                    function clearModal() {
                        $scope.new = {};
                        $scope.new.lowerVal = '';
                        $scope.new.upperVal = '';
                        $scope.new.ValidDate = '';
                        $scope.materials = [];

                    }

                    $scope.submit = function () {
                        if ($scope.checkList.length <= 0) {
                            Notifications.addError({
                                'status': 'error',
                                'message': 'Don\'t get leader'
                            });
                            return;
                        }
                        formVariables.push({name: 'ChecherArray', value: $scope.checkList});
                        save(function (result, err) {
                            if (!result) {
                                Notifications.addError({'status': 'error', 'message': err});

                            } else {
                                formVariables.push({name: 'ID', value: result.ID});
                                formVariables.push({name: 'sampleName', value: result.SampleName});
                                formVariables.push({name: 'Version', value: result.Version});
                                formVariables.push({
                                    name: 'graderemark',
                                    value: $scope.SampleDes + ' ' + $scope.note.Material + ' Version:' + result.VersionSpc
                                });
                                historyVariable.push({
                                    name: 'Remark',
                                    value: $scope.SampleDes + ' ' + $scope.note.Material + ' Version:' + result.VersionSpc
                                });
                                historyVariable.push({name: 'workflowKey', value: $scope.flowkey});
                                LIMSService.SubmitBPM($scope.flowkey, formVariables, historyVariable, '', function (res, message) {
                                    if (message) {
                                        Notifications.addError({'status': 'error', 'message': message});

                                    } else {
                                        Notifications.addMessage({'status': 'info', 'message': 'Success'});
                                        $scope.Search('P');
                                        $('#myModal').modal('hide');
                                    }
                                });

                            }

                        })
                    };
                    // function submitBPM(result) {
                    //     formVariables.push({ name: 'ChecherArray', value: $scope.checkList });
                    //     formVariables.push({ name: 'graderemark', value: $scope.SampleDes + ' ' + $scope.note.Material + ' Version:' + result.VersionSpc });
                    //     formVariables.push({ name: 'Remark', value: $scope.SampleDes + ' ' + $scope.note.Material + ' Version:' + result.VersionSpc });
                    //     historyVariable.push({ name: 'Remark', value: $scope.SampleDes + ' ' + $scope.note.Material + ' Version:' + result.VersionSpc });
                    //     historyVariable.push({ name: 'workflowKey', value: $scope.flowkey });

                    //     LIMSService.SubmitBPM($scope.flowkey, formVariables, historyVariable, '', function (res, message) {
                    //         if (message) {
                    //             Notifications.addMessage({ 'status': 'info', 'message': res.message });
                    //             return;
                    //         } else {
                    //             Notifications.addMessage({ 'status': 'info', 'message': 'Success' });
                    //             //clearModal();
                    //             $('#myModal').modal('hide');
                    //         }
                    //     });

                    // }
                    // Submit new version
                    $scope.submitModify = function () {
                        if ($scope.checkList.length <= 0) {
                            Notifications.addError({
                                'status': 'error',
                                'message': 'Don\'t get leader'
                            });
                            return;
                        }
                        formVariables.push({name: 'ChecherArray', value: $scope.checkList});
                        saveModify(function (result, err) {
                            if (!result) {
                                Notifications.addError({'status': 'error', 'message': err});

                            } else {
                                formVariables.push({name: 'ID', value: result.ID});
                                formVariables.push({name: 'sampleName', value: result.SampleName});
                                formVariables.push({name: 'Version', value: result.Version});
                                formVariables.push({
                                    name: 'graderemark',
                                    value: $scope.SampleDes + ' ' + $scope.note.Material + ' Version:' + result.VersionSpc
                                });
                                formVariables.push({
                                    name: 'Remark',
                                    value: $scope.SampleDes + ' ' + $scope.note.Material + ' Version:' + result.VersionSpc
                                });
                                historyVariable.push({name: 'workflowKey', value: $scope.flowkey});

                                LIMSService.SubmitBPM($scope.flowkey, formVariables, historyVariable, '', function (res, message) {
                                    if (message) {
                                        Notifications.addError({'status': 'error', 'message': message});

                                    } else {
                                        Notifications.addMessage({'status': 'info', 'message': 'Success'});
                                        $scope.Search('P');
                                        $('#myModal').modal('hide');
                                    }
                                });
                            }
                        })
                    };
                    // Save sunmit new version
                    function saveModify(callback) {
                        var mar = paraData('');
                        console.log(mar);
                        LIMSService.gradeVersion.SaveModifyVersion(mar).$promise.then(function (res) {
                            if (res.Error) {
                                callback('', res.Error);
                            } else {
                                callback(res);
                            }

                        }, function (errormessage) {
                            callback('', errormessage);
                        });
                    }

                    function paraData(id) {
                        var grade = {};
                        grade.Grade = $scope.new.Grade.Grade;
                        grade.Grades = '00';
                        grade.GradesDto = [];
                        grade.ID = id;
                        var materials = $scope.materials;
                        for (var i = 0; i < materials.length; i++) {
                            var propery = {};
                            propery.Enable = materials[i].Enable || false;
                            propery.MaxValue = materials[i].MaxValue || NaN;
                            propery.MinValue = materials[i].MinValue || NaN;
                            propery.Prec = materials[i].Prec;
                            propery.PropertyName = materials[i].PropertyName;
                            propery.ValueSpec = materials[i].ValueSpec;
                            grade.GradesDto.push(propery);
                        }
                        grade.LOT_NO = $scope.note.Material;
                        grade.SampleName = $scope.Sample.SampleName;
                        grade.UserID = Auth.username;
                        grade.ValidDate = $scope.new.ValidDate;
                        grade.ValidTODate = NaN;
                        grade.Version = 1;
                        return grade;
                    }


                    $scope.deleteMaterialsItem = function (index) {
                        $scope.materials.splice(index, 1);
                    };
                    $scope.SaveDraft = function () {
                        save(function (result, err) {
                            if (result) {
                                Notifications.addMessage({
                                    'status': 'info',
                                    'message': 'save Success'
                                });
                                $scope.Search('N');
                                $('#myModal').modal('hide');
                            } else {
                                Notifications.addError({
                                    'status': 'error',
                                    'message': err
                                });
                            }
                        })

                    };
                    function save(callback) {
                        var mar = paraData('');
                        console.log(mar);
                        LIMSService.GradeVersion().CreateVersion(mar).$promise.then(function (res) {
                            if (res.Error) {
                                callback('', res.Error);
                            } else {
                                callback(res);
                            }

                        }, function (errormessage) {
                            callback('', errormessage);
                        });
                    }

                },
                templateUrl: '/forms/QCGrades/CopyModel.html'
            }


        }]);

});