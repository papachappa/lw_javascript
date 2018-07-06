include('../Utilities.js');
include('../Scan.js');

init = function () {

    /** @namespace
    * Test script for set settings of TV
    * @requires Library: {@link Utilities}, {@link Scan}
    */
    SetSettings = {
        TV_SETTINGS: {},

        /**
        * Set test variables and start test execution.
        * @author Evgenii Blokhin eblokhin@luxoft.com
        * @memberof SetSettings
        *
        * @param {object} [tvSets = {}]
        * Array of TV settings that should be set or checked during test execution.
        * No settings will be set and checked if the parameter is omitted or empty.
        *
        *
        * @example
        * //Structure of settings
        * var tvSets = {
        *      dcmAutoUpdate: {
        *          operatingValue: NO
        *      },
        * };
        *
        * @requires Library: {@link Utilities}
        * @requires Library: {@link Scan}
        */
        startTest: function (tvSets,
                             exitFunc) {

            if ( typeof(tvSets) != "object"
                || Object.keys(tvSets).length == 0 ) {
                Utilities.print("WARN: "
                                + "Scan will be executed with "
                                + "current TV settings, "
                                + "and no settings verification.");
            }
            else {
                SetSettings.TV_SETTINGS = tvSets;
            }
            
            if (typeof(exitFunc) == "function") {
                SetSettings.END = exitFunc;
                SetSettings.manager(["Precheck"]);
            }
            else {
                SetSettings.manager(["Connect"]);
            }

        },

        /**
        * Execution set and test environment setting
        * @author Evgenii Blokhin eblokhin@luxoft.com
        * @memberof SetSettings
        * @requires Library: {@link Utilities}, {@link Scan}
        */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Set network settings");
                    Utilities.print(    "(test will be terminated "
                                        + "if one of required"
                                        + " settings can't be set).");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                        function() {
                            SetSettings.manager(["Precheck"]);
                        },
                        2000
                    );
                },
                "Precheck" : function() {
                    Utilities.print("Checking system readiness...");
                    Scan.waitScanFinish(
                        function() {
                            SetSettings.manager(["DeactivateScanWizard"]);
                        }
                    );
                },
                "DeactivateScanWizard" : function() {
                    Scan.deactivateInitialScanWizard(
                        function() {
                            Utilities.print("Wizard for initial scan "
                                            + "is closed...");
                            SetSettings.manager(["SetSettings"]);
                        }
                    );
                },
                "SetSettings" : function() {
                    Scan.setTVSettings(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "TV settings are applied "
                                            + "successfully.");
                            SetSettings.manager(["EndTest"]);
                        },
                        SetSettings.TV_SETTINGS,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "TV settings were "
                                            + "not applied.");
                            SetSettings.manager(["EndTest"]);
                        }
                    );
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
