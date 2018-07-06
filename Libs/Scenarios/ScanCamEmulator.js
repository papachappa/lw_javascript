include('../Utilities.js');
include('../Scan.js');
include('../Languages.js');
include('../ParentalControl.js');
include('../Enumerators.js');
include('../Antenna.js');
include('../Structures.js');
include('../CAM_Emulator.js');

init = function () {

/** @namespace
 * Test script for CAM scan
 * @requires Library: {@link Utilities}, {@link Scan}, {@link Messages},
 * {@link ChannelChange}, {@link Timer}, {@link PressButton},
 * {@link Structures}
 */
ScanCam= {

SCAN_FLOW: "",
SCAN_SOURCES: [],
SOURCES:[],
SCAN_SETTINGS: {},
FRONTENDS: [],
MESSAGES:[],
ERROR:0,
NUMBER_OF_TV_SERVICES: "",
NUMBER_OF_RADIO_SERVICES: "",
SCAN_RESULT: {},
SCAN_STATE_CHECKED: false,
SCAN_MESSAGES_CHECKED: false,
RESULT: true,
END: function() {
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest();
},
/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CamScan
 *
 * @param {string} [exitFunc]
 * Function that should be called at the end
 * with test result = true/false as parameter
 * If exitFunction is not set, test will be
 * finished with result printing.
 *
 * @requires Library: {@link Utilities}
 */
startTest: function (scanFlow,
                     scanSources,
                     scanSets,
                     scanProcess,
                     scanResult,
                     n_TvServices,
                     n_RadioServices,
                     endFunc
                     ) {
    if (typeof(endFunc) == 'function') {
        ScanCam.END = endFunc;
    }

    if ( typeof(scanFlow) != "number" ) {
        Utilities.print("#ERROR: CAM scan flow is not specified. "
                        + "\nTest cannot be executed.");
        jbiz.exit()
    }
    else {
        ScanCam.SCAN_FLOW = scanFlow;
    }

    if ( typeof(scanSources) != "object" ) {
        Utilities.print("#ERROR: Scanned sources is not specified as array"
                        + "\nTest cannot be executed.");
        jbiz.exit()
    }
    else {
        ScanCam.SCAN_SOURCES = scanSources;
//FIXME: QUICK AND DIRTY support of muly fromtend is taken from initial scan, it
//implmented with update of  inital variable, so that is why dublicate of sources
//is created
        scanSources.forEach(function(item){
            ScanCam.SOURCES.push(item)});

 /*       if (ScanCam.SCAN_SOURCES.length == 0) {
            Utilities.print("#ERROR: Scaned sources were not defined "
                            + "correctly.\nTest will be terminated.");
            ScanCam.END();
        }*/

        ScanCam.SCAN_SOURCES.forEach(
            function(item) {
                soursKey = {11:"dvbt", 12: "dvbc", 13: "dvbs"}
                var soursName = soursKey[item]
                if (typeof(scanSets[soursName]) != "object"
                    || Utilities.numberOfElements(scanSets[soursName]) == 0) {
                    Utilities.print("WARN: Scan settings for " + Utilities.getKey(Source, item) + " are "
                                    + "not specified.\nCurrent settings "
                                    + "will be used. Corresponding check "
                                    + "will be omitted.");
                }
                else if (item == 11) {
                     ScanCam.SCAN_SETTINGS[item] = scanSets["dvbt"];
                }
                else if (item == 12) {
                     ScanCam.SCAN_SETTINGS[item] = scanSets["dvbc"];
                }
                else if (item == 13) {
                    if (typeof(scanSets.dvbs.scheme.operatingValue) !== "number") {
                        Utilities.print("WARN: Scheme is not specified.\n"
                                        + "Current value will be used. "
                                        + "Corresponding check will "
                                        + "be omitted.");
                    }
                    else if (typeof(scanSets.dvbs.satelliteSettings) != "object"
                        || Object.keys(scanSets.dvbs.satelliteSettings).length == 0) {
                        Utilities.print("WARN: Satellite settings are not "
                                        + "specified.\nCurrent settings "
                                        + "will be used. Corresponding "
                                        + "check will be omitted.");
                    }
                    ScanCam.SCAN_SETTINGS[item] = scanSets.dvbs;
                }
                else {
                    Utilities.print("WARN: Scan fronted is not defined correctly");
                }
            }
        );
    }

    if ( typeof(scanProcess) == "object" ) {
        if (scanProcess.hasOwnProperty("messages")) {
            if (scanProcess.messages.length > 0){
                ScanCam.MESSAGES = scanProcess.messages;
            }
        }
        else {
            if (scanProcess.length != 0) {
                ScanCam.MESSAGES = scanProcess
            }
        }
        if (scanProcess.hasOwnProperty("errorType")) {
            ScanCam.ERROR = scanProcess.errorType;
        }
    }

    if ((typeof(scanResult) != "object"
         || Object.keys(scanResult).length == 0)
        //DCMflow.IMMEDIATELY (see Enumerators.js)
         && ScanCam.DCM_FLOW == 9
       ) {
        Utilities.print("WARN: Scan results for "
                        +"immediate live DCM verification "
                        + " are not specified.\nCoresponding check "
                        + "will be omitted.");
    }
    else {
        ScanCam.SCAN_RESULT = scanResult;
    }

    if ( typeof(n_TvServices) == "undefined"
         || n_TvServices  === "" ) {
        Utilities.print("WARN: Number of found TV services "
                        + "will NOT be checked.");
        ScanCam.NUMBER_OF_TV_SERVICES = "";
    }
    else {
        ScanCam.NUMBER_OF_TV_SERVICES = n_TvServices;
    }

    if ( typeof(n_RadioServices) == "undefined"
         || n_RadioServices === "" ) {
        Utilities.print("WARN: Number of found Radio services "
                        + "will NOT be checked.");
        ScanCam.NUMBER_OF_RADIO_SERVICES = ""
    }
    else {
        ScanCam.NUMBER_OF_RADIO_SERVICES = n_RadioServices;
    }

    if (typeof(endFunc) == 'function') {
        ScanCam.manager(["CloseUnnecessaryOSDs"]);
    }
    else {
        ScanCam.manager(["Connect"]);
    }
},
/**
* Execute selected type of CAM scan
* @author Anna Klimovskaya aklimovskaya@luxoft.com
* @memberof CamScan
* {@link ChannelChange}, {@link Timer}, {@link PressButton},
* {@link Structures}
*/

manager: function (args) {
    var steps = {
        "Connect" : function() {
            //print test description:
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Verify whether operator profile scan is "
                            + "requested.");
            switch (ScanCam.SCAN_FLOW){
            case 9:
                Utilities.print("3. Select immediate scan and "
                        + "confirm the notification respectively.");
                Utilities.print("4. Verify whether the notification is closed");
                Utilities.print("5. Set required settings");
                Utilities.print("6. Monitor process of a CI scan.");
                Utilities.print("7. All CI scan messages are closed");
                break;
            case 10:
                Utilities.print("3. Select scan before standby and "
                        + "confirm the notification respectively.");
                Utilities.print("4. Ckeck wizard is closed.");
                break;
            case 11:
                Utilities.print("3. Select postponed scan and "
                        + "confirm the notification respectively.");
                Utilities.print("4. Ckeck wizard is closed.");
                break;
            }
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV(function(){
                    ScanCam.manager(["CloseUnnecessaryOSDs"]);
                }, 2000);
            },
        // Check availability of CAM scan notification
        "CloseUnnecessaryOSDs" : function() {
            Messages.closeMessages(
                function() {
                    Utilities.print("CI scan message is displayed. "
                            + "All unnecessary messages are closed.");
                    ScanCam.manager(["ConfirmUpdateMsg"]);
                },
                Message.CA_AUTOSEARCH,
                function() {
                    Utilities.print("#VERIFICATION FAILED: "
                            + "Expected CI scan dialog is not available.");
                    ScanCam.RESULT = false;
                    ScanCam.manager(["EndTest"]);
                },
                function() {
                    ScanCam.RESULT = false;
                    ScanCam.manager(["EndTest"]);
                }
            );
        },
        // Select update flow in notification
        "ConfirmUpdateMsg" : function() {
            Messages.confirmMessage(
                function() {
                    Utilities.print("CI scan dialog was confirmed "
                                    + "successfully.");
                    ScanCam.manager(["CheckClosedDCMdialog"]);
                },
                [ Message.CA_AUTOSEARCH, ScanCam.SCAN_FLOW ],
                function() {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "CI scan dialog was not confirmed.");
                    ScanCam.RESULT = false;
                    ScanCam.manager(["EndTest"]);
                },
                function() {
                    ScanCam.RESULT = false;
                    ScanCam.manager(["EndTest"]);
                }
            );
        },
        // Check that notification is closed
        "CheckClosedDCMdialog" : function() {
            var flows = {
                "9": function() {
                    Utilities.print("Immediate update is selected.")
                    ScanCam.manager(["CheckFrontends", ScanCam.SCAN_SOURCES[0]]);
                },
                "10": function() {
                    Utilities.print("CI scan is postponed to standby.")
                    Utilities.print("#VERIFICATION  OF NEXT STEPS "
                                    + "CURUNTLY IS NOT IMPLEMENTED ")
                    ScanCam.manager(["EndTest"]);
                },
                "11": function() {
                    Utilities.print("#VERIFICATION PASSED:"
                                    + " Update is postponed to next "
                                    +"request.")
                    ScanCam.manager(["EndTest"]);
                }
            };
            var flowSetup = flows[ScanCam.SCAN_FLOW];
            Messages.closeMessages(
                function() {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "CAM scan dialog is still active.");
                    ScanCam.RESULT = false;
                    ScanCam.manager(["EndTest"]);
                },
                Message.CA_AUTOSEARCH,
                flowSetup,
                function() {
                    ScanCam.RESULT = false;
                    ScanCam.manager(["EndTest"]);
                }
            );
        },
        // --------- Immediate scan -----------
        "CheckFrontends" : function(frontend) {
            var frontend = frontend[0];
            if (typeof(frontend) != "undefined") {
                if (frontend == "11") {
                    de.loewe.sl2.i32.channel.search.source
                        .setValue(Source.DVB_T);
                    setTimeout(function(){
                        ScanCam.manager(["SetScanSettings", frontend]);},
                        3000);

                }
                else if (frontend == "12") {
                    de.loewe.sl2.i32.channel.search.source
                        .setValue(Source.DVB_C);
                    setTimeout(function(){
                        ScanCam.manager(["SetScanSettings", frontend]);},
                        3000);
                }
                else if (frontend == "13") {
                    de.loewe.sl2.i32.channel.search.source
                        .setValue(Source.DVB_S);
                    setTimeout(function(){
                        ScanCam.manager(["SetAntennaSettings", frontend]);},
                        3000);
                }
            }
            else {
                ScanCam.manager(["ScanMonitor"]);
            }
        },
        "SetScanSettings" : function(frontend) {
            var frontend = frontend[0];
            Scan.setScanSettings(
                function() {
                    Utilities.print("Scan settings are applied for " + Utilities.getKey(Source, frontend));
                    ScanCam.SCAN_SOURCES.splice(0, 1);
                    ScanCam.manager(["CheckFrontends", ScanCam.SCAN_SOURCES[0]]);
                },
                ScanCam.SCAN_SETTINGS[frontend],
                function() {
                    Utilities.print("#VERIFICATION FAILED: Scan settings "
                                    + "were not applied for " + Utilities.getKey(Source, frontend));
                    ScanCam.manager(["EndTest"])
                }
            );
        },
        "CheckSatellites" : function(frontend) {
            var frontend = frontend[0];
            Scan.checkSettings(
                function() {
                    Utilities.print("Satellite settings for " + Utilities.getKey(Source, frontend)
                                    + " are in the expected state.");
                    ScanCam.SCAN_SOURCES.splice(0, 1);
                    ScanCam.manager(["CheckFrontends", ScanCam.SCAN_SOURCES[0]]);
                },
                ScanCam.SATELLITE_SETTINGS,
                function() {
                    Utilities.print("#VERIFICATION FAILED: Satellite settings "
                                    + "were not set as expected.");
                    ScanCam.manager(["EndTest"]);
                }
            );
        },
        "SetAntennaSettings" : function(frontend) {
            var frontend = frontend[0];
            if (typeof(ScanCam.SCAN_SETTINGS[frontend]) == "object") {
                Antenna.setSatellites(
                    function() {
                        Utilities.print("Antenna settings are applied "
                                        + "successfully.");
                        ScanCam.manager(["SetSatellite", frontend, 0]);
                    },
                    ScanCam.SCAN_SETTINGS[frontend].scheme.operatingValue,
                    ScanCam.SCAN_SETTINGS[frontend].satelliteSettings,
                    function() {
                        Utilities.print("#VERIFICATION FAILED: Antenna settings "
                                        + "were not applied.");
                        ScanCam.manager(["EndTest"]);
                    }
                );
            }
            else {
                ScanCam.SCAN_SOURCES.splice(0, 1);
                ScanCam.manager(["CheckFrontends", ScanCam.SCAN_SOURCES[0]]);
            }

        },
        "SetSatellite" : function(args) {
            var frontend = args[0];
            var satNumber = args[1];
            var satelliteNames = de.loewe.sl2.vstr.channel.search
                                          .satellitenamelist.getValue();
            var satelliteIDs = de.loewe.sl2.vi32.channel.search
                                           .satellitelist.getValue();
            if (satNumber > 3) {
                Utilities.print("Scan settings for all satellites were "
                                + "applied successfully.");
                ScanCam.SCAN_SOURCES.splice(0, 1);
                ScanCam.manager(["CheckFrontends"]);
            }
            else {
                //If the current satellite has expected settings
                if (ScanCam.SCAN_SETTINGS[frontend]
                        .hasOwnProperty("satellite" + (satNumber+1))
                    && Object.keys(ScanCam.SCAN_SETTINGS[frontend][
                        "satellite" + (satNumber+1)]).length != 0) {
                    //Check whether the current satellite is "None"
                    if (satelliteIDs[satNumber] == -1) {
                        Utilities.print("#VERIFICATION FAILED: Satellite #"
                                        + (satNumber+1) + " is 'None' but has "
                                        + "expected scan settings.");
                        ScanCam.manager(["EndTest"]);
                    }
                    else {
                        var currentSatellite = {
                            operatingValue: satelliteNames[satNumber]
                        };
                        Utilities.print("Set scan parameters for satellite #"
                                        + (satNumber+1) + " "
                                        + satelliteNames[satNumber]);
                        Antenna.setSatelliteForScan(
                            function() {
                                Utilities.print("The scan satellite is set "
                                                + "successfully.");
                                ScanCam.manager(["SetScanSettingsDVBS",
                                                        frontend, satNumber]);
                            },
                            currentSatellite,
                            function() {
                                Utilities.print("#VERIFICATION FAILED: Satellite"
                                                + " for scan was not set.");
                                ScanCam.manager(["EndTest"])
                            }
                        );
                    }
                }
                else {
                    ScanCam.manager(["SetSatellite", frontend,
                        (satNumber+1)]);
                }
            }
        },
        "SetScanSettingsDVBS" : function(args) {
            var frontend = args[0];
            var satNumber = args[1];
            Scan.setScanSettings(
                function() {
                    Utilities.print("Scan settings for satellite #"
                                    + (satNumber+1)
                                    + " are applied successfully.");
                    ScanCam.manager(["SetSatellite", frontend,
                                            (satNumber+1)]);
                },
                ScanCam.SCAN_SETTINGS[frontend][
                    "satellite" + (satNumber+1)],
                function() {
                    Utilities.print("#VERIFICATION FAILED: Scan settings "
                                    + "for satellite #" + (satNumber+1)
                                    + " were not applied.");
                    ScanCam.manager(["EndTest"])
                }
            );
       },
        // Monitor scan process
        "ScanMonitor" : function() {
            window.setTimeout(function(){
                    CAM.camScanHandler(
                    function(result){
                        ScanCam.SCAN_MESSAGES_CHECKED=true;
                        ScanCam.manager(["WaitEndOfScan"])
                    },
                    ScanCam.SOURCES,
                    ScanCam.MESSAGES,
                    function(){
                        ScanCam.RESULT = false;
                        ScanCam.SCAN_MESSAGES_CHECKED=true;
                        ScanCam.manager(["WaitEndOfScan"]);
                    })}, 1000);
            Scan.liveDcmMonitor(
                function() {
                    Utilities.print("#VERIFICATION PASSED: "
                        + "Scan state is verified succesfuly.");
                    ScanCam.SCAN_STATE_CHECKED=true;
                    ScanCam.manager(["WaitEndOfScan"])
                },
                ScanCam.NUMBER_OF_TV_SERVICES,
                ScanCam.NUMBER_OF_RADIO_SERVICES,
                ScanCam.SCAN_RESULT,
                "4",
                function() {
                    ScanCam.SCAN_STATE_CHECKED=true;
                    Utilities.print("#VERIFICATION FAILED: "
                        + "CAM Scan was not performed successfully.");
                    ScanCam.RESULT = false;
                    ScanCam.manager(["WaitEndOfScan"])
                },
                function() {
                    ScanCam.manager(["EndTest"]);
                }
            )
        },
        "WaitEndOfScan" : function() {
            if (ScanCam.MESSAGES.length > 0) {
                if (ScanCam.SCAN_MESSAGES_CHECKED && ScanCam.SCAN_STATE_CHECKED) {
                    ScanCam.manager(["PrepareEndCheck"])
                }
            }
            else {
                if (ScanCam.SCAN_STATE_CHECKED) {
                    ScanCam.manager(["PrepareEndCheck"])
                }
            }
        },
        "PrepareEndCheck" : function() {
            Utilities.print("Close all displayed messages to check that CAM scan is finished.");
            Messages.closeMessages(
                function() {
                    ScanCam.manager(["EndCheck"]);
                },
                Message.NO_MESSAGE
            );
        },
        "EndCheck" : function() {
            Utilities.print("Finish scan.");
            PressButton.singlePress(Key.END);
            window.setTimeout(function(){
                var scanState = de.loewe.sl2.tvapi.i32.channel.search.search.state.getValue();
                var camScanState = de.loewe.sl2.tvapi.i32.channel.search.cam.scan.state.getValue();
                if (scanState == 0) {
                    Utilities.print("#VERIFICATION PASSED: CAM scan wizard is closed");
                    if (scanState == 0) {
                        Utilities.print("#VERIFICATION PASSED: No CAM scan is requested");
                    }
                    else {
                        var states ={ 1:"wait", 2: "ready", 3: "finished"}
                        Utilities.print("#VERIFICATION FAILED: CI scan is in '"
                                        + states[current] + "' state.");
                        Utilities.print("INFO: The following logic is implemented for the CAM scan state"
                            + ", which has a misleading name:")
                        Utilities.print("- It is reset to WAITING once the initial installation is started.")
                        Utilities.print("- It is set to READY if at least one CAM requested an operator"
                            + "profile scan, and it is known from all the CAMs whether or not they support"
                            + " an operator profile scan or a timeout has elapsed.")
                        Utilities.print("- It is set to FINISHED if none of the CAMs requested an operator"
                            + "profile scan, and it is known from all the CAMs whether or not they support"
                            + " an operator profile scan or a timeout has elapsed.")
                        Utilities.print("The value is of no significance after the initial installation"
                            + "wizard has stepped over the point where it displays the screen that it is"
                            + " waiting for the CAM.");
                    }
                    if (ScanCam.ERROR != 0) {
                        Utilities.print("#VERIFICATION FAILED: Scan Error is not displayed.");
                    }
                    ScanCam.manager(["EndTest"])
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: CAM scan wizard is NOT closed");
                    Utilities.print("#VERIFICATION FAILED: Current state: "
                            + Utilities.getKey(SearchState, scanState));
                    Utilities.print("INFO: One more attempt to finish scan");
                    ScanCam.RESULT = false;
                    ScanCam.manager(["PrepareEndCheck"])
                }

            },2000)
        },
        // Finalize test
        "EndTest" : function() {
            ScanCam.END(ScanCam.RESULT);
        }
    }
    steps[args[0]](args.slice(1));
}

}

}
