include('Utilities.js');
include('ParentalControl.js');
include('Structures.js');

init = function() {
    /** @namespace
    * CheckPINsettings
    */
    CheckPINsettings = {
        /**
         * Enable and setup Daily lock
         * If parental control is not enabled default PIN ('1234') will be set
         * @author Stanislav Chichagov schichagov@luxoft.com
         * @memberof CheckPINsettings
         * @param {number} startTime
         * Start time of Daily lock in seconds.
         * @param {number} endTime
         * End time of Daily lock in seconds.
         * @param {function} exitFunc
         * Function will be called on success with true as an argument
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as an argument 
         * @requires Library: {@link ParentalControl}
         * @requires Library: {@link Utilities}
         */
        setupDailyLock: function (startTime, endTime, exitFunc, failFunc) {
            var failFunc = failFunc || exitFunc;

            function manager(args) {
                var steps = {
                    "Connect" : function() {
                        //print test description:
                        Utilities.print(" ");
                        Utilities.print("Test description:");
                        Utilities.print("1. Connect PC to TV.");
                        Utilities.print("2. Check is Parental control enabled "
                                        + "and set default PIN if not");
                        Utilities.print("3. Enable Daily lock and set start "
                                        + "and end time of locking.");
                        Utilities.print(" ");
                        Utilities.print("Test execution:");
                        Utilities.connectToTV(function(){
                            manager(["CheckPinLock"]);
                        }, 2000);
                    },
                    "CheckPinLock": function() {
                        var is_pinSet = de.loewe.sl2.i32.parental.lock.pin
                            .memorised;
                        if (is_pinSet.getValue() == 1) {
                            manager(["SetupDailyLock"]);
                        }
                        else {
                            Utilities.print("WARN: PIN control is not enabled. "
                                            + "PIN code will be set to "
                                            + "default.");
                            manager(["PINsetup"]);
                        }
                    },
                    "PINsetup": function() {
                        ParentalControl.setupPIN(
                            function(){manager(["SetupDailyLock"]);},
                            '1234',
                            function(){
                                Utilities.print("#ERROR: PIN control was not "
                                                + "enabled. Test will be "
                                                + "interrupted.");
                                manager(["EndTest"]);});
                    },
                    "SetupDailyLock": function() {
                        var dailyLockAPI = [
                            {api: de.loewe.sl2.i32.parental.lock.all.daily,
                                value: 1,
                                name: "Daily lock option"},
                            {api: de.loewe.sl2.i32.parental.lock.daily.start,
                                value: startTime,
                                name: "Start time of Daily lock"},
                            {api: de.loewe.sl2.i32.parental.lock.daily.end,
                                value: endTime,
                                name: "End time of Daily lock"}
                        ];
                        function incrementSetup(APIlist) {
                            if (APIlist.length > 0) {
                                Structures.setSmoothCheck(function(){
                                        Utilities.print("#VERIFICATION PASSED: "
                                                + "Value of " + APIlist[0].name
                                                + " is set to expected "
                                                + APIlist[0].value);
                                        incrementSetup(APIlist.slice(1));},
                                    APIlist[0], APIlist[0].value,
                                    function(){
                                        Utilities.print("#VERIFICATION FAILED: "
                                                + "Value of " + APIlist[0].name
                                                + " is " + APIlist[0].api
                                                    .getValue() + " that is "
                                                + "different from expected "
                                                + APIlist[0].value + ". "
                                                + "Test will be interrupted.");
                                        manager(["EndTest"]);});
                            }
                            else {
                                manager(["EndTest", true]);
                            }
                        }
                        incrementSetup(dailyLockAPI);
                    },
                    "EndTest": function(result) {
                        result = result[0] || false;
                        if (result) {
                            exitFunc(true);
                        }
                        else {
                            failFunc(false);
                        }
                    }
                };
                steps[args[0]](args.slice(1));
            }
            manager(["Connect"]);
        },
        /**
         * Activate locking of all channels
         * If parental control is not enabled default PIN ('1234') will be set
         * @author Stanislav Chichagov schichagov@luxoft.com
         * @memberof CheckPINsettings
         * @param {function} exitFunc
         * Function will be called on success with true as an argument
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as an argument 
         * @requires Library: {@link ParentalControl}
         * @requires Library: {@link Utilities}
         */
        lockAllChannels: function (exitFunc, failFunc) {
            var failFunc = failFunc || exitFunc;

            function manager(args) {
                var steps = {
                    "Connect" : function() {
                        //print test description:
                        Utilities.print(" ");
                        Utilities.print("Test description:");
                        Utilities.print("1. Connect PC to TV.");
                        Utilities.print("2. Check is Parental control enabled "
                                        + "and set default PIN if not");
                        Utilities.print("3. Lock all channels.");
                        Utilities.print(" ");
                        Utilities.print("Test execution:");
                        Utilities.connectToTV(function(){
                            manager(["CheckPinLock"]);
                        }, 2000);
                    },
                    "CheckPinLock": function() {
                        var is_pinSet = de.loewe.sl2.i32.parental.lock.pin
                            .memorised;
                        if (is_pinSet.getValue() == 1) {
                            manager(["LockChannels"]);
                        }
                        else {
                            Utilities.print("WARN: PIN control is not enabled. "
                                            + "PIN code will be set to "
                                            + "default.");
                            manager(["PINsetup"]);
                        }
                    },
                    "PINsetup": function() {
                        ParentalControl.setupPIN(
                            function(){manager(["LockChannels"]);},
                            '1234',
                            function(){
                                Utilities.print("#ERROR: PIN control was not "
                                                + "enabled. Test will be "
                                                + "interrupted.");
                                manager(["EndTest"]);});
                    },
                    "LockChannels": function() {
                        var lockAllAPI = {
                            api: de.loewe.sl2.i32.parental.lock.all,
                            value: 1,
                            name: "Lock all channels option"
                        };
                        Structures.setSmoothCheck(function(){
                                Utilities.print("#VERIFICATION PASSED: Value of "
                                                + lockAllAPI.name + " is set "
                                                + " to expected "
                                                + lockAllAPI.value);
                                manager(["EndTest", true]);},
                            lockAllAPI, lockAllAPI.value, function(){
                                Utilities.print("#VERIFICATION FAILED: Value of "
                                                + lockAllAPI.name + " is "
                                                + lockAllAPI.api.getValue()
                                                + " that is different from "
                                                + "expected " + lockAllAPI.value
                                                + ". Test will be interrupted");
                                manager(["EndTest"]);});
                    },
                    "EndTest": function(result) {
                        result = result[0] || false;
                        if (result) {
                            exitFunc(true);
                        }
                        else {
                            failFunc(false);
                        }
                    }
                };
                steps[args[0]](args.slice(1));
            }
            manager(["Connect"]);
        },
        /**
         * Activate lock by age
         * If parental control is not enabled default PIN ('1234') will be set
         * @author Stanislav Chichagov schichagov@luxoft.com
         * @memberof CheckPINsettings
         * @param {number} lockType
         * Type of locking:
         * AgeRelatedLock.DEACTIVATED;
         * AgeRelatedLock.ACTIVATED;
         * AgeRelatedLock.ALWAYS_BLOCKED;
         * lockType can be set to DO_NOT_CHANGE to skip type channging.
         * @param {number} age
         * Number from 3 to 18
         * @param {function} exitFunc
         * Function will be called on success with true as an argument
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as an argument 
         * @requires Library: {@link ParentalControl}
         * @requires Library: {@link Utilities}
         */
        lockByAge: function (lockType, age, exitFunc, failFunc) {
            var failFunc = failFunc || exitFunc;
            
            function manager(args) {
                var steps = {
                    "Connect" : function() {
                        //print test description:
                        Utilities.print(" ");
                        Utilities.print("Test description:");
                        Utilities.print("1. Connect PC to TV.");
                        Utilities.print("2. Check is Parental control enabled "
                                        + "and set default PIN if not");
                        Utilities.print("3. Check age-related settings.");
                        Utilities.print("4. Set lock type if it possible.");
                        Utilities.print("4. Set age.");
                        Utilities.print(" ");
                        Utilities.print("Test execution:");
                        Utilities.connectToTV(function(){
                            manager(["CheckPinLock"]);
                        }, 2000);
                    },
                    "CheckPinLock": function() {
                        var is_pinSet = de.loewe.sl2.i32.parental.lock.pin
                            .memorised;
                        if (is_pinSet.getValue() == 1) {
                            manager(["CheckAgeRelatedSettings"]);
                        }
                        else {
                            Utilities.print("WARN: PIN control is not enabled. "
                                            + "PIN code will be set to "
                                            + "default.");
                            manager(["PINsetup"]);
                        }
                    },
                    "PINsetup": function() {
                        ParentalControl.setupPIN(
                            function(){manager(["CheckAgeRelatedSettings"]);},
                            '1234',
                            function(){
                                Utilities.print("#ERROR: PIN control was not "
                                                + "enabled. Test will be "
                                                + "interrupted.");
                                manager(["EndTest"]);});
                    },
                    "CheckAgeRelatedSettings": function() {
                        var is_pinDisengageable = de.loewe.sl2.i32.parental.lock
                            .age_related.disengageable;
                        var is_pinAlwaysExist = de.loewe.sl2.i32.parental.lock
                            .age_related.always.exist;
                        if (lockType == "DNC") {
                            Utilities.print("WARN: Age-related lock is set to "
                                            + "be not changed");
                            manager(["SetAge"]);
                        }
                        else if (is_pinDisengageable.getValue() == 0) {
                            Utilities.print("WARN: Age-related lock is not "
                                                + "disengageable. Only age "
                                                + "will be set.");
                            manager(["SetAge"]);
                        }
                        else if (is_pinAlwaysExist.getValue() == 0 && lockType == 2) {
                            Utilities.print("#VERIFICATION FAILED: Age-related "
                                            + "lock can't be set to Always "
                                            + "blocked. Test will be "
                                            + "interrupted");
                            manager(["EndTest"]);
                        }
                        else {
                            manager(["AgeLockSetup"]);
                        }
                    },
                    "AgeLockSetup": function() {
                        var ageLockAPI = {
                            api: de.loewe.sl2.i32.parental.lock.age_related,
                            value: lockType,
                            name: "Age-related lock"
                        };
                        Structures.setSmoothCheck(function(){
                                Utilities.print("#VERIFICATION PASSED: "
                                                + ageLockAPI.name + " value is "
                                                + "set to expected "
                                                + ageLockAPI.value);
                                manager(["SetAge"]);
                            },
                            ageLockAPI, ageLockAPI.value, function(){
                                Utilities.print("#VERIFICATION FAILED: "
                                                + ageLockAPI.name + " value is "
                                                + ageLockAPI.api.getValue()
                                                + " that is different from "
                                                + "expected " + ageLockAPI.value
                                                + ". Test will be interrupted");
                                manager(["EndTest"]);});
                    },
                    "SetAge": function() {
                        var ageAPI = {
                            api: de.loewe.sl2.i32.parental.lock.age,
                            value: age,
                            name: "Age"
                        };
                        if (age == "DNC") {
                            Utilities.print("WARN: Age value is set to be not "
                                            + "changed");
                            manager(["EndTest", true]);
                        }
                        else if (age >= 3 && age <= 18) {
                            Structures.setSmoothCheck(function(){
                                    Utilities.print("#VERIFICATION PASSED: "
                                                    + ageAPI.name + " value"
                                                    + " is set to expected "
                                                    + ageAPI.value);
                                    manager(["EndTest", true]);
                                },
                                ageAPI, ageAPI.value, function(){
                                    Utilities.print("#VERIFICATION FAILED: "
                                                    + "Value of " + ageAPI.name
                                                    + " is " 
                                                    + ageAPI.api.getValue()
                                                    + " that is different from "
                                                    + "expected " + ageAPI.value
                                                    + ". Test will be "
                                                    + "interrupted");
                                    manager(["EndTest"]);});
                        }
                        else {
                            Utilities.print("#VERIFICATION FAILED: Age "
                                            + "value is not valid. "
                                            + "Test will be "
                                            + "interrupted");
                            manager(["EndTest"]);
                        };

                    }, 
                    "EndTest": function(result) {
                        result = result[0] || false;
                        if (result) {
                            exitFunc(true);
                        }
                        else {
                            failFunc(false);
                        }
                    }
                };
                steps[args[0]](args.slice(1));
            }
            manager(["Connect"]);
        },
        /**
         * checkConfirmPIN
         * Check PIN request and confirm it if it necessary
         * @author Stanislav Chichagov schichagov@luxoft.com
         * @memberof CheckPINsettings
         * @param {function} exitFunc
         * Function will be called on success with true as an argument
         * @param {number} is_pinRequested
         * Check PIN request: 0 - NO, 1 - YES
         * @param {number} confirmPIN
         * Should PIN request be confirmed: 0 - NO, 1 - YES
         * @param {String} pin
         * Four digit PIN code. Can be empty string '' or undefined.
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as an argument 
         * @requires Library: {@link ParentalControl}
         * @requires Library: {@link Utilities}
         */
        checkConfirmPIN: function (exitFunc, is_pinRequested, confirmPIN, pin, failFunc) {
            var failFunc = failFunc || exitFunc;
            var pin = pin || '1234';

            function manager(args) {
                var steps = {
                    "Connect" : function() {
                        //print test description:
                        Utilities.print(" ");
                        Utilities.print("Test description:");
                        Utilities.print("1. Connect PC to TV.");
                        Utilities.print("2. Check is PIN requested.");
                        Utilities.print("3. Confirm PIN if it necessary.");
                        Utilities.print(" ");
                        Utilities.print("Test execution:");
                        Utilities.connectToTV(function(){
                            manager(["PinRequest"]);
                        }, 2000);
                    },
                    "PinRequest": function() {
                        if (is_pinRequested) {
                            if (ParentalControl.checkPINrequest()) {
                                Utilities.print("#VERIFICATION PASSED: PIN is "
                                                + "requested.");
                                if (confirmPIN) {
                                    manager(["PinConfirmation"]);
                                }
                                else {
                                    Utilities.print("WARN: PIN confirmation "
                                                    + "was skipped by user.");
                                    manager(["EndTest", true]);
                                }
                            }
                            else {
                                Utilities.print("#VERIFICATION FAILED: PIN "
                                                + "request is not displayed. "
                                                + "Test will be interrupted.");
                                manager(["EndTest"]);
                            }
                        }
                        else {
                            if (ParentalControl.checkPINrequest() == false) {
                                Utilities.print("#VERIFICATION PASSED: PIN is "
                                                + "not requested.");
                                manager(["EndTest", true]);
                            }
                            else {
                                Utilities.print("#VERIFICATION FAILED: PIN is "
                                                + "requested. Test will be "
                                                + "interrupted.");
                                manager(["EndTest"]);
                            }
                        }
                    },
                    "PinConfirmation": function() {
                        ParentalControl.confirmPINrequest(function(){
                                manager(["EndTest", true]);},
                            pin,
                            function(){
                                Utilities.print("#VERIFICATION FAILED: PIN "
                                                + "request was not confirmed. "
                                                + "Test will be interrupted.");
                                manager(["EndTest"]);});
                    },
                    "EndTest": function(result) {
                        result = result[0] || false;
                        if (result) {
                            exitFunc(true);
                        }
                        else {
                            failFunc(false);
                        }
                    }
                };
                steps[args[0]](args.slice(1));
            }
            manager(["Connect"]);
        },
    }
}
