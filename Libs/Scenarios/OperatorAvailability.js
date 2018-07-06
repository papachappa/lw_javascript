include('../Utilities.js');
include('../Scan.js');
include('../Antenna.js');

init = function () {

/** @namespace
* Test script to check operator availability
* ATTENTION! Enumerators should be included to test html
* to have a prity printing
* @requires Library: {@link Utilities}, {@link Scan}, {@link Enumerators},
* {@link OperatorAvailability},
*/
OperatorAvailability = {

OPERATOR: "",
OPERATOR_NAME: "",
VALID_SETTINGS: [],
INVALID_SETTINGS: [],
NETWORK_RULES: {},
CUR_LOC: "undefined",
CUR_FE: "undefined",
CUR_SAT: "undefined",
TEST_RESULT: true,
END: function(){
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
    },

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof OperatorAvailability
 *
 * @param {number} operatorID = ""
 * Operator ID that should be checked.
 *
 * @param {object} invalidTvSettings = {}
 * Array of invalid TV settings that should be checked for tested operator
 * List of available settings (any setting can be omitted):
 * <br/>- location, see {@link Location} for available values;
 * <br/>- frontend, see {@link Source} for available values;
 * Settings should be set via operatingValue
 * See template OperatorAvailability.html for more details.
 *
 * @param {object} tvSets = {}
 * Array of valid TV settings that should be checked for tested operator
 * List of available settings (any setting can be omitted):
 * <br/>- location, see {@link Location} for available values;
 * <br/>- frontend, see {@link Source} for available values;
 * Settings should be set via operatingValue
 * See template OperatorAvailability.html for more details.
 *
 * @param {object} checkSets = {}
 * Array of settings that should be checked for tested operator
 * See Scan.settingsHandler for all available settings.
 * For each valid TV settings list of checked settings can be
 * determinate seperatly or one the same list for all settings.
 * See template OperatorAvailability.html for more details.
 *
 * @param {string} [exitFunc]
 * Function that should be called at the end.
 * If parameter is not set, test will be finished with result printing.
 *
 * @requires Library: {@link Utilities}, {@link Enemerators}, {@link Scan}
 */
startTest: function (operatorID,
                     invalidTvSettings,
                     tvSets,
                     checkSets,
                     exitFunc) {

    if ( typeof(exitFunc) == "function") {
        OperatorAvailability.END = exitFunc;
    }
    if ( typeof(operatorID) === "undefined"
         || operatorID === "" ) {
        Utilities.print("#ERROR: Verified operator is not specified."
                        +" Test will not be executed");
        OperatorAvailability.END(false);
    }
    else {
        OperatorAvailability.OPERATOR = operatorID;
        OperatorAvailability.OPERATOR_NAME = Utilities.getKey(Operator,
                                                            operatorID)
    }

    if ( typeof(tvSets) == "undefined"
         || tvSets == ""
         || Object.keys(tvSets).length == 0 ) {

        Utilities.print("WARN: Valid TV settings will not be checked, as far "
                + "as they are not specified in input parameters"
                + " and no settings verification.");
        OperatorAvailability.VALID_SETTINGS = {};
    }
    else {
        OperatorAvailability.VALID_SETTINGS = tvSets;
    }


    if ( typeof(checkSets) == "undefined"
         || tvSets == ""
         || Object.keys(checkSets).length == 0) {
        Utilities.print("WARN: Network settings are not specified."
                        + " Network rules will not be checked.");
        OperatorAvailability.NETWORK_RULES = {};
    }
    else if (Object.keys(checkSets).length == 1){
        Utilities.print("INFO: The same network rules will be checked for "
                        + "all valid TV settings");
        OperatorAvailability.NETWORK_RULES = checkSets;
    }
    else if (Object.keys(checkSets).length == Object.keys(tvSets).length) {
        OperatorAvailability.NETWORK_RULES = checkSets;
        }
    else {
        Utilities.print("#ERROR: Number of settings with network rules does "
                        + "not correspond number of valid settings.");
        OperatorAvailability.END(false);
    }


    if ( typeof(invalidTvSettings) == "undefined"
         || invalidTvSettings == ""
         || Object.keys(invalidTvSettings).length == 0 ) {

        Utilities.print("WARN: Invalid settings will not be checked, as far "
                + "as they are not specified in input parameters"
                + " and no settings verification.");
        OperatorAvailability.INVALID_SETTINGS = {};
    }
    else {
        OperatorAvailability.INVALID_SETTINGS = invalidTvSettings;
    }

    if ( typeof(exitFunc) == "function") {
        OperatorAvailability.manager(["ActivateScanWizard"]);
    }
    else {
        OperatorAvailability.manager(["Connect"]);
    }
},

/**
 * Executor operator availability test.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof OperatorAvailability
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Set invalid location and valid frontend");
            Utilities.print("3. Verify requested operator "
                            + "is not available for current settings.");
            Utilities.print("4. Go through list of invalid settings.");
            Utilities.print("5. Set valid settings.");
            Utilities.print("6. Check that required operator is"
                            + " available for valid satellite.");
            Utilities.print("7. Set required operator.");
            Utilities.print("8. Check operators setting.");
            Utilities.print("9. Go through list of valid settings.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV(function(){
                OperatorAvailability.manager(["ActivateScanWizard"]); });
        },
        "ActivateScanWizard" : function() {
            Scan.activateInitialScanWizard(function() {
                Utilities.print("Initial scan wizard is open...");
                OperatorAvailability.manager(["InvalidTvSet"]);
            });
        },
        "InvalidTvSet" : function() {
            if (OperatorAvailability.INVALID_SETTINGS.length > 0) {
                var curSet = OperatorAvailability.INVALID_SETTINGS[0];
                OperatorAvailability.CUR_LOC = Utilities.getKey(Location,
                            curSet.location.operatingValue)
                OperatorAvailability.CUR_FE = Utilities.getKey(Source,
                            curSet.frontend.operatingValue)
                if ( curSet.hasOwnProperty('satellite')
                     && typeof(curSet.satellite.operatingValue) == 'string'
                     && curSet.satellite.operatingValue != "DNC") {
                    OperatorAvailability.CUR_SAT =
                        curSet.satellite.operatingValue;
                }
                Utilities.print("--------------------");
                Utilities.print("Check invalid settings "
                                + OperatorAvailability.CUR_LOC + " + "
                                + OperatorAvailability.CUR_FE
                                + (OperatorAvailability.CUR_FE == 'DVB_S' ?
                                " + " + OperatorAvailability.CUR_SAT + "..."
                                   :"..."));
                // Check if satellites should be set
                if (OperatorAvailability.CUR_FE == 'DVB_S') {
                    var proceed = function () {
                        OperatorAvailability.manager(["SetInvalidSat"]);
                    }
                }
                else {
                    var proceed = function () {
                        OperatorAvailability.manager(["GetNids"]);
                    }
                }
                Scan.setTVSettings(function(){
                    window.setTimeout(proceed, 2000);},
                        curSet,
                    function(){
                    OperatorAvailability.INVALID_SETTINGS
                    = OperatorAvailability.INVALID_SETTINGS.slice(1);
                    OperatorAvailability.TEST_RESULT = false;
                    OperatorAvailability.manager(["InvalidTvSet"]);});
            }
            else {
                OperatorAvailability.manager(["ValidTvSet"]);
                }
        },
        "SetInvalidSat" : function() {
            var failFunc = function() {
                OperatorAvailability.INVALID_SETTINGS
                    = OperatorAvailability.INVALID_SETTINGS.slice(1);
                OperatorAvailability.TEST_RESULT = false;
                OperatorAvailability.manager(["InvalidTvSet"]);
            }
            if (OperatorAvailability.CUR_SAT != 'undefined') {
                var satelliteSettings = {
                    satelliteName1: {
                        operatingValue: OperatorAvailability.CUR_SAT
                    },
                    // Set other to Satellite.NONE
                    satelliteName2: {
                        initialValue: ""
                    },
                    satelliteName3: {
                        initialValue: ""
                    },
                    satelliteName4:{
                        initialValue: ""
                    }
                };
                Antenna.setSatellites(
                    function() {
                        window.setTimeout(
                            function () {
                                OperatorAvailability.manager(["GetNids"]);
                            },
                            2000);
                    },
                    // Single satellite scheme
                    0,
                    // Satellite settings
                    satelliteSettings,
                    failFunc
                );
            }
            else {
                Utilities.print("#ERROR: Incorrect satellite is specified for "
                                + OperatorAvailability.CUR_LOC + " + "
                                + OperatorAvailability.CUR_FE + ".");
                failFunc();
            }
        },
        "GetNids" : function() {
            var curFrontend = de.loewe.sl2.i32.channel.search.source.getValue();
            if (curFrontend != 13) {
                var curSat ="-1";
            }
            else {
                var curSat = de.loewe.sl2.tvapi.i32
                    .channel.search.satellite.id.getValue();
            }
            Scan.getNIDs(function(Nids){
                OperatorAvailability.manager(["CheckNids", Nids]);
                }, curFrontend, curSat)
        },
        "CheckNids" : function(Nids) {
            for (var key in Nids[0]){
                Nids[0][key] = Nids[0][key].toString()
            }
            if (Nids[0].indexOf(String(OperatorAvailability.OPERATOR)) != -1) {
                Utilities.print("#VERIFICATION FAILED: "
                                + OperatorAvailability.OPERATOR_NAME
                                + " is available for "
                                + OperatorAvailability.CUR_LOC + " + "
                                + OperatorAvailability.CUR_FE +
                                (OperatorAvailability.CUR_FE == 'DVB_S' ?
                                 " + " + OperatorAvailability.CUR_SAT + "."
                                 : ".")
                               );
                OperatorAvailability.TEST_RESULT = false
            }
            else {
                Utilities.print("#VERIFICATION PASSED: "
                                + OperatorAvailability.OPERATOR_NAME
                                + " is not available for "
                                + OperatorAvailability.CUR_LOC + " + "
                                + OperatorAvailability.CUR_FE +
                                (OperatorAvailability.CUR_FE == 'DVB_S' ?
                                 " + " + OperatorAvailability.CUR_SAT + "."
                                 : ".")
                               );
            }
            OperatorAvailability.INVALID_SETTINGS
                = OperatorAvailability.INVALID_SETTINGS.slice(1)
            window.setTimeout(function(){
                OperatorAvailability.manager(["InvalidTvSet"]);}, 2000);
        },
        "ValidTvSet" : function() {
            if (OperatorAvailability.VALID_SETTINGS.length > 0) {
                var curSet = OperatorAvailability.VALID_SETTINGS[0];
                OperatorAvailability.CUR_LOC = Utilities.getKey(Location,
                            curSet.location.operatingValue)
                OperatorAvailability.CUR_FE = Utilities.getKey(Source,
                            curSet.frontend.operatingValue)
                if ( curSet.hasOwnProperty('satellite')
                     && typeof(curSet.satellite.operatingValue) == 'string'
                     && curSet.satellite.operatingValue != "") {
                    OperatorAvailability.CUR_SAT =
                        curSet.satellite.operatingValue;
                }
                Utilities.print("--------------------");
                Utilities.print("Check valid settings "
                                + OperatorAvailability.CUR_LOC + " + "
                                + OperatorAvailability.CUR_FE +
                                (OperatorAvailability.CUR_FE == 'DVB_S' ?
                                 " + " + OperatorAvailability.CUR_SAT + "..."
                                 : "...")
                               );
                    var proceed = function () {
                        OperatorAvailability.manager(["setOperator"]);
                    }
                Scan.setTVSettings(
                    function() {
                        window.setTimeout(proceed, 2000);
                    },
                    curSet,
                    function() {
                        OperatorAvailability.VALID_SETTINGS
                            = OperatorAvailability.VALID_SETTINGS.slice(1);
                        if (OperatorAvailability.NETWORK_RULES.length > 1){
                            OperatorAvailability.NETWORK_RULES
                                = OperatorAvailability.NETWORK_RULES.slice(1)
                        };
                        OperatorAvailability.TEST_RESULT = false;
                        OperatorAvailability.manager(["ValidTvSet"]);});
            }
            else {
                OperatorAvailability.manager(
                    ["EndTest", OperatorAvailability.TEST_RESULT]
                );
            }
        },
        "SetValidSat" : function() {
            var failFunc = function() {
                OperatorAvailability.VALID_SETTINGS
                    = OperatorAvailability.VALID_SETTINGS.slice(1);
                if (OperatorAvailability.NETWORK_RULES.length > 1){
                    OperatorAvailability.NETWORK_RULES
                        = OperatorAvailability.NETWORK_RULES.slice(1)
                };
                OperatorAvailability.TEST_RESULT = false;
                OperatorAvailability.manager(["ValidTvSet"]);
            }
            if (OperatorAvailability.CUR_SAT != 'undefined') {
                var satelliteSettings = {
                    satelliteName1: {
                        operatingValue: OperatorAvailability.CUR_SAT
                    },
                    // Set other to Satellite.NONE
                    satelliteName2: {
                        initialValue: ""
                    },
                    satelliteName3: {
                        initialValue: ""
                    },
                    satelliteName4:{
                        initialValue: ""
                    }
                };
                Antenna.setSatellites(
                    function() {
                        window.setTimeout(
                            function () {
                                OperatorAvailability.manager(["CheckNetworkRules"]);
                            },
                            2000);
                    },
                    // Single satellite scheme
                    0,
                    // Satellite settings
                    satelliteSettings,
                    failFunc
                );
            }
            else {
                Utilities.print("#ERROR: Incorrect satellite is specified for "
                                + OperatorAvailability.CUR_LOC + " + "
                                + OperatorAvailability.CUR_FE + ".");
                failFunc();
            }
        },
        "setOperator" : function() {
            Scan.setOperator(
            
                function(){
                    if (OperatorAvailability.CUR_FE == 'DVB_S') {
                        OperatorAvailability.manager(["SetValidSat"])
                    }
                    else {
                        OperatorAvailability.manager(["CheckNetworkRules"]);
                    }
                },
                // Front-end will be obtained from current settings
                "",
                OperatorAvailability.OPERATOR,
                // Satellite will be obtained from current settings
                "",
                function(){
                    Utilities.print(
                        "#VERIFICATION FAILED: "
                            + OperatorAvailability.OPERATOR_NAME
                            + " is not set for "
                            + OperatorAvailability.CUR_LOC + " + "
                            + OperatorAvailability.CUR_FE +
                            (OperatorAvailability.CUR_FE == 'DVB_S' ?
                             " + " + OperatorAvailability.CUR_SAT + "."
                             : ".")
                    );
                    OperatorAvailability.VALID_SETTINGS
                    = OperatorAvailability.VALID_SETTINGS.slice(1);
                    if (OperatorAvailability.NETWORK_RULES.length > 1){
                        OperatorAvailability.NETWORK_RULES
                        = OperatorAvailability.NETWORK_RULES.slice(1)
                    };
                    OperatorAvailability.TEST_RESULT = false;
                    OperatorAvailability.manager(["ValidTvSet"]);
                }
            )
        },
        "CheckNetworkRules" : function(){
            Utilities.print(
                "#VERIFICATION PASSED: "
                    + OperatorAvailability.OPERATOR_NAME
                    + " is available and set for "
                    + OperatorAvailability.CUR_LOC + " + "
                    + OperatorAvailability.CUR_FE +
                    (OperatorAvailability.CUR_FE == 'DVB_S' ?
                     " + " + OperatorAvailability.CUR_SAT + "."
                     : ".")
            );
            Utilities.print("Check network rules that "
                            + "loaded after operator setting...");

            Scan.checkSettings(function(){
                    if (OperatorAvailability.NETWORK_RULES.length > 1){
                        OperatorAvailability.NETWORK_RULES
                        = OperatorAvailability.NETWORK_RULES.slice(1)
                    }
                    OperatorAvailability.VALID_SETTINGS
                    = OperatorAvailability.VALID_SETTINGS.slice(1);
                    OperatorAvailability.manager(["ValidTvSet"]);},
                    OperatorAvailability.NETWORK_RULES[0]
                )
        },
        'EndTest': function(result){
            Scan.deactivateInitialScanWizard(function(){
                 OperatorAvailability.END(result[0]||false)
            })
        },
    };
    steps[args[0]](args.splice(1, 1));
}

}

}
