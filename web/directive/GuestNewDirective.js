define(['app','angular'],function(app,angular) {
    app.directive('myGuest', ['$resource', '$document','$filter', 'Notifications','Auth', 'GateGuest', function ($resource, $document,$filter, Notifications,Auth, GateGuest) {
        return {
            restrict: 'E',
            transclude: true,
            scope: false,
            controller: function ($scope) {

                 //获得姓名
    $scope.$watch("recod.start_code", function (n) {
        if (n !== undefined && document.getElementById("EmployeeID").readOnly == false) {
            if (n.length == 10) {
                var query = {};
                query.UserID = Auth.username;
                query.EmployeeID = n;
                GateGuest.GuestBasic().getNameByEmployeeID(query).$promise.then(function (res) {
                    $scope.recod.start_name = res[0].Name;
                    $scope.recod.DepartmentSpc = res[0].Specification;
                }, function (errResponse) {
                    Notifications.addError({
                        'status': 'error',
                        'message': errResponse
                    });
                });
            } else {
                $scope.recod.start_name = "";
            }
        }
    });
    $scope.addGuestItem = function () {
        if ($scope.note != null || $scope.note != {}) {
            $scope.guestItems.push($scope.note);
            $scope.note = {};
        }
    };

    $scope.deleteGuestItem = function (index) {
        $scope.guestItems.splice(index, 1);

    };
    
    var saveInit = function (type) {
        var dateObj = {};
        var objemail = [];
        var note = {};
        note.VoucherID = $scope.recod.start_voucherid || "";
        note.Content = $scope.recod.start_reason;
        if ($scope.recod.start_kind == "2") { //SaveGuest
            note.IsNeedConfirm = false;
            dateObj.confirm = "NO"
        } else {
            note.IsNeedConfirm = true;
            dateObj.confirm = "YES"
        }
        note.GuestType = $scope.recod.start_kind;
        note.Region = $scope.recod.start_area;
        var employeeID = $scope.recod.start_code;

        note.Respondent = employeeID.toUpperCase();
        note.DepartmentSpc = $scope.recod.DepartmentSpc;
        note.ExtNO = $scope.recod.start_phone;
        note.Enterprise = $scope.recod.start_company;
        note.ExpectIn = $scope.recod.start_date;
        note.UserID = Auth.username;
        note.Status = "N";
        for (var i = 0; i < $scope.guestItems.length; i++) {
            if ($scope.guestItems[i].IdCard == "" || !$scope.guestItems[i].IdCard) {
                $scope.guestItems[i].IdCard = i;
            }
        }
        note.GuestItems = $scope.guestItems;
        note.ExpectOutTime = $scope.recod.ExpectOutTime;
        note.VehicleNo = $scope.recod.VehicleNo;


        dateObj.note = note;

        return dateObj;
    };

            }
        }
        }])
    })