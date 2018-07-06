include('../Utilities.js');
include('../Scan.js');
include('../Antenna.js');
include('../ChannelChange.js');

init = function () {

    /** @namespace
     * Test script for Auto scan
     * @requires Library: {@link Utilities}, {@link Scan},
     * {@link Antenna}, {@link ChannelChange}
     */
    ManualScan = {

        TV_SETTINGS: {},
        SCAN_SETTINGS: {},
        OPERATOR: "",
        SCAN_RESULT: {},
        TEST_RESULT: true,
        END: function() {
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest();
        },

        /**
         * Set test variables and start test execution.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ManualScan
         *
         * @param {object} [tvSets = {}]
         * Array of TV settings that should be set
         * or checked during test execution.
         * No settings will be set and checked
         * if the parameter is omitted or empty.
         * List of available settings (any setting can be omitted):
         * <br/>- location, see {@link Location} for available values;
         * <br/>- frontend, see {@link Source} for available values.
         * Settings can have a mark for initial value verification.
         * See template ManualScan.html for more details.
         *
         * @param {array} [operatorID = "" ]
         * Operator ID that should be checked during a test execution.
         *
         * @param {object} [scanSets = {}]
         * Array of scan settings that should be set
         * or checked during test execution.
         * No settings will be set and checked
         * if the parameter is omitted or empty.
         * List of available settings (any setting can be omitted):
         * <br/>- scramblingSelectable: selectability of searching
         * scrambled services,
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
         * See template ManualScan.html for more details.
         *
         * @param {object} [scanResult]
         * Array containing scan states and required actions,
         * for example, LCN conflict and required swap for Mediaset.
         * Script will check that not expected states were not observed
         * during test execution.
         *
         * @example
         * //Structure of settings
         * var tvSets = {
         *      location: {
         *          operatingValue: location.BELGIUM,
         *          initialValue: location.ITALY
         *      },
         *      frontend: {
         *          operatingValue: DO_NOT_CHANGE,
         *          initialValue: frontEnd.DVB_T
         *      }
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
         *      foundServices: {
         *          serviceList:[
         *               [ 'CH 6', '1', '1', '19', '20' ]
         *          ],
         *          saveServices:[0]
         *       }
         * }
         * @requires Library: {@link Utilities}
         */
        startTest: function (tvSets,
                             operatorID,
                             scanSets,
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
                ManualScan.TV_SETTINGS = tvSets;
            }

            if ( typeof(operatorID) != 'number') {
                Utilities.print("WARN: "
                                + "Operator is not specified.\n"
                                + "Current value will be used."
                                + " Corresponding check will be omitted.");
            }
            else {
                ManualScan.OPERATOR = operatorID;
            }

            if ( typeof(scanSets) != "object"
                 || Object.keys(scanSets).length == 0 ) {
                Utilities.print("WARN: "
                                + "Scan will be executed with "
                                + "current scan settings, "
                                + "and no settings verification.");
            }
            else {
                ManualScan.SCAN_SETTINGS = scanSets;
            }

            if (typeof(scanResult) != "object"
                || Object.keys(scanResult).length == 0) {
                Utilities.print("WARN: Scan results"
                                + " are not specified.\nCorresponding check "
                                + "will be omitted.");
            }
            else {
                ManualScan.SCAN_RESULT = scanResult;
            }

            if ( typeof(exitFunc) == "function") {
                ManualScan.END = exitFunc;
                ManualScan.manager(["Precheck"]);
            }
            else {
                ManualScan.manager(["Connect"]);
            }
        },

        /**
         * Execution of manual scan with test environment setup
         * and scan result verification.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof ManualScan
         * @requires Library: {@link Utilities}, {@link Scan}, {@link Antenna},
         * {@link ChannelChange}
         */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Wait if scan is currently on.");
                    Utilities.print("3. Open manual scan wizard");
                    Utilities.print("4. Check/set the current operator, "
                                    + "TV and scan settings");
                    Utilities.print("5. Start scan and monitor the process.");
                    Utilities.print("6. Check all expected scan states.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(function(){
                        ManualScan.manager(["Precheck"]);
                    }, 2000);
                },
                "Precheck" : function() {
                    Utilities.print("Checking system readiness...");
                    Scan.waitScanFinish(function(){
                        ManualScan.manager(["DeactivateInitialScanWizard"]);
                    });
                },
                "DeactivateInitialScanWizard" : function() {
                    Scan.deactivateInitialScanWizard(
                        function() {
                            Utilities.print("Wizard for initial scan "
                                            + "is closed...");
                            ManualScan.manager(["OpenManualScanWizard"]);
                        });
                },
                "OpenManualScanWizard" : function() {
                    Scan.openManualScanWizard(
                        function() {
                            Utilities.print("Wizard for manual scan is open.");
                            ManualScan.manager(["SetTVSettings"]);
                        },
                        function() {
                            Utilities.print(
                                "#VERIFICATION FAILED: "
                                    + "Manual scan wizard cannot be opened.");
                            ManualScan.manager(["EndTest"]);
                        }
                    );
                },
                "SetTVSettings" : function() {
                    Scan.setTVSettings(
                        function() {
                            Utilities.print(
                                "TV settings are applied successfully.");
                            ManualScan.manager(["SetSatellite"]);
                        },
                        ManualScan.TV_SETTINGS,
                        function() {
                            Utilities.print(
                                "#VERIFICATION FAILED: "
                                    + "TV settings were not applied.");
                            ManualScan.manager(["EndTest"]);
                        }
                    );
                },
                "SetSatellite" : function() {
                    if (ManualScan.SCAN_SETTINGS.hasOwnProperty(
                        "currentScanSatellite")) {
                        Antenna.setSatelliteForScan(
                            function() {
                                Utilities.print("Satellite is set "
                                                + "successfully.");
                                ManualScan.manager(["CheckOperator"]);
                            },
                            ManualScan.SCAN_SETTINGS.currentScanSatellite,
                            function() {
                                Utilities.print("#VERIFICATION FAILED: "
                                                + "Satellite was not set");
                                ManualScan.manager(["EndTest"]);
                            }
                        );
                    }
                    else {
                        ManualScan.manager(["CheckOperator"]);
                    }
                },
                "CheckOperator" : function() {
                    if ( ManualScan.OPERATOR != "") {
                        var operatorObj = {
                            description: "operator id",
                            api: de.loewe.sl2.i32.channel.search
                                .selected.network.id,
                            operatingValue: ManualScan.OPERATOR
                        };
                        Scan.getCheckValue(
                            function() {
                                ManualScan.manager(["SetFrequency"]);
                            },
                            operatorObj,
                            ManualScan.OPERATOR,
                            function() {
                                Utilities.print("WARN: Scan results may be "
                                                + "affected.");
                                ManualScan.manager(["SetFrequency"]);
                            }
                        );
                    }
                    else {
                        var networkId = de.loewe.sl2.i32
                            .channel.search.selected
                            .network.id.getValue();
                        Utilities.print("INFO: Current operator id is "
                                        + networkId + ".");
                        ManualScan.manager(['SetFrequency']);
                    }
                },
                "SetFrequency" : function() {
                    if (Scan.isManualScanInhibited()) {
                        Utilities.print("Manual scan is allowed for "
                                        + "current network configuration");
//workaround for HL1-3686
                        if (ManualScan.SCAN_SETTINGS.hasOwnProperty("frequency")){
                            if (ManualScan.SCAN_SETTINGS.frequency.hasOwnProperty("operatingValue")){
                                Utilities.print("ATTENTION! Current implementation is "
                                    + "workaround for unstable set of scan frequency."
                                    + " Second attempt will be done if first is fail.");
                                var firstTry = {
                                    frequency:{
                                        operatingValue:"",
                                        initialValue: ""
                                    }
                                };
                                firstTry.frequency.operatingValue 
                                    = ManualScan.SCAN_SETTINGS.frequency.operatingValue||'DNC';
                                firstTry.frequency.initialValue 
                                    = ManualScan.SCAN_SETTINGS.frequency.initialValue||'DNC';
                                
                                Scan.setScanSettings(
                                    function() {
                                        Utilities.print(
                                            "#VERIFICATION PASSED: Scan frequency is set with first attempt.");
                                        ManualScan.SCAN_SETTINGS.frequency.initialValue 
                                            = ManualScan.SCAN_SETTINGS.frequency.operatingValue;
                                        ManualScan.SCAN_SETTINGS.frequency.operatingValue = 'DNC'
                                        ManualScan.manager(["SetScanSettings"]);
                                    },
                                    firstTry,
                                    function() {
                                        Utilities.print(
                                            "#VERIFICATION FAILED: "
                                                + "Scan frequency is NOT set by first attempt.");
                                        ManualScan.SCAN_SETTINGS.frequency.initialValue 
                                            = ManualScan.SCAN_SETTINGS.frequency.operatingValue;
                                        ManualScan.manager(["SetScanSettings"]);
                                    }
                                );
                            }
                            else {
                                ManualScan.manager(["SetScanSettings"])
                            }
                        }
                        else{
                            ManualScan.manager(["SetScanSettings"]);
                        }
                    }
                    else {
                        Utilities.print("#VERIFICATION FAILED: "
                                        + "Manual scan is prohibited for "
                                        + "current network configuration");
                        ManualScan.manager(["EndTest"]);
                    }
                },
                "SetScanSettings" : function() {
                    Scan.setScanSettings(
                        function() {
                            Utilities.print(
                                "Scan settings are applied successfully.");
                            ManualScan.manager(["Scan"]);
                        },
                        ManualScan.SCAN_SETTINGS,
                        function() {
                            Utilities.print(
                                "#VERIFICATION FAILED: "
                                    + "Scan settings were not applied.");
                            ManualScan.manager(["EndTest"]);
                        }
                    );
                },
                "Scan" : function() {
                    Scan.startManualScanMonitor(
                        function() {
                            Utilities.print(
                                "#VERIFICATION PASSED: "
                                    + "Scan process finished successfully.");
                            ManualScan.manager(["EndTest", true]);
                        },
                        ManualScan.SCAN_RESULT,
                        function() {
                            Utilities.print(
                                "#VERIFICATION FAILED: "
                                    + "Scan process was not performed "
                                    + "as expected.");
                            ManualScan.manager(["EndTest"]);
                        }
                    );
                },
                "EndTest" : function(result) {
                    var progressFrequency = de.loewe.sl2.i32
                        .channel.search.progress.frequency.getValue();
                    var expectedFrequency = de.loewe.sl2.i32
                        .search.frequency.getValue();
                    // Check if fixed scan was performed
                    if (progressFrequency != 0
                        // Acceptable frequency deviation < = 9000
                        && Math.abs(progressFrequency - expectedFrequency )
                        > 9000) {
                        Utilities.print("WARN: Automatic scan was performed"
                                    + " instead of fixed one.");
                    }
                    Scan.closeManualScanWizard(
                        function() {
                            Utilities.print("Wizard for manual scan "
                                            + "is closed.");
                            ManualScan.END(result[0]||false);
                        },
                        function() {
                            Utilities.print(
                                "#ERROR: "
                                    + "Manual scan wizard cannot be closed.");
                            ManualScan.END(false);
                        }
                    );
                }
            }
            steps[args[0]](args.splice(1, 1));
        }
    }
}
