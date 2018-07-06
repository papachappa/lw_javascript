include('../Utilities.js');
include('../Scan.js');
include('../Antenna.js');


init = function () {

    /** @namespace
     * Test script for Auto scan
     * @requires Library: {@link Utilities}, {@link Scan},
     * {@link Antenna}
     */
    AutoScanDVBS = {

        TV_SETTINGS: {},
        SCAN_SETTINGS: {},
        OPERATOR: "",
        SCAN_RESULT: {},
        NUMBER_OF_TV_SERVICES: "",
        NUMBER_OF_RADIO_SERVICES: "",

        /**
         * Set test variables and start test execution.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof AutoScanDVBS
         *
         * @param {object} [tvSets = {}]
         * Array of TV settings that should be set
         * or checked during test execution.
         * No settings will be set and checked
         * if the parameter is omitted or empty.
         * List of available settings (any setting can be omitted):
         * <br/>- location, see {@link Location} for available values;
         * <br/>- frontend, see {@link Source} for available values;
         * Settings can have a mark for initial value verification.
         * See template AutoScanDVBS.html for more details.
         *
         * @param {array} [operatorID = "" ]
         * Operator ID that should be set for test execution.
         * ATTENTION! operatorID will be used only if tvSets.frontend.value is
         * present in input values. Before setting the operator the test script
         * will check if it is available for required frontend. Test will be
         * terminated if setting is invalid.
         *
         * @param {object} [scanSets = {}]
         * Array of scan settings that should be set
         * or checked during test execution.
         * No settings will be set and checked
         * if the parameter is omitted or empty.
         * List of available settings (any setting can be omitted):
         * <br/>- scramblingSelectable: selectability
         * of searching scrambled services,
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
         * See template AutoScanDVBS.html for more details.
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
         * See template AutoScanDVBS(Mediaset).html for more details.
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
                             scanResult,
                             exitFunc) {

            if ( typeof(tvSets) != "object"
                || Object.keys(tvSets).length == 0 ) {
                Utilities.print("WARN: "
                                + "Scan will be executed with "
                                + "current TV settings, "
                                + "and no settings verification.");
            }
            else {
                AutoScanDVBS.TV_SETTINGS = tvSets;
            }

            if ( typeof(operatorID) != 'number') {
                Utilities.print("WARN: "
                                + "Simulation of auto scan without "
                                + "opening 'scan' wizard.");
            }
            else {
                AutoScanDVBS.OPERATOR = operatorID;
            }

            if ( typeof(scanSets) != "object"
                || Object.keys(scanSets).length == 0 ) {
                Utilities.print("WARN: "
                                + "Scan will be executed with "
                                + "current scan settings, "
                                + "and no settings verification.");
            }
            else {
                AutoScanDVBS.SCAN_SETTINGS = scanSets;
            }

            if ( typeof(n_TvServices) != "number" ) {
                Utilities.print("WARN: "
                                + "Number of found TV services "
                                + "will NOT be checked.");
            }
            else {
                AutoScanDVBS.NUMBER_OF_TV_SERVICES = n_TvServices;
            }

            if ( typeof(n_RadioServices) != "number" ) {
                Utilities.print("WARN: "
                                + "Number of found Radio services "
                                + "will NOT be checked.");
            }
            else {
                AutoScanDVBS.NUMBER_OF_RADIO_SERVICES = n_RadioServices;
            }

            if (typeof(scanResult) != "object"
                || Object.keys(scanResult).length == 0) {
                Utilities.print("WARN: Scan results"
                                + " are not specified.\n"
                                + "Corresponding check "
                                + "will be omitted.");
            }
            else {
                AutoScanDVBS.SCAN_RESULT = scanResult;
            }

            AutoScanDVBS.manager(["Connect"]);

        },

        /**
         * Execution of automatic scan with test environment setting
         * and scan result verification.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof AutoScanDVBS
         * @requires Library: {@link Utilities}, {@link Scan}, {@link Antenna}
         */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Wait if scan currently is on.");
                    Utilities.print("3. Set TV and scan settings");
                    Utilities.print(    "(test will be terminated "
                                        + "if one of required"
                                        + " settings can't be set).");
                    Utilities.print("4. Start scan and monitor the process.");
                    Utilities.print("5. Check all expected scan states.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                        function() {
                            AutoScanDVBS.manager(["Precheck"]);
                        },
                        2000
                    );
                },
                "Precheck" : function() {
                    Utilities.print("Checking system readiness...");
                    Scan.waitScanFinish(
                        function() {
                            AutoScanDVBS.manager(["DeactivateAutoScanWizard"]);
                        }
                    );
                },
                "DeactivateAutoScanWizard" : function() {
                    Scan.deactivateInitialScanWizard(
                        function() {
                            Utilities.print("Wizard for initial scan "
                                            + "is closed...");
                            AutoScanDVBS.manager(["SetTVSettings"]);
                        }
                    );
                },
                "SetTVSettings" : function() {
                    Scan.setTVSettings(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "TV settings are applied "
                                            + "successfully.");
                            AutoScanDVBS.manager(["SetSatellite"]);
                        },
                        AutoScanDVBS.TV_SETTINGS,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "TV settings were "
                                            + "not applied.");
                            AutoScanDVBS.manager(["EndTest"]);
                        }
                    );
                },
                "SetSatellite" : function() {
                    if (AutoScanDVBS.SCAN_SETTINGS.hasOwnProperty(
                        "currentScanSatellite")) {
                        Antenna.setSatelliteForScan(
                            function() {
                                Utilities.print("#VERIFICATION PASSED: "
                                                + "Satellite is set "
                                                + "successfully.");
                                AutoScanDVBS.manager(["SetOperator"]);
                            },
                            AutoScanDVBS.SCAN_SETTINGS.currentScanSatellite,
                            function() {
                                Utilities.print("#VERIFICATION FAILED: "
                                                + "Satellite was "
                                                + "not set");
                                AutoScanDVBS.manager(["EndTest"]);
                            }
                        );
                    }
                    else {
                        AutoScanDVBS.manager(["SetOperator"]);
                    }
                },
                "SetOperator" : function() {
                    if (AutoScanDVBS.OPERATOR != "") {
                        Scan.setOperator(
                            function() {
                                Utilities.print("#VERIFICATION PASSED: "
                                                + "Operator is set "
                                                + "successfully.");
                                AutoScanDVBS.manager(["SetScanSettings"]);
                            },
                            "",
                            AutoScanDVBS.OPERATOR,
                            // Take the satellite from the current settings
                            "",
                            function() {
                                Utilities.print("#VERIFICATION FAILED: "
                                                + "Operator was "
                                                + "not set");
                                AutoScanDVBS.manager(["EndTest"]);
                            }
                        );
                    }
                    else {
                        var networkId = de.loewe.sl2.i32
                            .channel.search.selected
                            .network.id.getValue();
                        Utilities.print("INFO: "
                                        + "Current operator id is "
                                        + networkId + ".");
                        AutoScanDVBS.manager(['SetScanSettings']);
                    }
                },
                "SetScanSettings" : function() {
                    Scan.setScanSettings(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "Scan settings are applied "
                                            + "successfully.");
                            AutoScanDVBS.manager(["Scan"]);
                        },
                        AutoScanDVBS.SCAN_SETTINGS,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Scan settings were "
                                            + "not applied.");
                            AutoScanDVBS.manager(["EndTest"]);
                        }
                    );
                },
                "Scan" : function() {
                    Scan.startAutoScanMonitor(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "Scan process finished "
                                            + "succesfully.");
                            AutoScanDVBS.manager(["CheckNumberOfServices"]);
                        },
                        AutoScanDVBS.SCAN_RESULT,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Scan process was not "
                                            + "performed as expected.");
                            AutoScanDVBS.manager(["EndTest"]);
                        }
                    );
                },
                "CheckNumberOfServices" : function() {
                    // Two vars are used to avoid
                    // lazy evaluation of boolean statements

                    // NUMBER_OF_TV_SERVICES is defined and not equal
                    // to expected
                    var TVtestRes = Boolean(
                        AutoScanDVBS.NUMBER_OF_TV_SERVICES !== ""
                        && !Scan.checkNumberOfTVServices(
                            AutoScanDVBS.NUMBER_OF_TV_SERVICES
                        )
                    );
                    // NUMBER_OF_RADIO_SERVICES is defined and not equal
                    // to expected
                    var radioTestRes = Boolean(
                        AutoScanDVBS.NUMBER_OF_RADIO_SERVICES !== ""
                        && !Scan.checkNumberOfRadioServices(
                            AutoScanDVBS.NUMBER_OF_RADIO_SERVICES
                        )
                    );
                    if (TVtestRes || radioTestRes) {
                        Utilities.print("#VERIFICATION FAILED: "
                                        + "Number of services "
                                        + "is not equal to expected");
                    }
                    AutoScanDVBS.manager(["EndTest"]);
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
