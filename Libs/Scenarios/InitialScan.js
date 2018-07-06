include('../Utilities.js');
include('../Scan.js');
include('../Languages.js');
include('../ParentalControl.js');
include('../Antenna.js');
include('../Structures.js');
include('../CAM_Emulator.js');

init = function() {

/** @namespace
* Test script for Initial scan with PIN settings verification/update
* @requires Library: {@link Utilities}, {@link Scan}, {@link Languages},
* {@link ParentalControl}, {@link Antenna}, {@link Structures}
*/
InitialScan = {

TV_SETTINGS: {},
SCAN_SETTINGS: {},
LANG_SETTINGS: {},
CAM_MESSAGES: [],
PIN_SETTINGS: {},
OPERATOR: {},
FRONTENDS: [],
SCAN_RESULT: {},
NUMBER_OF_TV_SERVICES: "",
NUMBER_OF_RADIO_SERVICES: "",
M7FLAG: {},
TEST_RESULT: true,
END: function() {
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest();
},

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @author Stanislav Chichagov schichagov@luxoft.com
 * @memberof InitialScan
 *
 * @param {object} [tvSets = {}]
 * Array of TV settings that should be set or checked during test execution.
 * No settings will be set and checked if parameter is omitted or empty.
 * List of available settings (any setting can be omitted):
 * <br/>- location, see {@link Location} for available values;
 * <br/>- connected cables -- an array [0,1,0,0,0] or [0,1,0,0,0,0] equal to
 * corresponding screen of initial scan wizard. <br/>
 * Settings can have a mark for initial value verification.
 * See template InitialScan.html for more details.
 *
 * @param {object} [operators = {}]
 * Operator IDs for used frontends that should be set for test execution. Is set
 * via keys "analog", "dvbt", "dvbc", "dvbs", "dvbs", "iptv" that correspond
 * with tvSets.connectedCables [0,1,0,0,0,0] array.
 * ATTENTION! operators will be used only if tvSets.connectedCables is present.
 * Before setting the operator the test script will check if it is available for
 * required frontend. Test will be terminated if the setting is invalid.
 *
 * @param {object} [scanSets = {}]
 * Array of scan settings that should be set or checked during test execution.
 * Is set via keys "analog", "dvbt", "dvbc", "dvbs", "", "iptv" that
 * correspond with tvSets.connectedCables [0,1,0,0,0,0] array.
 * No settings will be set and checked if parameter is omitted or empty.
 * List of available settings (any setting can be omitted):
 * <br/>- scramblingSelectable: selectability of searching scrambled services,
 * <br/>- searchScrambled: searching scrambled services,
 * <br/>- lcnSelectable: selectability of ordering by LCN,
 * <br/>- lcnAccepted: sorting services by LCN,
 * <br/>- searchingMethodSelectable: selectability of searching method,
 * <br/>- searchMethod: searching method,
 * <br/>- networkidSelectable: selectability of network id,
 * <br/>- networkid: network id,
 * <br/>- networkidNoneSelectable: selectability of NONE network id,
 * <br/>- networkidNone: NONE network id,
 * <br/>- modulationSelectable: selectability of QAM,
 * <br/>- modulation: modulation,
 * <br/>- frequencySelectable: selectability of start frequency,
 * <br/>- frequency: start frequency,
 * <br/>- symbolrateSelectable: selectability of symbolrate,
 * <br/>- symbolrate: symbolrate,
 * <br/>- voltage: voltage,
 * <br/>- hdPreferredSelectable: selectability of HD preference,
 * <br/>- hdPreferred: HD preferred,
 * <br/>- allScanSatellites: satellites available for the scan,
 * <br/>- currentScanSatellite: satellite selected for the scan,
 * <br/>- m7group: M7Group network rules applied. <br/>
 * Any setting can have a mark for initial value verification.
 * For the DVB-S format for scan settings is "scanSets.dvbs.sattelite1", for
 * DVB-C/T format is "scanSets.dvbt".
 * See template InitialScan.html for more details.
 *
 * @param {object} [pinSets = {}]
 * Array of parental control settings that should be set or checked during test
 * execution.
 * No settings will be set and checked if parameter is omitted or empty.
 * List of available settings (any setting can be omitted):
 * <br/>- PIN_initialModificationAllowed: availability of modification of
 * parental control settings at initial installation,
 * <br/>- PIN_initialPinDefinitionAllowed: availability of PIN setup
 * at initial installation,
 * <br/>- PIN_deactivationAllowed: availability of PIN deactivation,
 * <br/>- PIN_resetAllowed: availability of PIN reset,
 * <br/>- PIN_ageRelatedLockActive: age-related parental lock,
 * <br/>- PIN_ageRelatedLockLevel: level of age-related parental lock
 * (in years),
 * <br/>- PIN_ageRelatedLockDisengageable: availability of age-related lock
 * cancellation
 * <br/>- PIN_ageRelatedAlwaysExist: availability of always blocking
 * age-related lock,
 * <br/>- PIN_code: parental control code.<br/>
 * Any setting can have a mark for initial value verification.
 * See template InitialScan.html for more details.
 *
 * @param {number} [n_TvServices=""]
 * Number of TV services expected to be found during scan.
 * Value will not be checked if parameter is omitted or empty.
 *
 * @param {number} [n_RadioServices=""]
 * Number of Radio services expected to be found during scan.
 * Value will not be checked if parameter is omitted or empty.
 *
 * @param {object} [scanResult]
 * Array containing scan states and required actions, for example, LCN conflict
 * and required swap for Mediaset. Script will check that not expected states
 * were not observed during test execution.
 * See template InitialScan.html for more details.
 *
 * @param {function} [exitFunc]
 * Function that should be called at the end.
 * If parameter is not set, test will be finished with result printing.
 *
 * @example
 * Structure of settings
 * var tvSets = {
 *     languageOSD: {
 *         operatingValue: Language.ENGLISH,
 *     },
 *     location: {
 *         operatingValue: Location.GERMANY,
 *     },
 *     connectedCables: {
 *         operatingValue: [0,0,1,0,0]
 *     }
 * };
 * Structure of scanResult
 * var expectedScanResult = {
 *     lcnConflict: {
 *         serviceList:[
 *             [ 'Serv1', '1', '1', '60000', '2000', '4', '1', '1' ],
 *             [ 'Serv2', '850', '2', '60000', '2000', '4', '1', '1' ]
 *         ],
 *         executeSwap:[
 *             {type:MediaType.TV, chanNumbers:[1, 850]}
 *         ]
 *     },
 *     regionSelection: {
 *         listOfRegions:["None","England"],
 *         selectRegion:"England"
 *     }
 * };
 * @requires Library: {@link Utilities}
 */
startTest: function (tvSets,
                     operators,
                     scanSets,
                     pinSets,
                     n_TvServices,
                     n_RadioServices,
                     scanResult,
                     exitFunc) {

    if (typeof(tvSets) == "undefined"
        || tvSets == ""
        || Object.keys(tvSets).length == 0) {
        Utilities.print("WARN: Scan will be executed with current TV settings "
                        + "and without verification of them.");
    }
    else if (tvSets.hasOwnProperty("connectedCables") == false
            || (tvSets.connectedCables.hasOwnProperty("operatingValue") == false
                && tvSets.connectedCables
                        .hasOwnProperty("initialValue") == false)) {
        Utilities.print("WARN: Connected cables were not defined correctly. "
                        + "Scan will be executed with current TV settings "
                        + "and without verification of them.");
    }
    else {
        var cableKey = "operatingValue";
        if (tvSets.connectedCables.hasOwnProperty("operatingValue") == false) {
            cableKey = "initialValue";
        }
        if (tvSets.connectedCables[cableKey][0] == 1) {
            Utilities.print("WARN: Analog scan is not implemented and will be "
                            + "skipped");
            tvSets.connectedCables[cableKey][0] = 0;
        }
        if (tvSets.connectedCables[cableKey][6] == 1) {
            Utilities.print("WARN: Multiroom scan is not implemented and will be "
                            + "skipped");
            tvSets.connectedCables[cableKey][6] = 0;
        }
        InitialScan.TV_SETTINGS = tvSets;
        var cableKeys = ["analog", "dvbt", "dvbc", "dvbs", "dvbs", "iptv", "multiroom","satIP"];
        for (var i = 1; i < tvSets.connectedCables[cableKey].length; i++) {
            if (tvSets.connectedCables[cableKey][i] == 1 && i != 4) {
                InitialScan.FRONTENDS.push(cableKeys[i]);
            }
        }
        if (InitialScan.FRONTENDS.length == 0) {
            Utilities.print("#ERROR: Connected cables were not defined "
                            + "correctly.\nTest will be terminated.");
            InitialScan.END();
        }

        InitialScan.FRONTENDS.forEach(
            function(item) {
                if (typeof(operators[item]) != "number") {
                    Utilities.print("WARN: Operator will NOT be set and "
                                    + "checked for " + item);
                    InitialScan.OPERATOR[item] = "DNC";
                }
                else {
                    InitialScan.OPERATOR[item] = operators[item];
                }

                if (typeof(scanSets[item]) != "object"
                    || Object.keys(scanSets[item]).length == 0) {
                    Utilities.print("WARN: Scan settings for " + item + " are "
                                    + "not specified.\nCurrent settings "
                                    + "will be used. Corresponding check "
                                    + "will be omitted.");
                }
                else if (item == "dvbt" || item == "dvbc") {
                    InitialScan.SCAN_SETTINGS[item] = scanSets[item];
                }
                else if (item == "dvbs") {
                    InitialScan.SCAN_SETTINGS[item] = scanSets[item];
                    if (typeof(scanSets[item].scheme.operatingValue) !== "number") {
                        Utilities.print("WARN: Scheme is not specified.\n"
                                        + "Current value will be used. "
                                        + "Corresponding check will "
                                        + "be omitted.");
                    }
                    if (typeof(scanSets[item].satelliteSettings) != "object"
                            || Object.keys(scanSets[item]
                                .satelliteSettings).length == 0) {
                        Utilities.print("WARN: Satellite settings are not "
                                        + "specified.\nCurrent settings "
                                        + "will be used. Corresponding "
                                        + "check will be omitted.");
                    }
                    if (typeof(scanSets[item]["satellite1"]) == "object"
                        && ("m7group" in scanSets[item]["satellite1"])) {
                        InitialScan.M7FLAG[item] = true;
                    }
                }
                else {
                    Utilities.print("WARN: Scan for IP-TV is not implemented");
                }
            }
        );
// function to cut language settings from scan settings
// because language settings are set at the end before scan
        var langSettings = ["languageSubtitleFavoured",
                            "languageSubtitleAlternative",
                            "languageAudioFavoured",
                            "languageAudioAlternative"];
        // Filter off language settings
        langSettings.forEach(
            function(lang) {
                InitialScan.FRONTENDS.forEach(
                    function(item) {
                        if (typeof(scanSets[item]) == "object"
                            && (lang in scanSets[item])) {
                            if (typeof(InitialScan
                                    .LANG_SETTINGS[lang]) == "undefined") {
                                InitialScan.LANG_SETTINGS[lang] =
                                    InitialScan.SCAN_SETTINGS[item][lang];
                            }
                            delete InitialScan.SCAN_SETTINGS[item][lang];
                        }
                        else if (typeof(scanSets[item]) == "object") {
                            for (var i = 1; i < 5; i++) {
                                if (typeof(scanSets[item][
                                        ("satellite" + i)]) == "object"
                                    && (lang in scanSets[item][
                                        ("satellite" + i)])) {
                                    if (typeof(InitialScan
                                        .LANG_SETTINGS[lang]) == "undefined") {
                                        InitialScan.LANG_SETTINGS[lang] =
                                            InitialScan.SCAN_SETTINGS[item][
                                            ("satellite" + i)][lang];
                                    }
                                    delete InitialScan.SCAN_SETTINGS[item][
                                            ("satellite" + i)][lang];
                                }
                            }
                        }
                    }
                );
            }
        );

        if (typeof(pinSets) != "object" || Object.keys(pinSets).length == 0 ) {
            Utilities.print("WARN: Parental control settings are not specified."
                            + "\nCurrent settings will be used. "
                            + "Corresponding check will be omitted.");
        }
        else {
            InitialScan.PIN_SETTINGS = pinSets;
        }

    }

        if (typeof(n_TvServices) == "undefined" || n_TvServices  === "" ) {
            Utilities.print("WARN: Number of found TV services "
                            + "will NOT be checked.");
        }
        else {
            InitialScan.NUMBER_OF_TV_SERVICES = n_TvServices;
        }
        if (typeof(n_RadioServices) == "undefined" || n_RadioServices === "" ) {
            Utilities.print("WARN: Number of found Radio services "
                            + "will NOT be checked.");
        }
        else {
            InitialScan.NUMBER_OF_RADIO_SERVICES = n_RadioServices;
        }

    if (typeof(scanResult) != "object"
        || Object.keys(scanResult).length == 0) {
        Utilities.print("WARN: Scan results are not specified.\nCorresponding "
                        + "check will be omitted.");
    }
    else {
        InitialScan.SCAN_RESULT = scanResult;
        if (InitialScan.SCAN_RESULT.hasOwnProperty("scanProcess")) {
            InitialScan.CAM_MESSAGES = InitialScan.SCAN_RESULT.scanProcess;
        }
    }

    if (typeof(exitFunc) == "function") {
        InitialScan.END = exitFunc;
        InitialScan.manager(["Precheck"]);
    }
    else {
        InitialScan.manager(["Connect"]);
    }
},

/**
 * Executor of scan with test environment setup and scan result verification.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @author Stanislav Chichagov schichagov@luxoft.com
 * @memberof InitialScan
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            //print test description:
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV");
            Utilities.print("2. Wait if scan is currently running");
            Utilities.print("3. Set TV and scan settings");
            Utilities.print("   (test will be terminated if one of required"
                            + " settings can't be set)");
            Utilities.print("4. Remove existing service list");
            Utilities.print("5. Start scan and monitor the process");
            Utilities.print("6. Verify there is no unexpected scan states");
            Utilities.print("   (LCN conflict, New found, Non found services)");
            Utilities.print("7. Check number of found TV and Radio services");
            Utilities.print("8. Set parental control related settings");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV(function(){
                InitialScan.manager(["Precheck"]);
            }, 2000);
        },
        "Precheck" : function() {
            Utilities.print("Checking if any CAM scan is active...");
            CAM.waitCamScanFinish(
                function(){
                    InitialScan.manager(["Precheck2"]);
                } )
        },
        "Precheck2" : function() {
            Utilities.print("Checking if any general scan is active...");
            Scan.waitScanFinish(
                function(){
                    InitialScan.manager(["ActivateScanWizard"]);
                }
            );
        },
        "ActivateScanWizard" : function() {
            Scan.activateInitialScanWizard(
                function() {
                    Utilities.print("Initial scan wizard is open...");
                    if (Object.keys(InitialScan.TV_SETTINGS).length == 0) {
                        InitialScan.manager(["RemoveServiceList"]);
                    }
                    else {
                        InitialScan.manager(["SetTVSettings"]);
                    }
                }
            );
        },
        "SetTVSettings" : function() {
            Scan.setTVSettings(
                function() {
//set general TV scan (not CAM) if this value is not set in test data
//it is workaround to execute old test if CAM is inserted
                    if (!InitialScan.TV_SETTINGS.hasOwnProperty("scanMethod")) {
                            de.loewe.sl2.tvapi.i32.channel.
                                            search.scan.method.setValue(1);
                        }
                    Utilities.print("TV settings are applied successfully.");
                    InitialScan.manager(["CheckFrontends",
                                            InitialScan.FRONTENDS[0]]);
                },
                InitialScan.TV_SETTINGS,
                function() {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "TV settings were not applied.");
                    InitialScan.manager(["EndTest"])
                }
            );
        },
        "CheckFrontends" : function(frontend) {
            var frontend = frontend[0];
            if (typeof(frontend) != "undefined") {
                if (frontend == "dvbt") {
                    de.loewe.sl2.i32.channel.search.source
                        .setValue(Source.DVB_T);
                }
                else if (frontend == "dvbc") {
                    de.loewe.sl2.i32.channel.search.source
                        .setValue(Source.DVB_C);
                }
                else if (frontend == "dvbs") {
                    de.loewe.sl2.i32.channel.search.source
                        .setValue(Source.DVB_S);
                }
                setTimeout(function(){
                    InitialScan.manager(["SetOperator", frontend]);
                    }, 3000);
            }
            else {
                InitialScan.manager(["RemoveServiceList"]);
            }
        },
        "SetOperator" : function(frontend) {
            var scanMethod = de.loewe.sl2.tvapi.i32.channel.search.scan.method.getValue();
            if (scanMethod == 1 || scanMethod == 3){
                var frontend = frontend[0];
                // general scan (no CAM)
                function exitFunction(frontend) {
                    if (frontend == "dvbt" || frontend == "dvbc") {
                        InitialScan.manager(["SetScanSettings", frontend]);
                    }
                    else if (frontend == "dvbs") {
                        if (Object.keys(InitialScan.M7FLAG).length != 0
                            && InitialScan.M7FLAG[frontend] == true) {
                            InitialScan.manager(["CheckSatellites", frontend]);
                        }
                        else {
                            InitialScan.manager(["SetAntennaSettings", frontend]);
                        }
                    }
                    else {
                        Utilities.print("WARN: Scan for IP-TV is not implemented");
                        InitialScan.FRONTENDS.splice(0, 1);
                        InitialScan.manager(["CheckFrontends"]);
                    }
                }
                if (InitialScan.OPERATOR[frontend] !== "DNC") {
                    Scan.setOperator(
                        function() {
                            Utilities.print("Operator is set for " + frontend);
                            setTimeout(function() {
                                exitFunction(frontend);
                            }, 5000);
                        },
                        // Use current value of frontend
                        "",
                        InitialScan.OPERATOR[frontend],
                        "",
                        function() {
                            Utilities.print("#VERIFICATION FAILED: Operator "
                                            + "was not set for " + frontend);
                            InitialScan.manager(["EndTest"]);
                        }
                    );
                }
                else {
                    InitialScan.FRONTENDS.splice(0, 1);
                    InitialScan.manager(["CheckFrontends",
                                            InitialScan.FRONTENDS[0]]);
                }
            }
            else if (scanMethod == 2) {
                InitialScan.manager(["SetAntennaSettings", frontend]);
            }
            else {
                Utilities.print("Error: Unsupported scan method." );
                Utilities.print("Test will be terminated" );
                InitialScan.manager(["EndTest"]);
            }
        },
        "SetScanSettings" : function(frontend) {
            var frontend = frontend[0];
            Scan.setScanSettings(
                function() {
                    Utilities.print("Scan settings are applied for "
                                    + frontend);
                    InitialScan.FRONTENDS.splice(0, 1);
                    InitialScan.manager(["CheckFrontends",
                                            InitialScan.FRONTENDS[0]]);
                },
                InitialScan.SCAN_SETTINGS[frontend],
                function() {
                    Utilities.print("#VERIFICATION FAILED: Scan settings "
                                    + "were not applied for " + frontend);
                    InitialScan.manager(["EndTest"])
                }
            );
        },
        "CheckSatellites" : function(frontend) {
            var frontend = frontend[0];
            Scan.checkSettings(
                function() {
                    Utilities.print("Satellite settings for " + frontend
                                    + " are in the expected state.");
                    InitialScan.FRONTENDS.splice(0, 1);
                    InitialScan.manager(["CheckFrontends",
                                             InitialScan.FRONTENDS[0]]);
                },
                InitialScan.SATELLITE_SETTINGS,
                function() {
                    Utilities.print("#VERIFICATION FAILED: Satellite settings "
                                    + "were not set as expected.");
                    InitialScan.manager(["EndTest"]);
                }
            );
        },
        "SetAntennaSettings" : function(frontend) {
            var frontend = frontend[0];
            if (typeof(InitialScan.SCAN_SETTINGS[frontend]) == "object") {
                Antenna.setSatellites(
                    function() {
                        Utilities.print("Antenna settings are applied "
                                        + "successfully.");
                        InitialScan.manager(["SetSatellite", frontend, 0]);
                    },
                    InitialScan.SCAN_SETTINGS[frontend].scheme.operatingValue,
                    InitialScan.SCAN_SETTINGS[frontend].satelliteSettings,
                    function() {
                        Utilities.print("#VERIFICATION FAILED: Antenna settings "
                                        + "were not applied.");
                        InitialScan.manager(["EndTest"]);
                    }
                );
            }
            else {
                InitialScan.FRONTENDS.splice(0, 1);
                InitialScan.manager(["CheckFrontends",
                                         InitialScan.FRONTENDS[0]]);
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
                InitialScan.FRONTENDS.splice(0, 1);
                InitialScan.manager(["CheckFrontends"]);
            }
            else {
                //If the current satellite has expected settings
                if (InitialScan.SCAN_SETTINGS[frontend]
                        .hasOwnProperty("satellite" + (satNumber+1))
                    && Object.keys(InitialScan.SCAN_SETTINGS[frontend][
                        "satellite" + (satNumber+1)]).length != 0) {
                    //Check whether the current satellite is "None"
                    if (satelliteIDs[satNumber] == -1) {
                        Utilities.print("#VERIFICATION FAILED: Satellite #"
                                        + (satNumber+1) + " is 'None' but has "
                                        + "expected scan settings.");
                        InitialScan.manager(["EndTest"]);
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
                                InitialScan.manager(["SetScanSettingsDVBS",
                                                        frontend, satNumber]);
                            },
                            currentSatellite,
                            function() {
                                Utilities.print("#VERIFICATION FAILED: Satellite"
                                                + " for scan was not set.");
                                InitialScan.manager(["EndTest"])
                            }
                        );
                    }
                }
                else {
                    InitialScan.manager(["SetSatellite", frontend,
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
                    InitialScan.manager(["SetSatellite", frontend,
                                            (satNumber+1)]);
                },
                InitialScan.SCAN_SETTINGS[frontend][
                    "satellite" + (satNumber+1)],
                function() {
                    Utilities.print("#VERIFICATION FAILED: Scan settings "
                                    + "for satellite #" + (satNumber+1)
                                    + " were not applied.");
                    InitialScan.manager(["EndTest"])
                }
            );
       },
        "RemoveServiceList" : function() {
            ServiceList.removeServiceList(function() {
                Utilities.print("Service list was processed.");
                InitialScan.manager(["Scan"]);
            });
        },
        "Scan" : function() {
            var scanMethod = de.loewe.sl2.tvapi.i32.channel.
                search.scan.method.getValue();

            if (scanMethod == 3 || scanMethod == 2) {
                if (CAM.isCamAvailable) {
                    Utilities.print("#VERIFICATION PASSED: CAM is available.");
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "CAM doesn't support operator profile,"
                                    + "scan can't be exeuted.");
                }
            }
            CAM.camInitialScanHandler(
                function(result){
                    function check (){
                        InitialScan.manager(["CheckNumberTVServices"])
                    }
                    window.setTimeout(check, 2000)},
                InitialScan.CAM_MESSAGES,
                function (){
                    Scan.startInitialScanMonitor(
                    function() {
                        Utilities.print("#VERIFICATION PASSED: "
                                        + "Scan process finished succesfully.");
                        InitialScan.manager(["CheckNumberTVServices"]);
                    },
                    InitialScan.SCAN_RESULT,
                    function() {
                        Utilities.print("#VERIFICATION FAILED: "
                                        + "Scan process was not performed "
                                        + "as expected.");
                        InitialScan.manager(["EndTest"]);
                    }
                );
                    },
                function(){
                    InitialScan = false;
                    function check (){
                        InitialScan.manager(["CheckNumberTVServices"])
                    };
                    window.setTimeout(check, 2000)
                }
            )
        },
        "CheckNumberTVServices" : function() {
            if (InitialScan.NUMBER_OF_TV_SERVICES !== ""
                && !Scan.checkNumberOfTVServices(InitialScan.NUMBER_OF_TV_SERVICES)) {
                Utilities.print("#VERIFICATION FAILED: "
                                + "Number of TV services is not equal to "
                                + "expected.");
                InitialScan.TEST_RESULT = false;
            }
            InitialScan.manager(["CheckNumberRadioServices"])
        },
        "CheckNumberRadioServices" : function() {
            if (InitialScan.NUMBER_OF_RADIO_SERVICES !== ""
                && !Scan.checkNumberOfRadioServices(InitialScan.NUMBER_OF_RADIO_SERVICES)) {
                Utilities.print("#VERIFICATION FAILED: "
                                + "Number of Radio services is not equal to "
                                + "expected.");
                InitialScan.TEST_RESULT = false;
            }
            InitialScan.manager(["SetPINSettings"]);
        },
        "SetPINSettings" : function() {
            //Delete timeout when API for the checking of the end of initial
            //installation will be implemented. See HL1-5451
            setTimeout(
                function(){
                    Scan.setPINSettings(
                        function() {
                            Utilities.print("Post scan settings are applied "
                                            + "successfully.");
                            if (Object.keys(InitialScan.M7FLAG).length != 0) {
                                InitialScan.manager(["CheckScanSettings"]);
                            }
                            else {
                                InitialScan.manager(["EndTest"]);
                            }
                        },
                        InitialScan.PIN_SETTINGS,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: Post scan settings "
                                            + "were not applied.");
                            InitialScan.manager(["EndTest"]);
                        }
                    );
                },
                4000
            );
        },
        "CheckScanSettings" : function() {
            var M7frontend = Object.keys(InitialScan.M7FLAG);

            Scan.checkSettings(
                function() {
                    Utilities.print("Scan settings are in the "
                                    + "expected state.");
                    InitialScan.manager(["CheckOperator", M7frontend[0]]);
                },
                InitialScan.SCAN_SETTINGS[M7frontend[0]]["satellite1"],
                function() {
                    Utilities.print("#VERIFICATION FAILED: Scan settings were "
                                    + "not applied as expected.");
                    InitialScan.TEST_RESULT = false;
                    InitialScan.manager(["CheckOperator", M7frontend[0]]);
                }
            );
        },
        "CheckOperator" : function(M7frontend) {
            var M7frontend = M7frontend[0];
            var curOp = de.loewe.sl2.i32.channel.search
                            .selected.network.id.getValue()
            if (curOp != InitialScan.OPERATOR[M7frontend]){
                Utilities.print("#VERIFICATION FAILED: Operator is set to "
                                + curOp + " (expected "
                                + InitialScan.OPERATOR[M7frontend] + ").");
                InitialScan.manager(["EndTest"]);
            }
            else {
                Utilities.print("#VERIFICATION PASSED: Operator is set to "
                                + curOp + ".");
                InitialScan.manager(["EndTest"]);
            }
        },
        "EndTest" : function() {
            Scan.deactivateInitialScanWizard(function(){
                InitialScan.END(InitialScan.TEST_RESULT);
            });
        },
    }
    steps[args[0]](args.slice(1));
}
}
}
