include('../Utilities.js');
include('../Messages.js');
include('../ChannelChange.js');

init = function () {

    /** @namespace
     * Test script for Auto scan
     * @requires Library: {@link Utilities},
     * {@link Messages}, {@link ChannelChange}
     */
    CamAuthenticationCheck = {

        SERVICE_LIST: "",
        SERVICE_NAME: "",
        SERVICE_TYPE: "",
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
         * @param {String} serviceList
         * Name of a service list will be searched for the service
         * @param {String} serviceName
         * Name of the scrambled service
         * @param {Number} serviceType
         * Type of the scrambled service
         * @param {function} [endFunc = function() {
         *   Utilities.print("Test finished.");
         *   Utilities.printTestResult();
         *   Utilities.endTest();
         * }]
         * Function will be called on the test end
         * @requires Library: {@link Utilities}
         */
        startTest: function (serviceList,
                             serviceName,
                             serviceType,
                             exitFunc) {

            if ( typeof(exitFunc) == "function") {
                CamAuthenticationCheck.END = exitFunc;
            }

            if ( typeof(serviceList) != "string" || serviceList == "") {
                Utilities.print("#ERROR: "
                                + "Mandatory parameter 'serviceList' is missed"
                                + ". The test cannot be executed.");
                CamAuthenticationCheck.END(false);
            }
            else {
                CamAuthenticationCheck.SERVICE_LIST = serviceList;
            }
            if ( typeof(serviceName) != "string" || serviceName == "") {
                Utilities.print("#ERROR: "
                                + "Mandatory parameter 'serviceName' is missed"
                                + ". The test cannot be executed.");
                CamAuthenticationCheck.END(false);
            }
            else {
                CamAuthenticationCheck.SERVICE_NAME = serviceName;
            }
            if ( typeof(serviceType) != "number") {
                Utilities.print("#ERROR: "
                                + "Mandatory parameter 'serviceType' is missed"
                                + ". The test cannot be executed.");
                CamAuthenticationCheck.END(false);
            }
            else {
                CamAuthenticationCheck.SERVICE_TYPE = serviceType;
            }
            if ( typeof(exitFunc) == "function") {
                CamAuthenticationCheck.manager(["SwitchToScrambled"]);
            }
            else {
                CamAuthenticationCheck.manager(["Connect"]);
            }
        },

        /**
         * Execution of channel change to the scrambled service
         * and verification that it's descrambled by CAM
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof CamAuthenticationCheck
         * @requires Library: {@link Utilities}, {@link Messages},
         * {@link ChannelChange}
         */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Switch to the scrambled channel.");
                    Utilities.print("3. Check that OSD that the service is "
                                    + "scrambled is not available.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(function(){
                        CamAuthenticationCheck.manager(["SwitchToScrambled"]);
                    }, 2000);
                },
                "SwitchToScrambled" : function() {
                    ChannelChange.zapToServiceByName(
                        function() {
                            Utilities.print("#VERIFICATION PASSED: "
                                            + "Channel change was"
                                            + " executed successfully.");
                            CamAuthenticationCheck.manager(
                                ["CloseUnnecessaryOSDs"]
                            );
                        },
                        CamAuthenticationCheck.SERVICE_NAME,
                        CamAuthenticationCheck.SERVICE_TYPE,
                        CamAuthenticationCheck.SERVICE_LIST,
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Channel change was not"
                                            + " executed properly.");
                            CamAuthenticationCheck.manager(
                                ["EndTest"]
                            );
                        }
                    );
                },
                "CloseUnnecessaryOSDs" : function() {
                        Messages.closeMessages(
                            function() {
                                Utilities.print(
                                    "#VERIFICATION FAILED: "
                                        + "OSD about the scambled service is "
                                        + "available. "
                                        + "CAM was not authenticated.");
                                CamAuthenticationCheck.manager(
                                    ["EndTest"]
                                );
                            },
                            Message.RGCIP,
                            function() {
                                Utilities.print(
                                    "#VERIFICATION PASSED: "
                                        + "The current service is descrambled."
                                        + " CAM authenticated successfully.");
                                CamAuthenticationCheck.manager(
                                    ["EndTest", true]
                                );
                            },
                            function() {
                                CamAuthenticationCheck.manager(
                                    ["EndTest"]);
                            }
                        );
                },
                "EndTest" : function(result) {
                    CamAuthenticationCheck.END(result[0]||false);
                }
            }
            steps[args[0]](args.splice(1, 1));
        }
    }
}
