include('../Utilities.js');
include('../Compare.js');
include('../EPGquery.js');
include('../PressButton.js');
include('../Enumerators.js');

init = function () {

    /** @namespace
     * Test script for verification of EPG content
     * @requires Library: {@link Utilities}, {@link Compare}, {@link EPGquery}
     */
    GetEPGdata = {
        SERVICES: [],
        FILTERS: {},
        FIELDS: [EPG.SID, EPG.TSID, EPG.ONID, EPG.EID],
        EPG_NAVIGATION: [],
        EXPECTED_RESULT: [],
        ACTUAL_RESULT: [],
        END: function() {
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest();
        },
        /**
         * Set test variables and start test execution.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof GetEPGdata
         *
         * @param {array} services
         * Array of triplets describing services to be checked. Each triplet
         * is a vector [channel number, service media type, service list name]
         *
         * @param {array} [filters={}]
         * Dictionary describing selection fields values. Its keys are fields
         * numbers in the EPG table, values are exact values of corresponding
         * fields that should be satisfied during selection from EPG tables
         *
         * @param {array} [optionalFields = []]
         * Vector of fields should be present and verified in result.
         * SID, TSID, ONID and EID are mandatory fields and would be verified
         * always. Other fields can be specified via this parameter.
         *
         * @param {array} [expectedResult = []]
         * Array containing EPG lines to be checked. Its format (fields and
         * their order) should exactly match the next format:
         * [SID, TSID, ONID, EID, optionalFields in the same order]
         *
         * @param {function} [exitFunction=function() {
         *   Utilities.print("Test finished.");
         *   Utilities.printTestResult();
         *   Utilities.endTest();
         * }]
         * Function that will be called at the end of test
         * with test result (true/false) as its only parameter
         *
         * @example
         * Structure of services
         * var services = [
         *      [1, MediaType.TV, "DVB-S"],
         *      [8, MediaType.TV, "DVB-S"],
         *      [3, MediaType.RADIO "DVB-S"],
         * ];
         *
         * Structure of filters
         * var filters = {
         *      EPG.START_TIME: 1422543000,
         *      EPG.END_TIME: 1422544800,
         *      EPG.TITLE: "Benedict"
         * };
         *
         * Structure of optional fields
         * var optionalFields = [EPG.TITLE, EPG.RATING];
         *
         * Structure of expected result
         * For examples above each line in expected result has format
         * [SID, TSID, ONID, EID, EPG.TITLE, EPG.RATING]
         *
         * var expectedResult = [
         *     [10301, 1019, 1, 31089, "Benedict", -1],
         *     [10302, 1019, 1, 31040, "Benedict", -1]
         * ];
         * @requires Library: {@link Utilities}
         */
        startTest: function (services,
                             filters,
                             optionalFields,
                             expectedResult,
                             EPGnavigation,
                             exitFunc) {
            if (Array.isArray(EPGnavigation)) {
                GetEPGdata.EPG_NAVIGATION = EPGnavigation;
            }
            else if (typeof(EPGnavigation) == "number") {
                GetEPGdata.EPG_NAVIGATION = [EPGnavigation, 0, 0, 0, 0, 0];
            }
            if (typeof(exitFunc) == "function") {
                GetEPGdata.END = exitFunc;
            }

            if (Array.isArray(services) && services.length != 0) {
                GetEPGdata.SERVICES = services;
            }
            else {
                Utilities.print("#ERROR: Mandatory parameter 'services' is not specified or has wrong format. Test is terminated.");
                GetEPGdata.END(false);
            }

            if (Array.isArray(expectedResult)) {
                GetEPGdata.EXPECTED_RESULT = expectedResult;
            }
            else {
                Utilities.print("#ERROR: Mandatory parameter 'expectedResult' is not specified or has wrong format. Test is terminated.");
                GetEPGdata.END(false);
            }

            if (typeof(filters) == "object"
                 && Object.keys(filters).length != 0) {
                        GetEPGdata.FILTERS = filters;
            }
            else {
                Utilities.print("WARN: No filter is specified. All events for specified services will be checked.");
            }

            // Fields present in expected result
            if (Array.isArray(optionalFields) && optionalFields.length != 0) {
                GetEPGdata.FIELDS = GetEPGdata.FIELDS.concat(optionalFields);
            }
            else {
                Utilities.print("WARN: No optional field is specified. Only mandatory fields will be checked.");
            }

            if (typeof(exitFunc) == "function") {
                if (GetEPGdata.EPG_NAVIGATION[0] == 1) {
                    GetEPGdata.manager(["OpenEPGmenu"]);
                }
                else {
                    GetEPGdata.manager(["GetEPGinfo"]);
                }
            }
            else {
                GetEPGdata.manager(["Connect"]);
            }
        },

        /**
         * Get EPG table content and compare it with expected result.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof GetEPGdata
         */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    //print test description:
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print("1. Collect test result for all services.");
                    Utilities.print("2. Compare test result with expected.")
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                        function() {
                            if (GetEPGdata.EPG_NAVIGATION[0] == 1) {
                                GetEPGdata.manager(["OpenEPGmenu"]);
                            }
                            else {
                                GetEPGdata.manager(["GetEPGinfo"]);
                            }
                        },
                        2000);
                },
                "OpenEPGmenu" : function(flag) {
                    var epgRequsted = de.loewe.sl2.i32.epg.schedule.requested;          
                    PressButton.singlePress(Key.END);
                    PressButton.singlePress(Key.END);
                    PressButton.singlePress(Key.EPG);
                    setTimeout(
                        function(){
                            PressButton.singlePress(Key.END);
                            setTimeout(
                                function(){
                                    PressButton.singlePress(Key.END);
                                    PressButton.pressWithDelay(Key.EPG, 3,
                                        function(){
                                            if (epgRequsted.getValue() == 1) {
                                                GetEPGdata.manager(["EPGnavigation", GetEPGdata.EPG_NAVIGATION[1]]);
                                            }
                                            else if (flag[0] != 1) {
                                                GetEPGdata.manager(["OpenEPGmenu", 1]);
                                            }
                                            else {
                                                Utilities.print("WARN: EPG menu was not opened.");
                                                Utilities.print("WARN: Events will be checked w/o navigation through EPG menu.");
                                                GetEPGdata.manager(["GetEPGinfo"]);
                                            }
                                        }
                                    );
                                },1000
                            );
                        },3000
                    );
                },
                "EPGnavigation" : function(direction) {
                    var direction = direction[0]
                    //if no navigation is needed (down and up directions)
                    if (GetEPGdata.EPG_NAVIGATION[2] == 0 && GetEPGdata.EPG_NAVIGATION[4] == 0) {
                        PressButton.singlePress(Key.END);
                        PressButton.singlePress(Key.END);
                        GetEPGdata.manager(["GetEPGinfo"]);
                    }
                    else if (direction == "Down") {
                        if (GetEPGdata.EPG_NAVIGATION[2] == 0) {
                            GetEPGdata.manager(["EPGnavigation", "Up"]);
                        }
                        else {
                            GetEPGdata.EPG_NAVIGATION[2]--;
                            for (i = 0; i< GetEPGdata.EPG_NAVIGATION[3]; i++) {
                                PressButton.singlePress(Key.DOWN);
                            }
                            for (j = 1; j< GetEPGdata.EPG_NAVIGATION[6]; j++) {
                                PressButton.singlePress(Key.RIGHT);
                            }
                            PressButton.pressWithDelay(Key.RIGHT, 3,
                                function(){
                                    GetEPGdata.manager(["EPGnavigation", "Down"]);
                                }
                            )
                        }
                    }
                    else {
                        if (GetEPGdata.EPG_NAVIGATION[4] == 0) {
                            GetEPGdata.manager(["EPGnavigation", "Down"]);                            
                        }
                        else {
                            GetEPGdata.EPG_NAVIGATION[4]--;
                            for (i = 0; i< GetEPGdata.EPG_NAVIGATION[5]; i++) {
                                PressButton.singlePress(Key.UP);
                            }
                            for (j = 1; j< GetEPGdata.EPG_NAVIGATION[6]; j++) {
                                PressButton.singlePress(Key.RIGHT);
                            }
                            PressButton.pressWithDelay(Key.RIGHT, 3,
                                function(){
                                    GetEPGdata.manager(["EPGnavigation", "Up"]);
                                }
                            )
                        }
                    }
                },
                "GetEPGinfo" : function() {
                    EPGquery.getEPG(
                        function(result) {
                            GetEPGdata.manager(["CompareResults", result]);
                        },
                        GetEPGdata.SERVICES,
                        GetEPGdata.FILTERS,
                        GetEPGdata.FIELDS,
                        function() {
                            GetEPGdata.manager(["EndTest"]);
                        });
                },
                "CompareResults" : function(result) {
                    var result = result[0];
                    Utilities.print("Checking EPG information...");
                    function createIndex(line) {
                        // Hash is "SID-TSID-ONID-EID"
                        return [line[0], line[1], line[2], line[3]].join("-");
                    }
                    // Headers for result pretty printing
                    var logLabels = GetEPGdata.FIELDS.map(function(item) {
                        return Utilities.getKey(EPG, item);
                    });

                    // Cut generated part of Event ID
                    var eventID;
                    var lengthToCut;
                    function cutEventID(event) {
                        eventID = parseInt(event[3],10);
                        if (eventID < 0) {
                            eventID = (Math.pow(2, 32) + eventID).toString(2);
                        }
                        else {
                            eventID = eventID.toString(2);
                        }
                        lengthToCut = (eventID.length - 16);
                        event[3] = parseInt(eventID.substring(lengthToCut),2);
                    }
                    GetEPGdata.EXPECTED_RESULT.forEach(
                        function(item) {
                            cutEventID(item);
                        }
                    );
                    result.forEach(
                        function(item) {
                            cutEventID(item);
                        }
                    );
                    // Make dictionary from expected,
                    // query results and hash
                    var resultDict = Compare.makeDictionary(
                        GetEPGdata.EXPECTED_RESULT, result, createIndex);
                    if (Compare.compareDictionaries(resultDict, logLabels)
                            != true) {
                        Utilities.print("#VERIFICATION FAILED: Actual list is NOT equal to expected.");
                        if (result.length != 0) {
                            if (result.length > 1000) {
                                Utilities.print("Actual list consist more than 1000 events. It's printing will be cancelled to avoid blocking of the test.");
                            }
                            else {
                                Utilities.print("");
                                Utilities.print("Actual list:");
                                result.forEach(function(item) {
                                    Utilities.print(
                                        item.reduce(function(accum, itm){
                                            return accum + '"' + String(itm)
                                                    + '", '
                                        }, "[ ").slice(0, -2) + " ],"
                                    );
                                });
                            }
                        }
                        else {
                            Utilities.print("");
                            Utilities.print("Actual list is empty or does not exist.");
                        }
                        GetEPGdata.manager(["EndTest"]);
                    }
                    else {
                        GetEPGdata.manager(["EndTest", true]);
                    }
                },
                "EndTest" : function(result) {
                    GetEPGdata.END(result[0]||false);
                }
            }
            steps[args[0]](args.slice(1));
        }
    }
}
