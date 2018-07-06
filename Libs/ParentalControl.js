include('Utilities.js');
include('Structures.js');
include('PressButton.js');
include('Messages.js');

init = function() {
    /** @namespace
     * ParentalControl
     */
    ParentalControl = {
        /**
         * Check the PIN validity
         * If the PIN is valid it will be returned in the string form,
         * otherwise the default PIN ('1234') will be returned
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ParentalControl
         * @param {String, Number} pin
         * Four digit PIN code.
         * @requires Library: {@link Utilities}
         */
        checkPIN: function (pin) {
            var pin = String(pin);
            if (pin === "0") {
                // Set an empty PIN
                return "";
            }
            else if ((pin == "DNC") || (pin === "")) {
                return pin;
            }
            else {
                // Replace codes having a wrong length or repeated digits
                if (pin.length != 4 || pin.split("")
                    .filter(function(item, id) {
                        return pin.indexOf(item) == id;
                    }).length == 1) {
                    return '1234';
                }
                else {
                    return pin;
                }
            }
        },
        /**
         * Filter settings related to parental control and
         * create a default PIN setting if no parental control settings
         * were filtered
         * @memberof ParentalControl
         * @param {Object} inputSettings
         * @requires Library: {@link Utilities}
         */
        parseParentalControlSettings: function (inputSettings) {
            var parentalControlSettings = {};
            var otherSettings = {}
            var re = new RegExp("^PIN_");
            if (Object.keys(inputSettings).length != 0) {
                Object.keys(inputSettings).forEach(
                    function(item) {
                        if (re.test(item)) {
                            parentalControlSettings[item] =
                                inputSettings[item];
                        }
                        else {
                            otherSettings[item] = inputSettings[item];
                        }
                    }
                );
            }
            if (Object.keys(parentalControlSettings).length == 0){
                parentalControlSettings = { PIN_code:
                                            {operatingValue: '1234'}};
            }

            return [otherSettings, parentalControlSettings];
        },
        /**
         * Set PIN code for parental control
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ParentalControl
         * @param {function} exitFunc
         * Function will be called on success with true as an argument
         * @param {string} [pin='1234']
         * Four digit PIN code.
         * PIN code consisting from the same digit repeated 4 times
         * will be rejected by the function itself, default PIN code value
         * will be used
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as an argument
         * @requires Library: {@link Utilities}
         * @requires Library: {@link Structures}
         */
        setupPIN: function (exitFunc, pin, failFunc) {
            var failFunc = failFunc || exitFunc;
            var pin = ParentalControl.checkPIN(pin);
            var pinAPI = {
                description: "PIN code",
                api: de.loewe.sl2.str.parental.lock.pin
            };
            function check(result) {
                var is_pinSet = de.loewe.sl2.i32
                    .parental.lock.pin.memorised.getValue();
                if (result && (is_pinSet == 1)) {
                    Utilities.print("PIN code is memorized successfully.");
                    exitFunc(true);
                }
                else {
                    Utilities.print("#ERROR: PIN code was not memorized.");
                    failFunc(false);
                }
            }
            Structures.setSmoothCheck(check, pinAPI, pin);
        },
        /**
         * Set a PIN code for parental control via currently open
         * wizard.
         * Note: It's impossible to identify the current OSD, so use this
         * method only when sure that the active OSD contains request for
         * PIN setup.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ParentalControl
         * @param {function} exitFunc
         * Function will be called on success with true as its argument
         * @param {string} [pin='1234']
         * Four digit PIN code.
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as its argument
         * @requires Library: {@link Utilities}
         * @requires Library: {@link Structures}
         * @requires Library: {@link PressButton}
         * @requires Library: {@link Messages}
         */
        setRequiredPIN: function (exitFunc, pin, failFunc) {
            var isOSDopen = de.loewe.sl2.messages.osd.visible;
            var isPinRequired = de.loewe.sl2.i32.parental.lock.show.wizard;
            var currentPin = de.loewe.sl2.str.parental.lock.pin;
            var locale = de.loewe.sl2.i32.basic.settings
                .tvset.location.getValue();
            var pin = ParentalControl.checkPIN(pin);
            var failFunc = failFunc || exitFunc;

            function pinManager(args) {
                var steps = {
                    "CheckPINobligatoriness": function() {
                        var wizardAPI = {
                                name: "PINrequestRequired",
                                api: isPinRequired,
                                operatingValue: 1
                            };
                        Structures.delayedCheck(wizardAPI, 10000,
                                     function() {
                                         Utilities.print("A PIN code is "
                                                         + "required.");
                                         pinManager(["PINsetup"]); },
                                     function() {
                                         Utilities.print("A PIN code is "
                                                         + "not required.");
                                         pinManager(["EndTest", true]); });
                    },
                    // FIXME: Uncomment block below if messages start
                    // to catch RCU signals or remove it if this capture
                    // never happens. Commented because of cycled
                    // messages.
                    
                    //"Setup": function() {
                    //    Messages.closeMessages(
                    //        function() { pinManager(["PINsetup"]); },
                    //        // No active messages
                    //        0,
                    //       function() { pinManager(["EndTest"]); }
                    //    );
                    //},
                    "PINsetup": function() {
                        var pinSeq = String(pin).split("");
                        var FFkey = '40';
                        var initKey = [];
                        // France = 7
                        if (locale == 7) {
                            initKey = [FFkey];
                        }
                        // Sequence of keys to be sent
                        var keySeq = initKey.concat(pinSeq, FFkey,
                                                    pinSeq, FFkey);
                        var osdAPI = {
                            name: "OSDavailability",
                            api: isOSDopen,
                            operatingValue: 0
                        };
                        function typing(seq, exFunc) {
                            if (seq.length != 0) {
                                PressButton.singlePress(seq[0]);
                                window.setTimeout(
                                    function() {
                                        typing(seq.slice(1), exFunc);
                                    }, 2000);
                            }
                            else {
                                exFunc();
                            }
                        }

                        if (isOSDopen.getValue()) {
                            Utilities.print("Setting up PIN...");
                            typing(keySeq, function() {
                                Structures.delayedCheck(osdAPI, "", function() {
                                    Utilities.print("PIN entered "
                                                    + "successfully.");
                                    pinManager(["PINverification"]);
                                }, function() {
                                    Utilities.print("WARN: "
                                                    + "Some OSD is open. It "
                                                    + "could be an active"
                                                    + " PIN request.");
                                    pinManager(["PINverification"]);
                                });
                            });
                        }
                        else {
                            Utilities.print("WARN: The PIN request is"
                                            + " unavailable.");
                            pinManager(["EndTest"]);
                        }
                    },
                    "PINverification": function() {
                        var pinAPI = {
                                name: "PIN",
                                api: currentPin,
                                operatingValue: pin
                            };
                            Structures.smoothCheck(pinAPI, "", function() {
                                Utilities.print("The PIN saved successfully.");
                                pinManager(["EndTest", true]);
                            }, function() {
                                Utilities.print("WARN: The PIN was not "
                                                + "saved.");
                                pinManager(["EndTest"]);
                            });
                    },
                    "EndTest": function(result) {
                        //result = result[0] || false;
                        if (result[0]) {
                            exitFunc(true);
                        }
                        else {
                            failFunc(false);
                        }
                    }
                };
                steps[args[0]](args.splice(1, 1));
            }
            pinManager(["CheckPINobligatoriness"]);

        },
        /**
         * Verify if PIN request is active
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ParentalControl
         * @returns {boolean} flag
         * @requires Library: {@link Utilities}
         */
        checkPINrequest: function () {
            var request = de.loewe.sl2.vstr.parental.lock.pin.request
                .getValue();
            //TODO: Add support of CI+ or general PIN verification
            // depend on an argument
            switch(request[0]) {
            // No PIN request
            case "0":
            // CI+ PIN request
            case "2":
                return false;
                break;
            case "1":
                return true;
                break;
            }
        },
        /**
         * Confirm PIN request
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ParentalControl
         * @param {function} exitFunc
         * Function will be called on success with true as an argument
         * @param {string} [pin='1234']
         * Four digit PIN code.
         * PIN code consisting from the same digit repeated 4 times
         * will be rejected by the function itself, default PIN code value
         * will be used
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as an argument
         * @requires Library: {@link Utilities}
         * @requires Library: {@link Structures}
         */
        confirmPINrequest: function (exitFunc, pin, failFunc) {
            var failFunc = failFunc || function(){ exitFunc(false) };
            var exFunc = function() {
                Utilities.print("A PIN code was confirmed.");
                exitFunc(true) };
            var pin = ParentalControl.checkPIN(pin);
            var sysPin = de.loewe.sl2.str.parental.lock.pin.getValue();
            var request = de.loewe.sl2.vstr.parental.lock.pin.request;
            function handleRequest(){
                if (ParentalControl.checkPINrequest()) {
                    var confirmPIN = de.loewe.sl2.action
                        .parental.lock.pin.request.confirm;
                    var systemLocked = {
                        description: "system lock state",
                        api: de.loewe.sl2.i32.parental.lock.system.locked,
                        operatingValue: 0
                    };
                    Structures.delayedCheck(systemLocked,
                                            3000,
                                            exFunc,
                                            function() {
                                                Utilities.print(
                                                    "WARN: System unlock "
                                                        + "failed.");
                                                failFunc();
                                            }
                                           );
                    // First argument: 1 - confirmed, 0 - cancelled
                    confirmPIN.call([1, pin]);
                }
                else {
                    Utilities.print("A PIN code was not requested.");
                    failFunc();
                }
            }
            if ((sysPin.length == 4) && (sysPin != pin)) {
                Utilities.print("WARN: The PIN code to be entered ("
                                + pin + ") differs from the current system "
                                + "value (" + sysPin + ").");
            }
            Structures.delayedListener(request, handleRequest, 2000);
        },
        /**
         * Enter the system PIN code
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ParentalControl
         * @param {function} exitFunc
         * Function will be called on success with true as an argument
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as an argument
         */
        enterSystemPin: function (exitFunc, failFunc) {
            var failFunc = failFunc || exitFunc;
            var sysPin = de.loewe.sl2.str.parental.lock.pin.getValue();
            ParentalControl.confirmPINrequest(exitFunc, sysPin, failFunc);
        },
        /**
         * Cancel PIN request
         * @author Stanislav Chichagov schichagov@luxoft.com
         * @memberof ParentalControl
         * @param {function} exitFunc
         * Function will be called on success with true as an argument
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as an argument
         */
        cancelPINrequest: function (exitFunc, failFunc) {
            var failFunc = failFunc || exitFunc;
            var confirmPIN = de.loewe.sl2.action.parental.lock
                .pin.request.confirm;
            if (ParentalControl.checkPINrequest()) {
                confirmPIN.call([0]);
                setTimeout(
                    function(){
                        if (ParentalControl.checkPINrequest()) {
                            Utilities.print("WARN: PIN request was not "
                                            + "cancelled.");
                            exitFunc(false);
                        }
                        else {
                            Utilities.print("PIN request was cancelled.");
                            exitFunc(true);
                        }
                    },
                    3000
                );
            }
            else {
                Utilities.print("PIN is not requested");
                exitFunc(true);
            }
        },
    }
}
