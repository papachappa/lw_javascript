include('../Utilities.js');
include('../ChannelChange.js');
include('../ServiceList.js');

init = function () {

    /** @namespace
     * Test script for Auto scan
     * @requires Library: {@link Utilities}, {@link Scan},
     * {@link Antenna}, {@link ChannelChange}
     */
    FinalCheck = {

        SERVICE_LIST: "",
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
         * Name of a service list will be searched for services
         * @param {function} [endFunc = function() {
         *   Utilities.print("Test finished.");
         *   Utilities.printTestResult();
         *   Utilities.endTest();
         * }]
         * Function will be called on the test end
         * @requires Library: {@link Utilities}
         */
        startTest: function (serviceList,
                             exitFunc) {

            if ( typeof(exitFunc) == "function") {
                FinalCheck.END = exitFunc;
            }

            if ( typeof(serviceList) != "string" ) {
                Utilities.print("#ERROR: "
                                + "Mandatory parameter 'serviceList' is missed"
                                + "The test cannot be executed.");
                FinalCheck.END(false);
            }
            else {
                FinalCheck.SERVICE_LIST = serviceList;
            }

            if ( typeof(exitFunc) == "function") {
                FinalCheck.manager(["DefineListUUID"]);
            }
            else {
                FinalCheck.manager(["Connect"]);
            }
        },

        /**
         * Execution of channel change to selectable services
         * of different media types
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof FinalCheck
         * @requires Library: {@link Utilities},
         * {@link ChannelChange}, {@link ServiceList.js}
         */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Define suitable services "
                                    + "to be changed to.");
                    Utilities.print("3. Switch to all found channels "
                                    + "one by one");
                    Utilities.print("4. Check correctness of every channel "
                                    + "change.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(function(){
                        FinalCheck.manager(["DefineListUUID"]);
                    }, 2000);
                },
                "DefineListUUID" : function() {
                    Utilities.print("Defining the service list UUID...");
                    ServiceList.getServicelistUID(
                        function(UUID) {
                            FinalCheck.manager(["SelectAllServices", UUID]);
                        },
                        FinalCheck.SERVICE_LIST
                    );
                },
                "SelectAllServices" : function(UUID) {
                    if (UUID[0].length) {
                        Utilities.print("Collecting all suitable services...");
                        ServiceList.getServicesFromList(
                            function(services) {
                                FinalCheck.manager(
                                    ["SelectServices",
                                     services]
                                );
                            },
                            UUID[0][0],
                            [6, 21, 25]
                        );
                    }
                    else {
                        Utilities.print("#ERROR: Service list "
                                        + FinalCheck.SERVICE_LIST
                                        + " is not found");
                        FinalCheck.manager(
                            ["EndTest"]
                        );
                    }
                },
                "SelectServices" : function(services) {
                    var servicesToSwitch = [];
                    Utilities.print("Selecting services...");
                    if (services) {
                        servicesToSwitch.push(
                            services[0].filter(
                                function(item) {
                                    return (item[1] == 8 && item[2] == 1);
                                }
                            )[0]
                        );
                        servicesToSwitch.push(
                            services[0].filter(
                                function(item) {
                                    return (item[1] == 4 && item[2] == 1);
                                }
                            )[0]
                        );
                        if (servicesToSwitch.length == 1) {
                            Utilities.print(
                                "WARN: Only a "
                                    + (servicesToSwitch[0][1] == 4?
                                       "TV":"Radio")
                                    + " service found."
                            );
                        }
                        FinalCheck.manager(
                            ["SwitchChannel", servicesToSwitch]
                        );
                    }
                    else {
                        Utilities.print("#ERROR: Service list "
                                        + FinalCheck.SERVICE_LIST
                                        + " is empty.");
                        FinalCheck.manager(
                            ["EndTest"]
                        );
                    }
                },
                "SwitchChannel" : function(services) {
                    if (services[0].length) {
                        var currentService = services[0].pop();
                        ChannelChange.zapWithVerification(
                            function() {
                                Utilities.print("#VERIFICATION PASSED: "
                                                + "Channel change was"
                                                + " executed successfully.");
                                FinalCheck.manager(
                                    ["SwitchChannel",
                                     services[0]]
                                );
                            },
                            currentService[0],
                            currentService[1],
                            FinalCheck.SERVICE_LIST,
                            function() {
                                Utilities.print("#VERIFICATION FAILED: "
                                                + "Channel change was not"
                                                + " executed properly.");
                                FinalCheck.manager(
                                    ["EndTest"]
                                );
                            }
                        );
                    }
                    else {
                        Utilities.print("#VERIFICATION PASSED: All channel "
                                        + "changes executed successfully.");
                        FinalCheck.manager(
                            ["EndTest", true]
                        );
                    }
                },
                "EndTest" : function(result) {
                    FinalCheck.END(result[0]||false);
                }
            }
            steps[args[0]](args.splice(1, 1));
        }
    }
}
