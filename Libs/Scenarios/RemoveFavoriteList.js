include('../Utilities.js');
include('../ServiceList.js');

init = function () {

    /** @namespace
     * Test script for verification servicelist.
     * List is selected by name
     * @requires Library: {@link Utilities}, {@link ServiceList}
     */
    RemoveFavoriteList = {

        SERVICELIST_NAME: "",
        END: function(){
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        },

        /**
         * Set test variables and start test execution.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof RemoveFavoriteList
         *
         * @param {string} listName
         * Full list name that should be removed.
         *
         * @param {string} [exitFunc = function() {
         *  Utilities.print("Test finished.");
         *  Utilities.printTestResult();
         *  Utilities.endTest()
         *  },]
         * Function that should be called as the final step.
         * If parameter is not set, test will be finished with result printing.
         * @requires Library: {@link Utilities}
         */
        startTest: function (listName,
                             exitFunc) {
            if ( typeof(exitFunc) == "function") {
                RemoveFavoriteList.END = exitFunc;
            }

            if ( typeof(listName) != "string" || listName == "") {
                Utilities.print("#ERROR: Favorite list name was not "
                                + "specified.");
                RemoveFavoriteList.END();
            }
            else {
                RemoveFavoriteList.SERVICELIST_NAME = listName;
            }

            if ( typeof(exitFunc) != "function") {
                RemoveFavoriteList.manager(["Connect"]);
            }
            else {
                RemoveFavoriteList.manager(["GetListUID"]);
            }

        },

        /**
         * Remove the favorite list
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof RemoveFavoriteList
         * @requires Library: {@link Utilities}, {@link ServiceList}
         */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Get the favorite list UID "
                                    + "by list name.");
                    Utilities.print("3. Remove the list.");
                    Utilities.print("4. Verify removal results.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV( function(){
                        RemoveFavoriteList.manager(["GetListUID"]);
                    });
                },
                "GetListUID" : function() {
                    Utilities.print('Retrieving the list UID...');
                    ServiceList.getServicelistUID(
                        function(listUID) {
                            RemoveFavoriteList.manager(
                                ["RemoveList", listUID]
                            );
                        },
                        RemoveFavoriteList.SERVICELIST_NAME
                    );
                },
                // TODO: Implement removal of several lists matching the name
                "RemoveList" : function(UID) {
                    if (Utilities.numberOfElements(UID[0]) == 0) {
                        Utilities.print("#VERIFICATION FAILED: Favorite list '"
                                        + RemoveFavoriteList.SERVICELIST_NAME
                                        + "' is not found.");
                        RemoveFavoriteList.manager(['EndTest']);
                    }
                    else if ( Utilities.numberOfElements(UID[0]) != 1) {
                        Utilities.print("#ERROR: "
                                        + Utilities.numberOfElements(UID[0])
                                        + " servicelists matching '"
                                        + RemoveFavoriteList.SERVICELIST_NAME
                                        + "' are found. "
                                        + "Removal of several lists "
                                        + " is not supported");
                        RemoveFavoriteList.manager(['EndTest']);
                    }
                    else {
                        Utilities.print("#VERIFICATION PASSED: List '"
                                        + RemoveFavoriteList.SERVICELIST_NAME
                                        + "' was found.");
                        ServiceList.removeFavoriteList(
                            function() {
                                Utilities.print("#VERIFICATION PASSED: "
                                                + "Removal action "
                                                + "was successful." );
                                RemoveFavoriteList.manager(["CheckList"]);
                            },
                            UID[0][0],
                            function() {
                                Utilities.print("#ERROR: "
                                                + "Removal action failed.");
                                RemoveFavoriteList.manager(['EndTest']);
                            }
                        );
                    }
                },
                "CheckList" : function() {
                    Utilities.print('Retrieving the removed list UID...');
                    ServiceList.getServicelistUID(
                        function(listUID) {
                            RemoveFavoriteList.manager(
                                ["CheckResult", listUID]
                            );
                        },
                        RemoveFavoriteList.SERVICELIST_NAME
                    );
                },
                "CheckResult" : function(UID) {
                    if (Utilities.numberOfElements(UID[0]) == 0) {
                        Utilities.print("#VERIFICATION PASSED: List '"
                                        + RemoveFavoriteList.SERVICELIST_NAME
                                        + "' was removed.");
                        RemoveFavoriteList.manager(
                            ['EndTest', true]
                        );
                    }
                    else {
                        Utilities.print("#VERIFICATION FAILED: List '"
                                        + RemoveFavoriteList.SERVICELIST_NAME
                                        + "' was found.");
                        RemoveFavoriteList.manager(['EndTest']);
                    }
                },
                "EndTest" : function(result){
                    RemoveFavoriteList.END(result[0]||false);
                }
            };
            steps[args[0]](args.splice(1, 1));
        }

    }
}
