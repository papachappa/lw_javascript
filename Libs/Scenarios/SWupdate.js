include('../Utilities.js');
include('../ServiceMode.js');
include('../SoftwareUpdate.js');

init = function () {

    /** @namespace
     * Test script for software update
     * @requires Library: {@link Utilities}
     */
    SWupdate = {

        SOURCE: "",
        VERSION: "",
        IMAGES: "",
        OLD_VERSIONS: "",
        END: function() {
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            setTimeout(function(){jbiz.exit()},1500);
        },
        /**
         * Set test variables and start test execution.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof SWupdate
         *
         * @param {number} oldVersions
         * Flag whether SW versions older than the current one should be
         * searched
         *
         * @param {number} source
         * Source the new SW should be downloaded from
         *
         * @param {string} version
         * expected SW version
         *
         * @param {array} images
         * List of images to be updated. Besides of a list of names,
         * e.g. ["FEA", "FreemanD", "BootD"] next keywords are supported:
         * <br/> - "all" - update all images independently if they have an
         * actual version or not;
         * <br/> - "DO_NOT_CHANGE" - update only images having a new version
         *
         * @param {function} [exitFunc = function(){
         *    Utilities.print("Test finished.");
         *    Utilities.printTestResult();
         *    Utilities.endTest()
         *    }]
         * Function that should be called at the end.
         * If the parameter is set the entire SWupdate script will be executed
         * as a test step, i.e. connection and test finalization won't be
         * executed.
         * If the parameter is not set, the script will be executed as a
         * separate test, i.e. connection to TV will be called as a first step
         * and the entire test will be finished with result printing.
         *
         * @requires Library: {@link Utilities}
         */
        startTest: function (source,
                             version,
                             images,
                             oldVersions,
                             exitFunc) {
            if ( typeof(exitFunc) == "function") {
                SWupdate.END = exitFunc;
            }

            if ( typeof(source) != "number") {
                Utilities.print("#ERROR: Source of SW update is not specified."
                                + "\nTest cannot be executed.");
                SWupdate.END(false);
            }
            else {
                SWupdate.SOURCE = source;
            }

            if (typeof(version) == "string" && version != "") {
                SWupdate.VERSION = version;
            }
            else {
                Utilities.print("#ERROR: New SW version is not specified."
                                + "\nTest cannot be executed.");
                SWupdate.END(false);
            }

            if ((Array.isArray(images) && images.length > 0) ||
                images == "all" || images == "DNC") {
                SWupdate.IMAGES = images;
            }
            else {
                Utilities.print("#ERROR: Images to be updated are not "
                                + "specified.\nTest cannot be executed.");
                SWupdate.END(false);
            }

            if (oldVersions in [0, 1, "DNC"]) {
                SWupdate.OLD_VERSIONS = oldVersions;
            }
            else {
                Utilities.print("#ERROR: Undefined value of support of old SW "
                                + "versions.\nTest cannot be executed.");
                SWupdate.END(false);
            }

            if ( typeof(exitFunc) == "function") {
                SWupdate.manager(["SetOldVersions"]);
            }
            else {
                SWupdate.manager(["Connect"]);
            }
        },
        /**
         * Execute SW update
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof SWupdate
         * {@link Utilities}, {@link ServiceMode}, {@link SoftwareUpdate}
         */
        manager: function (args) {
            var steps = {
                "Connect": function() {
                    //print test description:
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Set support of older SW versions.");
                    Utilities.print("3. Select necessary SW version and "
                                    + "images.");
                    Utilities.print("4. Perform SW update.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(function() {
                        SWupdate.manager(["SetOldVersions"]);
                    }, 2000);
                },
                "SetOldVersions" : function() {
                    if (SWupdate.OLD_VERSIONS != "DNC") {
                        ServiceMode.setChassisOption(
                            function() {
                                Utilities.print("#VERIFICATION PASSED: Support"
                                                + " of old versions is set to " +
                                                + SWupdate.OLD_VERSIONS);
                                SWupdate.manager(["CheckInputVersion"]);
                            },
                            "OldSwVersions",
                            SWupdate.OLD_VERSIONS,
                            function() {
                                Utilities.print(
                                    "#VERIFICATION FAILED: Support of old "
                                        + "versions was not set.\nCurrent "
                                        + "value is '"
                                        + ServiceMode.getChassisOption(
                                            "OldSwVersions") + "'.");
                                SWupdate.manager(["EndTest"]);
                            }
                        );
                    }
                    else {
                        SWupdate.manager(["CheckInputVersion"]);
                    }
                },
                "CheckInputVersion": function() {
                    if (SWupdate.VERSION == "DNC" &&
                        ServiceMode.checkChassisOption("OldSwVersions", 1)) {
                        Utilities.print("#ERROR: Support of old SW version "
                                        + "is set to '1'. Expected SW "
                                        + "version should be specified "
                                        + "explicitly.");
                        SWupdate.manager(["EndTest"]);
                    }
                    else {
                        SWupdate.manager(["StartSearch"]);
                    }
                },
                "StartSearch" : function() {
                    if (SoftwareUpdate.isUpdateSourceReady(SWupdate.SOURCE)) {
                        SoftwareUpdate.packetSearch(
                            function() {
                                Utilities.print("#VERIFICATION PASSED: The "
                                                + "software is ready for "
                                                + "update.");
                                SWupdate.manager(["StartUpdate"]);
                            },
                            SWupdate.SOURCE,
                            SWupdate.VERSION,
                            function() {
                                Utilities.print("#VERIFICATION FAILED: The "
                                                + "expected software was not "
                                                + "found.");
                                SWupdate.manager(["EndTest"]);
                            }
                        );
                    }
                    else {
                        Utilities.print("#ERROR: The update source '"
                                        + SWupdate.SOURCE
                                        + "' is not available.");
                        SWupdate.manager(["EndTest"]);
                    }
                },
                "StartUpdate" : function() {
                    SoftwareUpdate.updateMonitor(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: Update "
                                            + "finished succesfully.");
                            SWupdate.manager(["EndTest", true]);
                        },
                        SWupdate.IMAGES,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: Update was "
                                            + "not finished as expected.");
                            SWupdate.manager(["EndTest"]);
                        }
                    );
                },
                "EndTest" : function(result) {
                    SWupdate.END(result[0]||false);
                }
            }
            steps[args[0]](args.splice(1, 1));
        }

    }
}
