include('../Utilities.js');
include('../Scan.js');
include('../ChannelChange.js');
include('../Messages.js');
include('../Timer.js');
include('../PressButton.js');
include('../Structures.js');
include('../Enumerators.js');

init = function () {

    /** @namespace
     * Test script for live DCM
     * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
     * {@link ChannelChange}, {@link Timer}, {@link PressButton},
     * {@link Structures}
     */
    LiveDCM = {

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
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof LiveDCM
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
 *
 * @param {Array} [otherChannel = []]
 * Channel different from homing one describing by array:
 * <br/> [channel number, media type, name of service list]
 *
 * @param {object} [scanResult]
 * Array containing scan states and required actions, for example, LCN conflict 
 * and required swap for Mediaset. Script will check that not expected states
 * were not observed during test execution.
 * See template InitialScan(Mediaset).html for more details.
 * 
 * @param {Number} isHomingFrequency
 * 'Yes' by default. Set this parameter to 'No' in the test to check case when
 * DCM is started w/o signal on homing frequency. In this case DCM will be
 * executed without any changes and second DCM popup will be appeared.
 *
 * @param {string} [exitFunction = Utilities.endTest]
 * Function that should be called at the end
 * with test result = true/false as parameter
 * If exitFunction is not set, test will be
 * finished with result printing.
 *
 * @example
 * Structure of scanResult
 * var expectedScanResult = {
 *      lcnConflict: {
 *          serviceList:[],
 *          executeSwap:[]
 *      }
 * };
 * @requires Library: {@link Utilities}
 */
        startTest: function (DCMchannel,
                             DCMflow,
                             otherChannel,
                             scanResult,
                             numberTVservices,
                             numberRadioServices,
                             endFunction
                            ) {
            if (typeof(endFunction) == 'function') {
                LiveDCM.END = endFunction;
            }
            // Mandatory parameters
            if (DCMchannel == "DNC") {
                LiveDCM.DCM_CHANNEL = "DNC";
            }
            else if ( !Array.isArray(DCMchannel)
                 || DCMchannel.length < 3 ) {
                Utilities.print(
                    "#ERROR: Channel for live DCM verification "
                        + " is not specified.\nTest cannot be executed."
                );
                LiveDCM.END(false);
            }
            else {
                LiveDCM.DCM_CHANNEL = DCMchannel;
            }

            if ( typeof(DCMflow) != "number" ) {
                Utilities.print("#ERROR: DCM flow is not specified. "
                                + "\nTest cannot be executed.");
                LiveDCM.END(false);
            }
            else {
                LiveDCM.DCM_FLOW = DCMflow;
            }

            if (( !Array.isArray(otherChannel)
                  || otherChannel.length < 3 )
                //DCMflow.LATER (see Enumerators.js)
                && LiveDCM.DCM_FLOW == 11) {
                Utilities.print("WARN: Additional channel for "
                                +"postponed live DCM verification "
                                + " is not specified.\nFinal channel change "
                                + "will not be executed.");
            }
            else {
                LiveDCM.OTHER_CHANNEL = otherChannel;
            }

            if ((typeof(scanResult) != "object"
                 || Object.keys(scanResult).length == 0)
                //DCMflow.IMMEDIATELY (see Enumerators.js)
                 && LiveDCM.DCM_FLOW == 9
               ) {
                Utilities.print("WARN: Scan results for "
                                +"immediate live DCM verification "
                                + " are not specified.\nCoresponding check "
                                + "will be omitted.");
            }
            else {
                LiveDCM.SCAN_RESULT = scanResult;
            }
            if ( typeof(numberTVservices) != "number" ) {
                Utilities.print("WARN: number of new TV services "
                                + "is not specified.\n"
                                + "Corresponding check will be omitted.");
            }
            else {
                LiveDCM.NUMBER_OF_TV_SERVICES = numberTVservices;
            }

            if ( typeof(numberRadioServices) != "number" ) {
                Utilities.print("WARN: number of new radio services "
                                + "is not specified.\n"
                                + "Corresponding check will be omitted.");
            }
            else {
                LiveDCM.NUMBER_OF_RADIO_SERVICES = numberRadioServices;
            }

            if (typeof(endFunction) == 'function') {
                LiveDCM.manager(["SwitchToDCMchannel"]);
            }
            else {
                LiveDCM.manager(["Connect"]);
            }
        },
/**
 * Execute selected type of DCM update
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof LiveDCM
 * {@link ChannelChange}, {@link Timer}, {@link PressButton},
 * {@link Structures}
 */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    //print test description:
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Switch to homing channel.");
                    Utilities.print("3. Verify whether update notification "
                                    + "is available");
                    switch (LiveDCM.DCM_FLOW){
                    case 9:
                        Utilities.print(
                            "4. Select immediate update and "
                                + "confirm the notification respectively.");
                        Utilities.print(
                            "5. Verify whether the notification "
                                + "is closed");
                        Utilities.print(
                            "6. Monitor process of a live update.");
                        Utilities.print(
                            "7. Verify there is no unexpected scan states\n"
                                + "   (depending on expected scan results).");
                        Utilities.print(
                            "8. Check number of found TV and Radio services.");
                        Utilities.print(
                            "9. Check whether update notification "
                                + "is unavailable");
                        break;
                    case 10:
                        Utilities.print(
                            "4. Select update before standby and "
                                + "confirm the notification respectively.");
                        Utilities.print(
                            "5. Verify whether the notification "
                                + "is closed");
                        Utilities.print(
                            "6. Set up timer for wake up after 4 minutes");
                        Utilities.print(
                            "7. Send turn off signal via RCU emulation.");
                        Utilities.print(
                            "8. Monitor process of an update.");
                        Utilities.print(
                            "9. Verify there is no unexpected scan states\n"
                                + "   (depending on expected scan results).");
                        Utilities.print(
                            "10. Check number of found TV and "
                                + "Radio services.");
                        Utilities.print(
                            "11. Check whether a TV set went to standby");
                        break;
                    case 11:
                        Utilities.print(
                            "4. Select postponed update and "
                                + "confirm the notification respectively.");
                        Utilities.print(
                            "5. Verify whether the notification "
                                + "is closed");
                        Utilities.print(
                            "6. Switch current channel from homing one.");
                        Utilities.print(
                            "7. Return to homing channel.");
                        Utilities.print(
                            "8. Verify whether the notification "
                                + "is unavailable.");
                        break;
                    }
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                            Utilities.connectToTV(function(){
                                LiveDCM.manager(["SwitchToDCMchannel"]);
                            }, 2000);
                },
                // Switch to homing channel
                "SwitchToDCMchannel" : function() {
                    if (LiveDCM.DCM_CHANNEL == "DNC") {
                        Utilities.print("DCM pop-up will be checked on current "
                                        + "service");
                        LiveDCM.manager(["CloseUnnecessaryOSDs"]);
                    }
                    else {
                        Utilities.print("Switching to homing channel...");
                        ChannelChange.zapWithVerification(
                            function() {
                                Utilities.print(
                                    "Switch to homing channel "
                                        + "is successful.");
                                LiveDCM.manager(["CloseUnnecessaryOSDs"]);
                            },
                            LiveDCM.DCM_CHANNEL[0],
                            LiveDCM.DCM_CHANNEL[1],
                            LiveDCM.DCM_CHANNEL[2],
                            function() {
                                Utilities.print(
                                    "#VERIFICATION FAILED: "
                                        + "Switch to homing channel "
                                        + "was not performed");
                                LiveDCM.manager(["EndTest"]);
                            }
                        );
                    }
                },
                // Check availability of DCM notification
                "CloseUnnecessaryOSDs" : function() {
                    //Sometimes check of DCM popup is performed before 
                    //it's appear. Therefore 3 second timeout is used. 
                    setTimeout(function() {
                        Messages.closeMessages(
                            function() {
                                Utilities.print(
                                        "Live update message is "
                                        + "displayed."
                                        + "\nAll unnecessary messages "
                                        + "are closed.");
                                LiveDCM.manager(["ConfirmUpdateMsg"]);
                            },
                            Message.DCM_LIVE,
                            function() {
                                Utilities.print(
                                    "#VERIFICATION FAILED: "
                                        + "Expected DCM dialog is not "
                                        + "available.");
                                LiveDCM.manager(["EndTest"]);
                            },
                            function() {
                                LiveDCM.manager(["EndTest"]);
                            }
                        );
                    }, 3000);
                },
                // Select update flow in notification
                "ConfirmUpdateMsg" : function() {
                    Messages.confirmMessage(
                        function() {
                            Utilities.print("DCM dialog was confirmed "
                                            + "successfully.");
                            LiveDCM.manager([
                                "CheckClosedDCMdialog"
                                ]);
                        },
                        [ Message.DCM_LIVE, LiveDCM.DCM_FLOW ],
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "DCM dialog was not confirmed.");
                            LiveDCM.manager(["EndTest"]);
                        },
                        function() {
                            LiveDCM.manager(["EndTest"]);
                        }
                    );
                },
                // Check that notification is closed
                "CheckClosedDCMdialog" : function() {
                    var flows = {
                        "9": function() {
                            Utilities.print("Immediate update is selected.")
                            LiveDCM.manager(["DCMmonitor"]);
                        },
                        "10": function() {
                            Utilities.print("Update is postponed to standby.")
                            LiveDCM.manager(["TimerSetup"]);
                        },
                        "11": function() {
                            Utilities.print("#VERIFICATION PASSED:"
                                            + " Update is postponed to next "
                                            +"request.")
                            if (LiveDCM.OTHER_CHANNEL.length != 0) {
                                LiveDCM.manager(["ChangeChannelFrom"]);
                            }
                            else {
                                LiveDCM.manager(["EndTest", true]);
                            }
                        }
                    };
                    var flowSetup = flows[LiveDCM.DCM_FLOW];
                    Messages.closeMessages(
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "DCM dialog is still active.");
                            LiveDCM.manager(["EndTest"]);
                        },
                        Message.DCM_LIVE,
                        flowSetup,
                        function() {
                            LiveDCM.manager(["EndTest"]);
                        }
                    );
                },
                // --------- Immediate update ------------
                // Monitor scan process
                "DCMmonitor" : function() {
                    if (LiveDCM.DCM_FLOW == 10) {
                        var exitFunc = function() {
                            LiveDCM.manager(["CheckPowerCase"]);
                        };
                        // The TV set went to standby as last scan state
                        // has been processed. UI doesn't affect the behaviour
                        var closeUI = 0;
                    }
                    else {
                        var exitFunc = function() {
                            setTimeout(function(){
                                    LiveDCM.manager(["OSDfinalCheck"]);
                                },1000);
                        };
                        // After update TV set state should be checked
                        // so wizard should be closed
                        var closeUI = 1;
                    }
                    Scan.liveDcmMonitor(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "Live update was performed"
                                            + " successfully.");
                            exitFunc();
                        },
                        LiveDCM.NUMBER_OF_TV_SERVICES,
                        LiveDCM.NUMBER_OF_RADIO_SERVICES,
                        LiveDCM.SCAN_RESULT,
                        closeUI,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Live update was not performed"
                                            + " successfully.");
                            exitFunc();
                        },
                        function() {
                            LiveDCM.manager(["EndTest"]);
                        }
                    );
                },
                // --------- Update before standby ------------
                // Set up timer for wakeup
                "TimerSetup" : function() {
                   Timer.setAlarmOnceTimer(
                       function() {
                           Utilities.print("Timer for wake up after 4 minutes"
                                           + " was set.");
                           LiveDCM.manager(["TurnOff"]);
                       },
                       function() {
                           Utilities.print("WARN: "
                                           + "Timer for wake up was not set "
                                           + "correctly.");
                           LiveDCM.manager(["TurnOff"]);
                       },
                       MediaType.TV,
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
                            LiveDCM.manager(["DCMmonitor"]);
                        },
                        2000
                    )
                },
                // Check that the TV set went to standby
                "CheckPowerCase" : function() {
                    var powerCase = Structures.createSimpleSetting(
                        ["Power case"],
                        [de.loewe.sl2.i32.system.enum.pwr.use.case],
                        [0]
                    );
                    Structures.delayedCheck(
                        powerCase[0],
                        5000,
                        function() {
                            Utilities.print("#VERIFICATION PASSED:"
                                            + " The TV set went to standby.")
                            LiveDCM.manager(["EndTest", true]);
                        },
                        function() {
                            Utilities.print("#VERIFICATION FAILED: The TV set "
                                            + "didn't go to standby.")
                            LiveDCM.manager(["EndTest"]);
                        }
                    );
                },
                // --------- Postponed update ------------
                // Move from homing channel to another one
                "ChangeChannelFrom" : function() {
                    ChannelChange.zapWithVerification (
                        function() {
                            Utilities.print("Channel is successfully "
                                            + "switched from "
                                            + "homing one.");
                            LiveDCM.manager(["ChangeChannelBack"]);
                        },
                        LiveDCM.OTHER_CHANNEL[0],
                        LiveDCM.OTHER_CHANNEL[1],
                        LiveDCM.OTHER_CHANNEL[2],
                        function() {
                                Utilities.print(
                                    "#VERIFICATION FAILED: "
                                        + "Switch from homing channel "
                                        + "was not performed");
                                LiveDCM.manager(["EndTest"]);
                        }
                    );
                },
                // Return to homing channel
                "ChangeChannelBack" : function() {
                        ChannelChange.zapWithVerification (
                            function() {
                                Utilities.print("Channel is successfully "
                                                + "switched to "
                                                + "homing one.");
                                setTimeout(function(){
                                        LiveDCM.manager(["OSDfinalCheck"]);
                                    },1000);
                            },
                            LiveDCM.DCM_CHANNEL[0],
                            LiveDCM.DCM_CHANNEL[1],
                            LiveDCM.DCM_CHANNEL[2],
                            function() {
                                Utilities.print(
                                    "#VERIFICATION FAILED: "
                                        + "Switch to homing channel "
                                        + "was not performed");
                                LiveDCM.manager(["EndTest"]);
                            }
                        );
                },
                // Check update notification is not available
                "OSDfinalCheck" : function () {
                    Messages.closeMessages(
                        function() {
                            Utilities.print("#VERIFICATION FAILED: DCM "
                                            + "dialog is still active.");
                            LiveDCM.manager(["CloseDCMpopup"]);
                        },
                        Message.DCM_LIVE,
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "DCM dialog is not available "
                                            + "anymore.");
                            LiveDCM.manager(["EndTest", true]);
                        },
                        function() {
                            LiveDCM.manager(["EndTest"]);
                        }
                    );
                },
                //Close second DCM popup by selecting 'Later'
                "CloseDCMpopup" : function(result) {
                    Utilities.print("WARN: Second DCM popup will be closed by "
                                    + "selecting 'Later'");
                    var result = result[0] || false;
                    Messages.confirmMessage(
                        function() {
                            Utilities.print("DCM dialog was confirmed "
                                            + "successfully.");
                            LiveDCM.manager(["EndTest", result]);
                        },
                        [Message.DCM_LIVE, DCMflow.LATER],
                        function() {
                            Utilities.print("#VERIFICATION FAILED: DCM "
                                            + "dialog was not confirmed.");
                            LiveDCM.manager(["EndTest"]);
                        },
                        function() {
                            LiveDCM.manager(["EndTest"]);
                        }
                    );
                },
                // Finalize test
                "EndTest" : function(result) {
                    LiveDCM.END(result[0]||false);
                }
            }
            steps[args[0]](args.splice(1, 1));
        },
    }
}
