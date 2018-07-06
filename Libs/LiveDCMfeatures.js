include('Utilities.js');
include('Scan.js');
include('ChannelChange.js');
include('Messages.js');
include('Enumerators.js');
include('Timer.js');
include('PressButton.js');
include('Structures.js');

init = function () {

/** @namespace
 * Test script for live DCM features
 * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
 * {@link ChannelChange}, {@link Timer}, {@link PressButton},
 * {@link Structures}
 */
LiveDCMfeatures = {
    DCM_CHANNEL: [],
    DCM_FLOW: "",
    OTHER_CHANNEL: [],
    SCAN_RESULT: {},
    NUMBER_OF_TV_SERVICES: "",
    NUMBER_OF_RADIO_SERVICES: "",
    END: function() {
        Utilities.print("Test finished.");
        Utilities.printTestResult();
        Utilities.endTest();
    },
    /**
     * Is used to close DCM pop-up without DCM execution
     * @author Stanislav Chichagov schichagov@luxoft.com
     * @memberof LiveDCMfeatures
     *
     * @param {Array} DCMchannel
     * Homing channel describing by array:
     * <br/> [channel number, media type, name of service list]
     * Can be set to DO_NOT_CHANGE to avoid channel zap
     *
     * @param {Number} DCMflow
     * Type of update should be performed (see Enumerators):
     * <br/> - DCMflow.IMMEDIATELY
     * <br/> - DCMflow.BEFORE_STANDBY
     * <br/> - DCMflow.LATER
     * DCMflow.IMMEDIATELY will be changed by DCMflow.LATER to avoid
     * start of DCM. Use LiveDCM.startTest to execute DCM immediately
     *
     * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
     * {@link ChannelChange}, {@link Timer}, {@link PressButton},
     * {@link Structures}
     */
    CloseDCMpopup: function(DCMchannel, DCMFlow) {
        if (DCMchannel == "DNC") {
            LiveDCMfeatures.DCM_CHANNEL = "DNC";
        }
        else if ( !Array.isArray(DCMchannel)
            || DCMchannel.length < 3 ) {
            Utilities.print(
                "#ERROR: Channel for live DCM verification "
                    + " is not specified.\nTest cannot be executed."
            );
            LiveDCMfeatures.END(false);
        }
        else {
            LiveDCMfeatures.DCM_CHANNEL = DCMchannel;
        }
        if ( typeof(DCMFlow) != "number" ) {
            Utilities.print("#ERROR: DCM flow is not specified. "
                            + "\nTest cannot be executed.");
            LiveDCMfeatures.END(false);
        }
        else if (DCMFlow == 9) {
            Utilities.print("WARN: 'Later' will be used instead of "
                            + "'Immediately' to close DCM pop-up");
            //Later = 11. See Enumerators.js.
            LiveDCMfeatures.DCM_FLOW = 11;
            manage(["Connect"]);
        }
        else {
            LiveDCMfeatures.DCM_FLOW = DCMFlow;
            manage(["Connect"]);
        }
        function manage(args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Switch to homing channel.");
                    Utilities.print("3. Verify whether DCM pop-up "
                                    + "is available.");
                    Utilities.print("4. Close DCM pop-up.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                            function(){
                                manage(["SwitchToDCMchannel"]);
                            }, 2000);
                },
                // Switch to homing channel
                "SwitchToDCMchannel" : function() {
                    if (LiveDCMfeatures.DCM_CHANNEL == "DNC") {
                        Utilities.print("DCM pop-up will be checked on "
                                        + "current service");
                        manage(["CloseUnnecessaryOSDs"]);
                    }
                    else {
                        Utilities.print("Switching to homing channel...");
                        ChannelChange.zapWithVerification(
                            function() {
                                Utilities.print(
                                    "Switch to homing channel "
                                        + "is successful.");
                                setTimeout(function(){
                                        manage(["CloseUnnecessaryOSDs"]);
                                    },3000);
                            },
                            LiveDCMfeatures.DCM_CHANNEL[0],
                            LiveDCMfeatures.DCM_CHANNEL[1],
                            LiveDCMfeatures.DCM_CHANNEL[2],
                            function() {
                                Utilities.print("#VERIFICATION FAILED: Switch "
                                                + "to homing channel was not "
                                                + "performed");
                                manage(["EndTest"]);
                            }
                        );
                    }
                },
                // Check availability of DCM notification
                "CloseUnnecessaryOSDs" : function() {
                    Utilities.print("Closing all messages except DCM dialog to "
                                    + "check live DCM pop-up");
                    Messages.closeMessages(
                        function(result) {
                            manage(["CheckMessages", result]);
                        },
                        Message.DCM_LIVE
                    );
                },
                "CheckMessages" : function(result) {
                    if (result[0]) {
                        Utilities.print("#VERIFICATION PASSED: Live update "
                                        + "message is displayed.");
                        Messages.confirmMessage(
                            function() {
                                Utilities.print("DCM dialog was confirmed "
                                                + "successfully.");
                                manage(["EndTest"]);
                            },
                            [Message.DCM_LIVE, LiveDCMfeatures.DCM_FLOW],
                            function() {
                                Utilities.print("#VERIFICATION FAILED: DCM "
                                                + "dialog was not confirmed.");
                                manage(["EndTest"]);
                            },
                            function() {
                                manage(["EndTest"]);
                            }
                        );
                    }
                    else {
                        Utilities.print("#VERIFICATION FAILED: DCM dialog "
                                        + "is NOT available.");
                        manage(["EndTest"]);
                    }
                },
                // Finalize test
                "EndTest": function(){
                    Utilities.print("Test finished.");
                    Utilities.printTestResult();
                    Utilities.endTest()
                },
            }
            steps[args[0]](args.slice(1));
        }
    },
    /**
     * Is used to close DCM pop-up if requist is displayed
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof LiveDCMfeatures
     *
     * @param {Array} DCMchannel
     * Homing channel describing by array:
     * <br/> [channel number, media type, name of service list]
     * Can be set to DO_NOT_CHANGE to avoid channel zap
     *
     * @param {Number} DCMflow
     * Type of update should be performed (see Enumerators):
     * <br/> - DCMflow.IMMEDIATELY
     * <br/> - DCMflow.BEFORE_STANDBY
     * <br/> - DCMflow.LATER
     * DCMflow.IMMEDIATELY will be changed by DCMflow.LATER to avoid
     * start of DCM. Use LiveDCM.startTest to execute DCM immediately
     *
     * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
     * {@link ChannelChange}, {@link Timer}, {@link PressButton},
     * {@link Structures}
     */
    CloseDCMpopupIfDisplayed: function(DCMchannel, DCMFlow) {
        if (DCMchannel == "DNC") {
            LiveDCMfeatures.DCM_CHANNEL = "DNC";
        }
        else if ( !Array.isArray(DCMchannel)
            || DCMchannel.length < 3 ) {
            Utilities.print(
                "#ERROR: Channel for live DCM verification "
                    + " is not specified.\nTest cannot be executed."
            );
            LiveDCMfeatures.END(false);
        }
        else {
            LiveDCMfeatures.DCM_CHANNEL = DCMchannel;
        }
        if ( typeof(DCMFlow) != "number" ) {
            Utilities.print("#ERROR: DCM flow is not specified. "
                            + "\nTest cannot be executed.");
            LiveDCMfeatures.END(false);
        }
        else if (DCMFlow == 9) {
            Utilities.print("WARN: 'Later' will be used instead of "
                            + "'Immediately' to close DCM pop-up");
            //Later = 11. See Enumerators.js.
            LiveDCMfeatures.DCM_FLOW = 11;
            manage(["Connect"]);
        }
        else {
            LiveDCMfeatures.DCM_FLOW = DCMFlow;
            manage(["Connect"]);
        }
        function manage(args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Switch to homing channel.");
                    Utilities.print("3. Verify whether DCM pop-up "
                                    + "is available");
                    Utilities.print("4. Close DCM pop-up.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                            function(){
                                manage(["SwitchToDCMchannel"]);
                            }, 2000);
                },
                // Switch to homing channel
                "SwitchToDCMchannel" : function() {
                    if (LiveDCMfeatures.DCM_CHANNEL == "DNC") {
                        Utilities.print("DCM pop-up will be checked on "
                                        + "current service");
                        manage(["CloseUnnecessaryOSDs"]);
                    }
                    else {
                        Utilities.print("Switching to homing channel...");
                        ChannelChange.zapWithVerification(
                            function() {
                                Utilities.print(
                                    "Switch to homing channel "
                                        + "is successful.");
                                setTimeout(function(){
                                        manage(["CloseUnnecessaryOSDs"]);
                                    },3000);
                            },
                            LiveDCMfeatures.DCM_CHANNEL[0],
                            LiveDCMfeatures.DCM_CHANNEL[1],
                            LiveDCMfeatures.DCM_CHANNEL[2],
                            function() {
                                Utilities.print("#VERIFICATION FAILED: Switch "
                                                + "to homing channel was not "
                                                + "performed");
                                manage(["EndTest"]);
                            }
                        );
                    }
                },
                // Check availability of DCM notification
                "CloseUnnecessaryOSDs" : function() {
                    Utilities.print("Closing all messages except DCM dialog to "
                                    + "check live DCM pop-up.");
                    Messages.closeMessages(
                        function(result) {
                            manage(["CheckMessages", result]);
                        },
                        Message.DCM_LIVE
                    );
                },
                "CheckMessages" : function(result) {
                    if (result[0]) {
                        Utilities.print("#VERIFICATION PASSED: Live update "
                                        + "message is displayed.");
                        Messages.confirmMessage(
                            function() {
                                Utilities.print("DCM dialog was confirmed "
                                                + "successfully.");
                                manage(["EndTest"]);
                            },
                            [Message.DCM_LIVE, LiveDCMfeatures.DCM_FLOW],
                            function() {
                                Utilities.print("#VERIFICATION FAILED: DCM "
                                                + "dialog was not confirmed.");
                                manage(["EndTest"]);
                            },
                            function() {
                                manage(["EndTest"]);
                            }
                        );
                    }
                    else {
                        Utilities.print("#VERIFICATION PASSED: DCM dialog "
                                        + "is NOT available.");
                        manage(["EndTest"]);
                    }
                },
                // Finalize test
                "EndTest": function(){
                    Utilities.print("Test finished.");
                    Utilities.printTestResult();
                    Utilities.endTest()
                },
            }
            steps[args[0]](args.slice(1));
        }
    },
    /**
     * Is used to check that DCM pop-up is not displayed
     * @author Stanislav Chichagov schichagov@luxoft.com
     * @memberof LiveDCMfeatures
     *
     * @param {Array} DCMchannel
     * Homing channel describing by array:
     * <br/> [channel number, media type, name of service list]
     * Can be set to DO_NOT_CHANGE to avoid channel zap
     *
     * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
     * {@link ChannelChange}, {@link Timer}, {@link PressButton},
     * {@link Structures}
     */
    CheckDCMpopup: function(DCMchannel) {
        if (DCMchannel == "DNC") {
            LiveDCMfeatures.DCM_CHANNEL = "DNC";
            manage(["Connect"]);
        }
        else if ( !Array.isArray(DCMchannel)
            || DCMchannel.length < 3 ) {
            Utilities.print("#ERROR: Channel for live DCM verification is not "
                            + "specified.\nTest cannot be executed.");
            LiveDCMfeatures.END(false);
        }
        else {
            LiveDCMfeatures.DCM_CHANNEL = DCMchannel;
            manage(["Connect"]);
        }
        function manage(args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(testName);
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Switch to homing channel.");
                    Utilities.print("3. Verify whether update notification "
                                    + "is available");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                            function(){
                                manage(["SwitchToDCMchannel"]);
                            }, 2000);
                },
                // Switch to homing channel
                "SwitchToDCMchannel" : function() {
                    if (LiveDCMfeatures.DCM_CHANNEL == "DNC") {
                        Utilities.print("DCM pop-up will be checked on "
                                        + "current service");
                        manage(["CloseUnnecessaryOSDs"]);
                    }
                    else {
                        Utilities.print("Switching to homing channel...");
                        ChannelChange.zapWithVerification(
                            function() {
                                Utilities.print(
                                    "Switch to homing channel "
                                        + "is successful.");
                                setTimeout(function(){
                                        manage(["CloseUnnecessaryOSDs"]);
                                    },3000);
                            },
                            LiveDCMfeatures.DCM_CHANNEL[0],
                            LiveDCMfeatures.DCM_CHANNEL[1],
                            LiveDCMfeatures.DCM_CHANNEL[2],
                            function() {
                                Utilities.print("#VERIFICATION FAILED: Switch "
                                                + "to homing channel was not "
                                                + "performed");
                                manage(["EndTest"]);
                            }
                        );
                    }
                },
                // Check availability of DCM notification
                "CloseUnnecessaryOSDs" : function() {
                    Utilities.print("Closing all messages except DCM "
                                    + "dialog to check that DCM live is "
                                    + "NOT started.");
                    Messages.closeMessages(
                        function(result) {
                            manage(["CheckMessages", result]);
                        },
                        Message.DCM_LIVE
                    );
                },
                "CheckMessages" : function(result) {
                    if (result[0]) {
                        Utilities.print("#VERIFICATION FAILED: Live update "
                                        + "message is displayed.");
                    }
                    else {
                        Utilities.print("#VERIFICATION PASSED: DCM dialog "
                                        + "is NOT available.");
                    }
                    manage(["EndTest"]);
                },
                //Finalize test
                "EndTest": function(){
                    Utilities.print("Test finished.");
                    Utilities.printTestResult();
                    Utilities.endTest()
                },
            };
            steps[args[0]](args.slice(1));
        }
    },
    /**
     * Is used to check that DCM will not be executed (flag is reset)
     * after performing of initial or auto scan (scan should be used
     * in steps before step with CheckFlagReset). Also please use after
     * step with CheckFlagReset additional step to confirm Wake up message.
     * @author Stanislav Chichagov schichagov@luxoft.com
     * @memberof LiveDCMfeatures
     *
     * @param {Array} DCMchannel
     * Homing channel describing by array:
     * <br/> [channel number, media type, name of service list]
     * Can be set to DO_NOT_CHANGE to avoid channel zap
     *
     * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
     * {@link ChannelChange}, {@link Timer}, {@link PressButton},
     * {@link Structures}
     */
    CheckFlagReset: function(DCMchannel) {
        if (DCMchannel == "DNC") {
            LiveDCMfeatures.DCM_CHANNEL = "DNC";
            manage(["Connect"]);
        }
        else if ( !Array.isArray(DCMchannel)
            || DCMchannel.length < 3 ) {
            Utilities.print("#ERROR: Channel for live DCM verification "
                            + "is not specified.\nTest cannot be executed.");
            LiveDCMfeatures.END(false);
        }
        else {
            LiveDCMfeatures.DCM_CHANNEL = DCMchannel;
            manage(["Connect"]);
        }
        function manage(args) {
            var steps = {
                "Connect": function() {
                    Utilities.print(testName);
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Switch to homing channel.");
                    Utilities.print("3. Set up timer to wake up TV.");
                    Utilities.print("4. Turn off TV and check DCM.");
                    Utilities.print("5. Execute DCM in fail case.");
                    Utilities.print("6. Check that TV set "
                                    + "is switched OFF.");
                    Utilities.print("7. Wait before end of test.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");

                    if ( !Array.isArray(DCMchannel)
                        || DCMchannel.length < 3 ) {
                        Utilities.print("#ERROR: Channel for live DCM "
                                        + "verification is not specified."
                                        + "\nTest cannot be executed.");
                        manage(["EndTest"]);
                    }
                    else {
                        Utilities.connectToTV(
                            function(){
                                manage(["SwitchToDCMchannel"]);
                            }, 2000);
                    }
                },
                // Switch to homing channel
                "SwitchToDCMchannel": function() {
                    Utilities.print("Switching to homing channel...");
                    ChannelChange.zapWithVerification(
                        function() {
                            Utilities.print("Switch to homing channel "
                                            + "is successful.");
                            manage(["TimerSetup"]);
                        },
                        DCMchannel[0],
                        DCMchannel[1],
                        DCMchannel[2],
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Switch to homing channel "
                                            + "was not performed");
                            manage(["EndTest"]);
                        }
                    );
                },
                // Set up timer for wakeup
                "TimerSetup": function() {
                    Timer.setAlarmOnceTimer(
                        function() {
                            Utilities.print("Timer for wake up after "
                                            + "4 minutes was set.");
                            manage(["TurnOff"]);
                        },
                        function() {
                            Utilities.print("WARN: Timer for wake up was not "
                                            + "set correctly.");
                            manage(["TurnOff"]);
                        },
                        MediaType.RADIO,
                        240
                    );
                },
                // Send "standby" signal
                "TurnOff": function() {
                    PressButton.singlePress(Key.OFF);
                    Utilities.print("Signal to standby was sent.");
                    // Timeout to let wizard appear
                    window.setTimeout(
                        function() {
                            manage(["DCMmonitor"]);
                        },
                        2000
                    )
                },
                // Monitor scan process
                "DCMmonitor": function() {
                    var dcmActive = de.loewe.sl2.i32.channel.search.osd.dcm
                        .interactive;
                    // The TV set went to standby as last scan state
                    // has been processed. UI doesn't affect the behaviour
                    var closeUI = 1;
                    NUMBER_OF_TV_SERVICES = 0;
                    NUMBER_OF_RADIO_SERVICES = 0;
                    SCAN_RESULT = {};
                    if (dcmActive.getValue() == 1) {
                        Utilities.print("#VERIFICATION FAILED: Interactive "
                                        + "DCM was started. DCM will be "
                                        + "executed to correct exit"
                                        + "from DCM state.");
                        Scan.liveDcmMonitor(
                            function() {
                                manage(["CheckPowerCase"]);
                            },
                            NUMBER_OF_TV_SERVICES,
                            NUMBER_OF_RADIO_SERVICES,
                            SCAN_RESULT,
                            closeUI,
                            function() {
                                manage(["CheckPowerCase"]);
                            },
                            function() {
                                manage(["CheckPowerCase"]);
                            }
                        );
                    }
                    else {
                        Utilities.print("#VERIFICATION PASSED: Interactive "
                                        + "DCM was not started.");
                        manage(["CheckPowerCase", true]);
                    }
                },
                // Check that the TV set went to standby
                "CheckPowerCase": function(result) {
                    var powerCase = Structures.createSimpleSetting(
                        ["Power case"],
                        [de.loewe.sl2.i32.system.enum.pwr.use.case],
                        [0]
                    );
                    if (result[0] == true) {
                        var exFunc = function() {
                            Utilities.print("#VERIFICATION PASSED: The TV "
                                            + "set went to standby."
                                            + "\nWait 240 seconds.");
                            setTimeout(function() {
                                manage(["WaitPowerON"]);
                            },240000);
                        };
                    }
                    else {
                         var exFunc = function() {
                            Utilities.print("#VERIFICATION PASSED: The TV "
                                            + "set went to standby."
                                            + "\nWait 180 seconds.");
                            setTimeout(function() {
                                manage(["WaitPowerON"]);
                            },180000);
                        };
                    }
                    Structures.delayedCheck(
                        powerCase[0],
                        5000,
                        function() {
                            exFunc();
                        },
                        function() {
                            Utilities.print("#VERIFICATION FAILED: The TV "
                                            + "set didn't go to standby.");
                            manage(["EndTest"]);
                        }
                    );
                },
                "WaitPowerON": function() {
                    Utilities.print("WARN: It is not possible to check "
                                    + "was TV set switched ON or not."
                                    + "\nPlease use additional step "
                                    + "to confirm wake up message.");
                    manage(["EndTest"]);

                },
                "EndTest": function(){
                    Utilities.print("Test finished.");
                    Utilities.printTestResult();
                    Utilities.endTest()
                },
            };
            steps[args[0]](args.slice(1));
        }
    }
}
}
