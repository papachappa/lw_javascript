include('../Utilities.js');
include('../Compare.js');
include('../ServiceMode.js');
include('../CheckArbitraryServiceList.js');

init = function () {

    /** @namespace
     * Test script for verification of EIT p/f data
     * @requires Library: {@link Utilities}, {@link Compare},
     * {@link CheckArbitraryServiceList}, {@link ServiceMode}
     */
    CheckUpdatedEITpf = {
        SERVICE_LIST: "OVERALL",
        FILTERS: {},
        FIELDS: [SL_Fields.SERVICE_NAME, SL_Fields.CHANNEL_NUMBER,
                 SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID,
                 SL_Fields.MEDIA_TYPE, SL_Fields.SERVICE_VISIBLE,
                 SL_Fields.SERVICE_SELECTABLE],
        HASH: [SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID],
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
         * @memberof CheckUpdatedEITpf
         *
         * @param {string} serviceList
         * Name of the service list under test
         *
         * @param {array} [fields = []]
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
         * @param {Number} [time]
         * Time of EIT p/f update (in epoch time format)
         *
         * @param {array} [expectedResultBefore = DO_NOT_CHECK]
         * State of aervice list to be checked before update.
         * Its format (fields and their order) should exactly match the
         * format specified in the "fields" parameter
         *
         * @param {array} [expectedResultAfter]
         * State of the service list  to be checked after update.
         * Its format (fields and their order) should exactly match the
         * format specified in the "fields" parameter
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
        startTest: function (serviceList,
                             fields,
                             filters,
                             hash,
                             time,
                             expectedResultBefore,
                             expectedResultAfter,
                             exitFunc) {

            if (typeof(exitFunc) == "function") {
                CheckUpdatedEITpf.END = exitFunc;
            }
            if (typeof(serviceList) == "string" && serviceList != ""
                && serviceList != "DNC") {
                CheckUpdatedEITpf.SERVICE_LIST = serviceList;
            }
            else {
                Utilities.print("INFO: Overall list will be checked.");
            }
            if (typeof(time) == "number") {
                CheckUpdatedEITpf.TIME = time;
            }
            else {
                Utilities.print("#ERROR: Mandatory parameter 'time'"
                                + "is not specified or has a wrong format. "
                                + "Test is terminated.");
                CheckUpdatedEITpf.END(false);
            }

            if (Array.isArray(expectedResultBefore)) {
                CheckUpdatedEITpf.EXPECTED_RESULT_BEFORE =
                    expectedResultBefore;
            }
            else {
                Utilities.print("WARN: Verification of EIT p/f before update"
                                + " will be skipped.");
            }

            if (! SL_Fields.MEDIA_TYPE in filters) {
                Utilities.print("WARN: Results will not be filtered by media "
                                + "type.\n EIT p/f information can be "
                                + "incomplete.");
            }

            CheckUpdatedEITpf.FILTERS = filters;
            if (Array.isArray(expectedResultAfter)) {
                CheckUpdatedEITpf.EXPECTED_RESULT_AFTER =
                    expectedResultAfter;
            }
            else {
                Utilities.print("#ERROR: Mandatory parameter "
                                + "'expectedResultAfter' is not specified or "
                                + "has a wrong format. Test is terminated.");
                CheckUpdatedEITpf.END(false);
            }

            if (Array.isArray(hash) && hash.length != 0) {
                CheckUpdatedEITpf.HASH = hash;
            }
            else {
                Utilities.print("INFO: Service triplet will be used as a hash "
                                + "for service identification.");
            }
            if (Array.isArray(fields) && fields.length != 0) {
                // Check that the 'fields' contains ones will be used for hash
                if (CheckUpdatedEITpf.HASH.every(function(item) {
                    return fields.indexOf(item) != -1; })) {
                    CheckUpdatedEITpf.FIELDS = fields;
                }
                else {
                    Utilities.print(
                        "#ERROR: List of fields doesn't contain ones necessary "
                            + "for service identification.\nVerify 'hash', "
                            + "'fields' and 'expectedResult' parameters.");
                    CheckUpdatedEITpf.END(false);
                }
            }

            if (typeof(exitFunc) == "function") {
                CheckUpdatedEITpf.manager(["CheckTime"]);
            }
            else {
                CheckUpdatedEITpf.manager(["Connect"]);
            }
        },

        /**
         * Get service list and compare it with expected result.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof CheckUpdatedEITpf
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
                        "2. Check service list before update if necessary.");
                    Utilities.print("3. Wait for EIT update.");
                    Utilities.print("4. Check service list after update.")
                    Utilities.print(" ");
                    Utilities.print("Test execution:");
                    Utilities.connectToTV(
                        function() {
                            CheckUpdatedEITpf.manager(["CheckTime"]);
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
                    var deltaT = CheckUpdatedEITpf.TIME - currentTimeUTC;
                    if ((-60 <= deltaT) &&
                        ( deltaT <= CheckUpdatedEITpf.TOLERANCE)) {
                        if (CheckUpdatedEITpf.EXPECTED_RESULT_BEFORE == "DNC"){
                            CheckUpdatedEITpf.manager(["WaitEvent"]);
                        }
                        else {
                            Utilities.print("Verifying preconditional EIT p/f "
                                            + "data...\nGetting current "
                                            + "service list...");
                            CheckUpdatedEITpf.manager(["GetEITpf", 0]);
                        }
                    }
                    else {
                        Utilities.print("#ERROR: The current time doesn't "
                                        + "satisfy test requirements. Probably"
                                        + ", time settings are wrong.");
                        CheckUpdatedEITpf.manager(["EndTest"]);
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
                    var sleepInterval = CheckUpdatedEITpf.TIME
                        - currentTimeUTC.getValue() + 60;
                    var timerID = 0;

                    // Current time slightly more than the test time
                    // (significant deviations are dropped on the "CheckTime"
                    // step)
                    if (sleepInterval <= 0) {
                        Utilities.print("Getting current EIT information...");
                        CheckUpdatedEITpf.manager(["GetEITpf", 1]);
                    }
                    else {
                        Utilities.print("Waiting for the test time during "
                                        + Math.ceil(sleepInterval / 60)
                                        + " minute(s)...");
                        function listener(current) {
                            var delta = CheckUpdatedEITpf.TIME - current + 60;
                            if (delta <= 0) {
                                window.clearTimeout(timerID);
                                currentTimeUTC.onChange.disconnect(listener);
                                CheckUpdatedEITpf.manager(["GetEITpf", 1]);
                            }
                        }
                        currentTimeUTC.onChange.connect(listener);
                        timerID = window.setTimeout(
                            function() {
                                currentTimeUTC.onChange.disconnect(listener);
                                var currentTime = currentTimeUTC.getValue();
                                if ( currentTime < CheckUpdatedEITpf.TIME) {
                                    Utilities.print(
                                        "#ERROR: The current time is "
                                            + currentTime
                                            + " that is still less than the "
                                            + "test time ("
                                            + CheckUpdatedEITpf.TIME
                                            + "). Probably, time settings are "
                                            + "wrong.");
                                }
                                CheckUpdatedEITpf.manager(["GetEITpf", 1]);
                            }, sleepInterval*1000);
                    }
                },
                "GetEITpf" : function(isMainCheck) {
                    var exitFn = function(result) {
                        CheckUpdatedEITpf.TEST_RESULT = result[0];
                        CheckUpdatedEITpf.manager(["WaitEvent"]);
                    };
                    var expectedResult =
                        CheckUpdatedEITpf.EXPECTED_RESULT_BEFORE;
                    if (isMainCheck[0]) {
                        expectedResult =
                            CheckUpdatedEITpf.EXPECTED_RESULT_AFTER;
                        exitFn = function(result) {
                            CheckUpdatedEITpf.manager(
                                ["EndTest",
                                 CheckUpdatedEITpf.TEST_RESULT && result[0]]);
                        };
                    }
                    CheckArbitraryServiceList.startTest(
                        CheckUpdatedEITpf.SERVICE_LIST,
                        CheckUpdatedEITpf.FIELDS,
                        CheckUpdatedEITpf.FILTERS,
                        CheckUpdatedEITpf.HASH,
                        expectedResult,
                        exitFn
                    );
                },
                "EndTest" : function(result) {
                    CheckUpdatedEITpf.END(result[0]||false);
                }
            }
            steps[args[0]](args.slice(1));
        }
    }
}
