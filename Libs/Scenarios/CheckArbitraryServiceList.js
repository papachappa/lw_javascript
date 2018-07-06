include('../Utilities.js');
include('../ServiceList.js');
include('../Compare.js');

init = function () {

    /** @namespace
     * Test script for verification of service list with custom list of fields
     * List is selected by name
     * @requires Library: {@link Utilities}, {@link ServiceList},
     * {@link Compare}
     */
    CheckArbitraryServiceList = {

        SERVICELIST_NAME: "#3052",
        EXPECTED_RESULT: "DNC",
        FIELDS: [SL_Fields.SERVICE_NAME, SL_Fields.CHANNEL_NUMBER,
                 SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID,
                 SL_Fields.MEDIA_TYPE, SL_Fields.SERVICE_VISIBLE,
                 SL_Fields.SERVICE_SELECTABLE],
        HASH: [SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID],
        CURRENT_LIST: undefined,
        FILTERS: {},
        END: function() {
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest();
        },

        /**
         * Set test variables and start test execution.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof CheckArbitraryServiceList
         *
         * @param {string} [listName = "OVERALL"]
         * Full name of the service list under test.
         * Failure will be returned if the specified list does not exist.
         * If name is "" or DO_NOT_CHANGE/DO_NOT_CHECK, then overall list will
         * be checked.
         *
         * @param {array} [fields]
         * Fields (service parameters) should be verified.
         *
         * @param {object} [filters={}]
         * Dictionary describing selection fields values. Its keys are field
         * numbers in the service list, its values filter on exact match
         * fields encoded by keys.
         *
         * @param {array} [hash = [SL_Fields.SID, SL_Fields.TSID,
         *                         SL_Fields.ONID]]
         * Fields that will be used for unique service identification.
         *
         *
         * @param {array} [expectedResult]
         * List of all services present in the service list under test
         * Each service should be described by the same parameter set and in
         * the same order as it's specified in the "fields" parameter.
         * ATTENTION! PRESUMABLE VERIFICATION OF EMPTY SERVICELIST WILL NOT
         * WORK BECAUSE OF USING Utilities.getTableValues
         *
         * @param {function} [exitFunc=function() {
         *                                 Utilities.print("Test finished.");
         *                                 Utilities.printTestResult();
         *                                 Utilities.endTest();
         *                               }]
         * Function that should be called at the end of the test.
         * If parameter is not set, test will be finished with result printing.
         * @example
         *
         * Format of fields
         * var fields = [ServiceList.Name, SL_Fields.SID, SL_Fields.TSID,
         *              SL_Fields.ONID, SL_Fields.MEDIA_TYPE];
         *
         * Structure of filters
         * var filters = {
         *      SL_Fields.MEDIA_TYPE: MediaType.TV
         * };
         *
         * Structure of expected result based on the example of fields above
         * var expectedServiceList = [
         *     [ 'Name1', '101', '900', '272', '4' ],
         *     [ 'Name2', '102', '900', '272', '4' ],
         *     [ 'Name3', '103', '900', '272', '8' ]
         * ];
         * @requires Library: {@link Utilities}
         */
        startTest: function (listName,
                             fields,
                             filters,
                             hash,
                             expectedResult,
                             exitFunc) {
            if ( typeof(exitFunc) == "function") {
                CheckArbitraryServiceList.END = exitFunc;
            }

            if (typeof(listName) == "string" && listName != ""
                && listName != "DNC") {
                CheckArbitraryServiceList.SERVICELIST_NAME = listName;
            }
            else {
                Utilities.print("INFO: Overall list will be checked.");
            }

            if (Array.isArray(expectedResult)) {
                CheckArbitraryServiceList.EXPECTED_RESULT = expectedResult;
            }
            else {
                if (CheckArbitraryServiceList.SERVICELIST_NAME == "OVERALL") {
                    Utilities.print("#ERROR: Availability of the overall "
                                    + "service list cannot be verified.");
                    CheckArbitraryServiceList.END(false);
                }
                Utilities.print("INFO: Only availability of '" + listName
                                + "' will be checked.");
            }
            if (Array.isArray(hash) && hash.length != 0) {
                CheckArbitraryServiceList.HASH = hash;
            }
            else {
                Utilities.print("INFO: Service triplet will be used as a hash "
                                + "for service identification.");
            }

            if (Array.isArray(fields) && fields.length != 0) {
                // Check that the 'fields' contains ones will be used for hash
                if (CheckArbitraryServiceList.HASH.every(function(item) {
                    return fields.indexOf(item) != -1; })) {
                    CheckArbitraryServiceList.FIELDS = fields;
                }
                else {
                    Utilities.print(
                        "#ERROR: List of fields doesn't contain ones necessary "
                            + "for service identification.\nVerify 'hash', "
                            + "'fields' and 'expectedResult' parameters.");
                    CheckArbitraryServiceList.END(false);
                }
            }
            else {
                if (CheckArbitraryServiceList.EXPECTED_RESULT != "DNC") {
                    Utilities.print("INFO: Default fields set will be "
                                    + "requested:\n"
                                    + CheckArbitraryServiceList.FIELDS.map(
                                        function(item) {
                                            return Utilities.getKey(SL_Fields,
                                                                    item);
                                        }));
                }
            }
            if (typeof(filters) == "object"
                && Object.keys(filters).length != 0) {
                CheckArbitraryServiceList.FILTERS = filters;
            }
            else {
                if (CheckArbitraryServiceList.EXPECTED_RESULT != "DNC") {
                    Utilities.print("INFO: All services will be requested.");
                }
            }

            if ( typeof(exitFunc) == "function") {
                CheckArbitraryServiceList.manager(["GetListUID"]);
            }
            else {
                CheckArbitraryServiceList.manager(["Connect"]);
            }
        },

        /**
         * Compare all services from the service list under test with expected
         * result.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof CheckArbitraryServiceList
         * @requires Library: {@link Utilities}, {@link ServiceList},
         * {@link Compare}
         */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Connect PC to TV.");
                    Utilities.print("2. Get service list UID by list name.");
                    Utilities.print("3. Get services from the list.");
                    Utilities.print("4. Compare service list with expected "
                                    + "result.");
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV( function(){
                        CheckArbitraryServiceList.manager(["GetListUID"]);
                    });
                },
                "GetListUID" : function() {
                    if (CheckArbitraryServiceList.SERVICELIST_NAME == "OVERALL"
                       ) {
                        CheckArbitraryServiceList.manager(["GetServices", ""]);
                    }
                    else {
                        ServiceList.getServicelistUID( function(listUID){
                            CheckArbitraryServiceList.manager(["CheckList",
                                                               listUID]);
                        }, CheckArbitraryServiceList.SERVICELIST_NAME);
                    }
                },
                // Added as a separate step to skip this verification for
                // overall list
                "CheckList" : function(UIDs) {
                    var UIDS = UIDs[0];
                    var UID = UIDs[0];
                    if (UIDs.length == 0) {
                        Utilities.print(
                            "#VERIFICATION FAILED: service list '"
                                + CheckArbitraryServiceList.SERVICELIST_NAME
                                + "' is not found.");
                        CheckArbitraryServiceList.manager(['EndTest']);
                    }
                    else {
                        if (UIDs.length != 1) {
                            Utilities.print(
                                "WARN: " + UIDs.length + " service lists '"
                                    + CheckArbitraryServiceList
                                    .SERVICELIST_NAME
                                    + "' are found. The first one will be "
                                    + "checked.");
                        }
                        Utilities.print(
                            "#VERIFICATION PASSED: List '"
                                + CheckArbitraryServiceList.SERVICELIST_NAME
                                + "' exists.");
                        CheckArbitraryServiceList.manager(
                            ["GetServices", UID]);
                    }
                },
                "GetServices" : function(UID) {
                    if (CheckArbitraryServiceList.EXPECTED_RESULT != "DNC") {
                        var UID = UID[0];
                        ServiceList.getFilteredServicesFromList(
                            function(services) {
                                CheckArbitraryServiceList.manager(
                                    ["CheckResult", services]);
                            },
                            String(UID),
                            CheckArbitraryServiceList.FILTERS,
                            CheckArbitraryServiceList.FIELDS
                        );
                    }
                    else {
                        CheckArbitraryServiceList.manager(['EndTest']);
                    }
                },
                "CheckResult" : function(services) {
                    var services = services[0];
                    CheckArbitraryServiceList.CURRENT_LIST = services;
                    Utilities.print("Comparing services...");
                    // Hash function
                    function makeIndex(line) {
                        return CheckArbitraryServiceList.HASH.map(
                            function(item) {
                                return line[
                                    CheckArbitraryServiceList.FIELDS.indexOf(
                                        item)];
                            }).join("-");
                    }
                    // Headers for result pretty printing
                    var logLabels = CheckArbitraryServiceList.FIELDS.map(
                        function(item) {
                            return Utilities.getKey(SL_Fields, item);
                        });

                    var actualResult = Compare.makeDictionary(
                        CheckArbitraryServiceList.EXPECTED_RESULT,
                        services,
                        makeIndex
                    );
                    CheckArbitraryServiceList.manager(
                        ['EndTest', Compare.compareDictionaries(actualResult,
                                                                logLabels)]);
                },
                "EndTest" : function(result) {
                    function prettyPrint(arr) {
                        return arr.reduce(
                            function(accum, itm) {
                                return accum + '"' + String(itm) + '", '
                            },
                            "[ "
                        ).slice(0, -2) + " ],";
                    }

                    if (result[0] != true) {
                        if (CheckArbitraryServiceList.CURRENT_LIST !== undefined) {
                            Utilities.print("");
                            Utilities.print("Actual list:");
                            CheckArbitraryServiceList.CURRENT_LIST.forEach(
                                function(item) {
                                    Utilities.print(prettyPrint(item));
                                }
                            )
                        }
                    }
                    CheckArbitraryServiceList.END(result[0]||false);
                }
            }
            steps[args[0]](args.slice(1));
        }
    }
}
