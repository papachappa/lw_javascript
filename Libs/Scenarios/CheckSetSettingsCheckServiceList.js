include('../Utilities.js');
include('./CheckServiceList.js');
include('./SetSettings.js');

init = function () {

    /** @namespace
    * Test script for set settings of TV
    * @requires Library: {@link Utilities}, {@link Scan}
    */
    CheckSetSettingsCheckServiceList = {
        TV_SETTINGS: {},
        SERVICELIST_NAME: "#3051",
        EXPECTED_LIST: {},
        END: function() {           
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        },



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
                             listname,
                             expectedList,
                             exitFunc) {

            if ( typeof(tvSets) != "object"
                || Object.keys(tvSets).length == 0 ) {
                Utilities.print("WARN: No settings is checked and set");
            }
            else {
                CheckSetSettingsCheckServiceList.TV_SETTINGS = tvSets;
            }

            if (typeof(listname) == "undefined" || listname == "") {
                Utilities.print("INFO: Overall list will be checked.");
            }
            else {
                CheckSetSettingsCheckServiceList.SERVICELIST_NAME = listname;
            }

            if (typeof(expectedList) != "undefined" && expectedList !== "") {
                CheckSetSettingsCheckServiceList.EXPECTED_LIST = expectedList;
            }


            if (typeof(exitFunc) == "function") {
                CheckSetSettingsCheckServiceList.END = exitFunc;
                CheckSetSettingsCheckServiceList.manager(["SetSettings"]);
            }
            else {
                CheckSetSettingsCheckServiceList.manager(["Connect"]);
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
                    Utilities.print("2. Check and set settings");
                    Utilities.print("3. Verify service list");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                        function() {
                            CheckSetSettingsCheckServiceList.manager(["SetSettings"]);
                        },
                        2000
                    );
                },
                "SetSettings" : function() {
                    Utilities.print("Set and check settings.");
                    
                    Scan.settingsHandler(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "TV settings are applied "
                                            + "successfully.");
                            CheckSetSettingsCheckServiceList.manager(["CheckSettings"]);
                        },
                        CheckSetSettingsCheckServiceList.TV_SETTINGS,
                        Scan.getSetCheck,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "TV settings were "
                                            + "not applied.");
                            CheckSetSettingsCheckServiceList.manager(["EndTest"]);
                        }
                    );
                },


                "CheckSettings" : function() {
                    Scan.checkSettings(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "TV settings are checked "
                                            + "successfully.");
                            CheckSetSettingsCheckServiceList.manager(["CheckList"]);
                        },
                        CheckSetSettingsCheckServiceList.TV_SETTINGS,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "TV settings were "
                                            + "not checked.");
                            CheckSetSettingsCheckServiceList.manager(["EndTest"]);
                        }
                    );
                },

                "CheckList" : function() {
                    CheckServiceList.startTest(CheckSetSettingsCheckServiceList.SERVICELIST_NAME,
                            CheckSetSettingsCheckServiceList.EXPECTED_LIST,
                            function(){CheckSetSettingsCheckServiceList.manager(["EndTest"])}
                    )
                },
                "EndTest" : function() {
                     CheckSetSettingsCheckServiceList.END();
                }
            };
            steps[args[0]](args.splice(1, 1));
        }
    }
}
