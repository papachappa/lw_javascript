include('../Utilities.js');
include('../Compare.js');
include('../ServiceMode.js');
include('../EPGquery.js');

init = function () {

    /** @namespace
     * Test script for verification of EPG content
     * @requires Library: {@link Utilities}, {@link Compare}, {@link EPGquery},
     * {@link ServiceMode}
     */
    GetUpdatedEPGdata = {
        SERVICES: [],
        FILTERS: {},
        FIELDS: [EPG.SID, EPG.TSID, EPG.ONID, EPG.EID],
        TIME: 0,
        // The current time is expected to be no more than the test time in
        // 20 minutes limit
        TOLERANCE: 1200,
        EXPECTED_RESULT_BEFORE: "DNC",
        EXPECTED_RESULT_AFTER: [],
        ACTUAL_RESULT: [],
        TEST_RESULT: true,
        END: function() {
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest();
        },
        /**
         * Set test variables and start test execution.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof GetUpdatedEPGdata
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
         * @param {Number} [time]
         * Time of EPG update (in epoch time format)
         *
         * @param {array} [expectedResultBefore = DO_NOT_CHECK]
         * Array containing EPG lines to be checked before update.
         * Its format (fields and their order) should exactly match the next
         * format:
         * [SID, TSID, ONID, EID, optionalFields in the same order]
         *
         * @param {array} [expectedResultAfter]
         * Array containing EPG lines to be checked after update.
         * Its format (fields and their order) should exactly match the next
         * format:
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
         * var expectedResultAfter = [
         *     [10301, 1019, 1, 31089, "Benedict", -1],
         *     [10302, 1019, 1, 31040, "Benedict", -1]
         * ];
         * @requires Library: {@link Utilities}
         */
        startTest: function (services,
                             filters,
                             optionalFields,
                             time,
                             expectedResultBefore,
                             expectedResultAfter,
                             exitFunc) {

            if (typeof(exitFunc) == "function") {
                GetUpdatedEPGdata.END = exitFunc;
            }

            if (Array.isArray(services) && services.length != 0) {
                GetUpdatedEPGdata.SERVICES = services;
            }
            else {
                Utilities.print("#ERROR: Mandatory parameter 'services' is not"
                                + " specified or has wrong format. Test is "
                                + "terminated.");
                GetUpdatedEPGdata.END(false);
            }
            if (typeof(time) == "number") {
                GetUpdatedEPGdata.TIME = time;
            }
            else {
                Utilities.print("#ERROR: Mandatory parameter 'time'"
                                + "is not specified or has wrong format. "
                                + "Test is terminated.");
                GetUpdatedEPGdata.END(false);
            }
            if (Array.isArray(expectedResultBefore)) {
                GetUpdatedEPGdata.EXPECTED_RESULT_BEFORE =
                    expectedResultBefore;
            }
            else {
                Utilities.print("WARN: Verification of EPG before update"
                                + " will be skipped.");
            }

            if (Array.isArray(expectedResultAfter)) {
                GetUpdatedEPGdata.EXPECTED_RESULT_AFTER =
                    expectedResultAfter;
            }
            else {
                Utilities.print("#ERROR: Mandatory parameter "
                                + "'expectedResultAfter' is not specified or "
                                + "has wrong format. Test is terminated.");
                GetUpdatedEPGdata.END(false);
            }

            if (typeof(filters) == "object"
                 && Object.keys(filters).length != 0) {
                        GetUpdatedEPGdata.FILTERS = filters;
            }
            else {
                Utilities.print("WARN: No filter is specified. All events for "
                                + " specified services will be checked.");
            }

            // Fields present in expected result
            if (Array.isArray(optionalFields) && optionalFields.length != 0) {
                GetUpdatedEPGdata.FIELDS = GetUpdatedEPGdata.FIELDS.concat(
                    optionalFields);
            }
            else {
                Utilities.print("WARN: No optional field is specified. "
                                + "Only mandatory fields will be checked.");
            }

            if ( typeof(exitFunc) == "function") {
                GetUpdatedEPGdata.manager(["CheckTime"]);
            }
            else {
                GetUpdatedEPGdata.manager(["Connect"]);
            }
        },

        /**
         * Get EPG table content and compare it with expected result.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof GetUpdatedEPGdata
         */
        manager: function (args) {
            var steps = {
                "Connect" : function() {
                    //print test description:
                    Utilities.print(" ");
                    Utilities.print("Test description:");
                    Utilities.print(
                        "1. Check current time (terminate test if it's wrong)."
                    );
                    Utilities.print(
                        "2. Check EPG state before update if necessary.");
                    Utilities.print("3. Wait for EPG update.");
                    Utilities.print("4. Check EPG state after update.")
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                        function() {
                            GetUpdatedEPGdata.manager(["CheckTime"]);
                        },
                        2000);
                },
                "CheckTime" : function() {
                    Utilities.print("Verifying current time...");
                    if (! ServiceMode.checkChassisOption("SysTimeSource", 3)) {
                        Utilities.print("WARN: The 'SysTimeSource' is NOT set "
                                        + "to take time information from "
                                        + "stream");
                    }
                    var currentTimeUTC = de.loewe.sl2.i64.datetime.time.utc
                        .getValue();
                    var deltaT = GetUpdatedEPGdata.TIME - currentTimeUTC;
                    if ((-60 <= deltaT) &&
                        ( deltaT <= GetUpdatedEPGdata.TOLERANCE)) {
                        if (GetUpdatedEPGdata.EXPECTED_RESULT_BEFORE == "DNC"){
                            GetUpdatedEPGdata.manager(["WaitEvent"]);
                        }
                        else {
                            Utilities.print("Verifying preconditional EPG "
                                            + "state...\nGetting current EPG "
                                            + "data...");
                            GetUpdatedEPGdata.manager(["GetEPGinfo", 0]);
                        }
                    }
                    else {
                        Utilities.print("#ERROR: The current time doesn't "
                                        + "satisfy test requirements. Probably"
                                        + ", time settings are wrong.");
                        GetUpdatedEPGdata.manager(["EndTest"]);
                    }
                },
                "WaitEvent" : function() {
                    var currentTimeUTC = de.loewe.sl2.i64.datetime.time.utc;
                    /* standard system tolerance = 60 sec => wait for upto
                     * 60 seconds after system time change to expected value
                     * while EPG information is updated
                     * FIXME: Experiment with this value, possibly it can be
                     * reduced
                     */
                    var sleepInterval = GetUpdatedEPGdata.TIME
                        - currentTimeUTC.getValue() + 60;
                    var timerID = 0;

                    // Current time slightly more than the test time
                    // (significant deviations are dropped on the "CheckTime"
                    // step)
                    if (sleepInterval <= 0) {
                        Utilities.print("Getting current EPG information...");
                        GetUpdatedEPGdata.manager(["GetEPGinfo", 1]);
                    }
                    else {
                        Utilities.print("Waiting for the test time during "
                                        + Math.ceil(sleepInterval / 60)
                                        + " minute(s)...");
                        function listener(current) {
                            var delta = GetUpdatedEPGdata.TIME - current + 60;
                            if (delta <= 0) {
                                window.clearTimeout(timerID);
                                currentTimeUTC.onChange.disconnect(listener);
                                GetUpdatedEPGdata.manager(["GetEPGinfo", 1]);
                            }
                        }
                        currentTimeUTC.onChange.connect(listener);
                        timerID = window.setTimeout(
                            function() {
                                currentTimeUTC.onChange.disconnect(listener);
                                var currentTime = currentTimeUTC.getValue();
                                if ( currentTime < GetUpdatedEPGdata.TIME) {
                                    Utilities.print(
                                        "#ERROR: The current time is "
                                            + currentTime
                                            + " that is still less than the "
                                            + "test time ("
                                            + GetUpdatedEPGdata.TIME
                                            + "). Probably, time settings are "
                                            + "wrong.");
                                }
                                GetUpdatedEPGdata.manager(["GetEPGinfo", 1]);
                            }, sleepInterval*1000);
                    }
                },
                "GetEPGinfo" : function(isMainCheck) {
                    var isMainCheck = isMainCheck[0];
                    EPGquery.getEPG(
                        function(result) {
                            GetUpdatedEPGdata.manager(["CompareResults",
                                                       isMainCheck, result]);
                        },
                        GetUpdatedEPGdata.SERVICES,
                        GetUpdatedEPGdata.FILTERS,
                        GetUpdatedEPGdata.FIELDS,
                        isMainCheck ?
                            function() {
                                GetUpdatedEPGdata.manager(["EndTest"]);
                            }:
                        function() {
                            GetUpdatedEPGdata.TEST_RESULT = false;
                            GetUpdatedEPGdata.manager(["WaitEvent"]);
                        }
                    );
                },
                "CompareResults" : function(input) {
                    var isMainCheck = input[0];
                    var result = input[1];
                    Utilities.print("Checking EPG information...");
                    function createIndex(line) {
                        // Hash is "SID-TSID-ONID-EID"
                        return [line[0], line[1], line[2], line[3]].join("-");
                    }
                    // Headers for result pretty printing
                    var logLabels = GetUpdatedEPGdata.FIELDS.map(
                        function(item) {
                            return Utilities.getKey(EPG, item);
                        });

                    // Make dictionary from expected,
                    // query results and hash
                    var resultDict = Compare.makeDictionary(
                        isMainCheck ? GetUpdatedEPGdata.EXPECTED_RESULT_AFTER :
                            GetUpdatedEPGdata.EXPECTED_RESULT_BEFORE,
                        result, createIndex);
                    GetUpdatedEPGdata.TEST_RESULT =
                        // Pay attention to evaluation laziness
                        Compare.compareDictionaries(resultDict, logLabels) &&
                        GetUpdatedEPGdata.TEST_RESULT;
                    if (isMainCheck) {
                        GetUpdatedEPGdata.manager(
                            ["EndTest", GetUpdatedEPGdata.TEST_RESULT]);
                    }
                    else {
                        GetUpdatedEPGdata.manager(["WaitEvent"]);
                    }
                },
                "EndTest" : function(result) {
                    GetUpdatedEPGdata.END(result[0]||false);
                }
            }
            steps[args[0]](args.slice(1));
        }
    }
}
