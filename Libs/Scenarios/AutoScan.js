include('../Utilities.js');
include('../Scan.js');

init = function () {

    /** @namespace
    * Test script for Auto scan
    * @requires Library: {@link Utilities}, {@link Scan}
    */
    AutoScan = {

        TV_SETTINGS: {},
        SCAN_SETTINGS: {},
        OPERATOR: "",
        SCAN_RESULT: {},
        NUMBER_OF_TV_SERVICES: "",
        NUMBER_OF_RADIO_SERVICES: "",

        /**
        * Set test variables and start test execution.
        * @author Anna Klimovskaya aklimovskaya@luxoft.com
        * @memberof AutoScan
        *
        * @param {object} [tvSets = {}]
        * Array of TV settings that should be set or checked during test execution.
        * No settings will be set and checked if the parameter is omitted or empty.
        * List of available settings (any setting can be omitted):
        * <br/>- location, see {@link Location} for available values;
        * <br/>- frontend, see {@link Source} for available values;
        * Settings can have a mark for initial value verification.
        * See template AutoScan.html for more details.
        *
        * @param {array} [operatorID = "" ]
        * Operator ID that should be set for test execution.
        * ATTENTION! operatorID will be used only if tvSets.frontend.value is
        * present in input values. Before setting the operator the test script
        * will check if it is available for required frontend. Test will be
        * terminated if setting is invalid.
        *
        * @param {object} [scanSets = {}]
        * Array of scan settings that should be set or checked during test execution.
        * No settings will be set and checked if the parameter is omitted or empty.
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
        * <br/>- hdPreferred: HD preferred. <br/>
        * Any setting can have a mark for initial value verification.
        * See template AutoScan.html for more details.
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
        * Array containing scan states and required actions,
        * for example, LCN conflict and required swap for Mediaset.
        * Script will check that not expected states were not observed
        * during test execution.
        * See template AutoScan(Mediaset).html for more details.
        *
        * @example
        * //Structure of settings
        * var tvSets = {
        *      location: {
        *          value: location.BELGIUM,
        *          initialValue: location.ITALY
        *      },
        *      frontend: {
        *          value: DO_NOT_CHANGE,
        *          initialValue: frontEnd.DVB_T
        *      },
        * };
        *
        * //Structure of scanResult
        * var expectedScanResult = {
        *     lcnConflict: {
        *         serviceList:[
        *              [ 'Serv1', '1', '1', '6', '20', '4', '1', '1' ],
        *              [ 'Serv2', '850', '2', '6', '20', '4', '1', '1' ]
        *         ],
        *         executeSwap:[
        *              {type:MediaType.TV, chanNumbers:[1, 850]}
        *         ]
        *      },
        *      newServices: {
        *          serviceList:[
        *               [ 'CH 6', '10', '6', '19', '20', '4', '1', '1' ],
        *               [ 'CH 6', '10', '6', '19', '20', '4', '1', '1' ]
        *          ],
        *          removeServices:[0,1]
        *       },
        *       unfoundServices: {
        *           serviceList:[],
        *           removeServices:[]
        *       },
        * }
        * @requires Library: {@link Utilities}
        */
        startTest: function (tvSets,
                            operatorID,
                            scanSets,
                            n_TvServices,
                            n_RadioServices,
                            scanResult) {

            if ( typeof(tvSets) != "object"
                || Object.keys(tvSets).length == 0 ) {
                Utilities.print("WARN: "
                                + "Scan will be executed with "
                                + "current TV settings, "
                                + "and no settings verification.");
            }
            else {
                AutoScan.TV_SETTINGS = tvSets;
            }

            if ( typeof(scanSets) != "object"
                || Object.keys(scanSets).length == 0 ) {
                Utilities.print("WARN: "
                                + "Scan will be executed with "
                                + "current scan settings, "
                                + "and no settings verification.");
            }
            else {
                AutoScan.SCAN_SETTINGS = scanSets;
            }

            if ( typeof(operatorID) == "undefined"
                    || operatorID == "DNC" ) {
                Utilities.print("WARN: "
                                + "Simulation of auto scan without "
                                + "opening 'scan' wizard.");
            }
            else {
                AutoScan.OPERATOR = operatorID;
            }

            if ( typeof(n_TvServices) != "number" ) {
                Utilities.print("WARN: "
                                + "Number of found TV services "
                                + "will NOT be checked.");
                AutoScan.NUMBER_OF_TV_SERVICES = "";
            }
            else {
                AutoScan.NUMBER_OF_TV_SERVICES = n_TvServices;
            }

            if ( typeof(n_RadioServices) != "number" ) {
                Utilities.print("WARN: "
                                + "Number of found Radio services "
                                + "will NOT be checked.");
                AutoScan.NUMBER_OF_RADIO_SERVICES = "";
            }
            else {
                AutoScan.NUMBER_OF_RADIO_SERVICES = n_RadioServices;
            }

            if (typeof(scanResult) != "object"
                || Object.keys(scanResult).length == 0) {
                AutoScan.SCAN_RESULT = {}
            }
            else {
                AutoScan.SCAN_RESULT = scanResult;
            }

            AutoScan.manager(["Connect"]);

        },

        /**
        * Execution of initial scan with test environment setting
        * and scan result verification.
        * @author Anna Klimovskaya aklimovskaya@luxoft.com
        * @memberof AutoScan
        * @requires Library: {@link Utilities}, {@link Scan}
        */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Wait if scan currently is on.");
                    Utilities.print("3. Set network and scan settings");
                    Utilities.print(    "(test will be terminated "
                                        + "if one of required"
                                        + " settings can't be set).");
                    Utilities.print("4. Start scan and monitor the process.");
                    Utilities.print("5. Check all expected scan states.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                        function() {
                            AutoScan.manager(["Precheck"]);
                        },
                        2000
                    );
                },
                "Precheck" : function() {
                    Utilities.print("Checking system readiness...");
                    Scan.waitScanFinish(
                        function() {
                            AutoScan.manager(["DeactivateAutoScanWizard"]);
                        }
                    );
                },
                "DeactivateAutoScanWizard" : function() {
                    Scan.deactivateInitialScanWizard(
                        function() {
                            Utilities.print("Wizard for initial scan "
                                            + "is closed...");
                            AutoScan.manager(["SetTVSettings"]);
                        }
                    );
                },
                "SetTVSettings" : function() {
                    Scan.setTVSettings(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "TV settings are applied "
                                            + "successfully.");
                            AutoScan.manager(["SetOperator"]);
                        },
                        AutoScan.TV_SETTINGS,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "TV settings were "
                                            + "not applied.");
                            AutoScan.manager(["EndTest"]);
                        }
                    );
                },
                "SetOperator" : function() {
                    if (AutoScan.OPERATOR != "") {  
                        var frontend = de.loewe.sl2.i32.channel.search
                                        .source.getValue(); 
                        Scan.setOperator(
                            function() {
                                Utilities.print("#VERIFICATION PASSED: "
                                                + "Operator is set "
                                                + "successfully.");
                                AutoScan.manager(["SetScanSettings"]);
                            },
                            frontend,
                            AutoScan.OPERATOR,
                            "",
                            function() {
                                Utilities.print("#VERIFICATION FAILED: "
                                                + "Operator was "
                                                + "not set");
                                AutoScan.manager(["EndTest"]);
                            }
                        );
                    }
                    else{
                        var networkId = de.loewe.sl2.i32.channel.search
                                        .selected.network.id.getValue();
                        Utilities.print("INFO: Current operator id is "
                                        + networkId + ".");
                        AutoScan.manager(['SetScanSettings']);
                    }
                },
                "SetScanSettings" : function() {
                    Scan.setScanSettings(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "Scan settings are applied "
                                            + "successfully.");
                            AutoScan.manager(["Scan"]);
                        },
                        AutoScan.SCAN_SETTINGS,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Scan settings were "
                                            + "not applied.");
                            AutoScan.manager(["EndTest"]);
                        }
                    );
                },
                "Scan" : function() {
                    Scan.startAutoScanMonitor(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "Scan process finished "
                                            + "succesfully.");
                            AutoScan.manager(["CheckNumberTVServices"]);
                        },
                        AutoScan.SCAN_RESULT,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Scan process was not "
                                            + "performed as expected.");
                            AutoScanDVBS.manager(["EndTest"]);
                        }
                    );
                },
                "CheckNumberTVServices" : function() {
                    if (AutoScan.NUMBER_OF_TV_SERVICES !== "") {
                        Scan.checkNumberOfTVServices(
                            AutoScan.NUMBER_OF_TV_SERVICES
                        );
                    }
                    AutoScan.manager(["CheckNumberRadioServices"]);
                },
                "CheckNumberRadioServices" : function() {
                    if (AutoScan.NUMBER_OF_RADIO_SERVICES !== "") {
                        Scan.checkNumberOfRadioServices(
                            AutoScan.NUMBER_OF_RADIO_SERVICES
                        );
                    }
                    AutoScan.manager(["EndTest"]);
                },
                "EndTest" : function() {
                    Utilities.print("Test finished.");
                    Utilities.printTestResult();
                    Utilities.endTest();
                }
            };
            steps[args[0]](args.splice(1, 1));
        }
    }
}
