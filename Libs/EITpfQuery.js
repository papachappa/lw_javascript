include('Utilities.js');
include('ServiceList.js');
include('ChannelChange.js');

init = function () {

/** @namespace
 * Test script for EIT p/f collection
 * @requires Library: {@link Utilities}, {@link ServiceList}
 */
EITpfQuery = {
    FIELDS: [SL_Fields.SERVICE_NAME, SL_Fields.CHANNEL_NUMBER,
             SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID,
             SL_Fields.PRESENT_EVENT_START, SL_Fields.PRESENT_EVENT_STOP,
             SL_Fields.PRESENT_EVENT_NAME, SL_Fields.PRESENT_EVENT_SHORTINFO,
             SL_Fields.PRESENT_EVENT_LONGINFO, SL_Fields.FOLLOWING_EVENT_START,
             SL_Fields.FOLLOWING_EVENT_STOP, SL_Fields.FOLLOWING_EVENT_NAME,
             SL_Fields.FOLLOWING_EVENT_SHORTINFO,
             SL_Fields.FOLLOWING_EVENT_LONGINFO, SL_Fields.MEDIA_TYPE],
    HASH: [SL_Fields.SID, SL_Fields.TSID, SL_Fields.ONID],
    HOMING_CHANNEL: [],
    EXPECTED_RESULT: "",
    UPDATE_COUNTER: 4,
    TIMEOUT: 20000,
    SKIP_SERVICES: [],
    END: function() {
        Utilities.printTestResult();
        Utilities.endTest();
    },
/**
 * Set test variables and start test execution.
 * @author Stanislav Chichagov schichagov@luxoft.com
 * @memberof EITpfQuery
 * 
 * @param {Array} broadcastingService
 * Any broadcasting service (from actual TS) describing by array:
 * <br/> [channel number, media type, name of service list]
 * 
 * @param {function} endFunction
 * Function that should be called at the end with service list as result.
 * Please use following printing in the endFunction for results handling:
 * 
 *  results.forEach(function(item) {
 *      Utilities.print(
 *          item.reduce(function(accum, itm){
 *              return accum + '"' + String(itm) + '", '
 *          }, "[ ").slice(0, -2) + " ],"
 *      );
 *  });
 * 
 * @param {string} listName
 * Name of service list. If parameter is omitted, overall list will be used.
 * <br/> "UPC"
 *  
 * @param {number} ServiceType
 * Service type for selections in the query:
 * <br/> MediaType.TV
 * <br/> MediaType.RADIO
 * <br/> "all"
 * 
 * @param {number} updateCounter
 * Number of attempts to collect EIT p/f data.
 * Query is not stable so please use at least 3 attempts.
 * 
 * @param {number} timeout
 * Additional timeout before collection of results.
 * Common timeout = 20 second + additional timeout. 
 */
    getEITpf: function (broadcastingService, endFunction, listName,
                         ServiceType, updateCounter, timeout, skipServices) {
        var serviceList = listName || "";
        if (typeof(updateCounter) === 'number') {
            EITpfQuery.UPDATE_COUNTER = updateCounter;
        }
        if (typeof(timeout) === 'number') {
            EITpfQuery.TIMEOUT = EITpfQuery.TIMEOUT + (timeout * 1000);
        }
        if (broadcastingService == "DNC") {
            EITpfQuery.HOMING_CHANNEL = "DNC";
        }
        else if (!Array.isArray(broadcastingService) ||
                 broadcastingService.length < 3 ) {
            Utilities.print("#ERROR: Broadcasting service is not specified."
                            + "\nEIT p/f can't be correctly collected.");
            EITpfQuery.END(false);
        }
        else {
            EITpfQuery.HOMING_CHANNEL = broadcastingService;
        }
        if (Array.isArray(skipServices) && skipServices.length > 0) {
            EITpfQuery.SKIP_SERVICES = skipServices;
        }
        if (typeof(endFunction) !== 'function') {
            Utilities.print("#ERROR: End function is not specified. "
                            + "\nTest cannot be executed.");
            EITpfQuery.END(false);
        }
        else {
            EITpfQuery.END = endFunction;
        }
        if (ServiceType == "all" || ServiceType == "All") {
            ServiceType = "all";
            EITpfQuery.manager(["Connect"]);
        }
        else if (typeof(ServiceType) !== 'number') {
            Utilities.print(typeof(ServiceType));
            Utilities.print("#ERROR: Service type for the query is not "
                            + "specified. \nTest cannot be executed.");
            EITpfQuery.END(false);
        }
        else {
            EITpfQuery.manager(["Connect"]);
        }
    },
/**
 * Execute EIT collection query
 * @author Stanislav Chichagov schichagov@luxoft.com
 * @memberof EITpfQuery
 */         
    manager: function (args) {
        var steps = {
            "Connect" : function() {
                Utilities.print(" ");
                Utilities.print("Test description:");
                Utilities.print("1. Connect PC to TV.");
                Utilities.print("2. Switch to homing channel.");
                Utilities.print("3. Collect EIT p/f data");
                Utilities.print(" ");
                Utilities.print("Test execution:");
                Utilities.connectToTV(function(){
                                EITpfQuery.manager(["SwitchToActiveService"]);
                                });
            },
            "SwitchToActiveService" : function() {
                if (EITpfQuery.HOMING_CHANNEL == "DNC") {
                    Utilities.print("Channel change is skipped");
                    EITpfQuery.manager(["GetListUID"]);
                }
                else {
                    Utilities.print("Switching to broadcasting channel...");
                    ChannelChange.zapWithVerification(
                        function() {
                            Utilities.print("Switch to broadcasting channel "
                                            + "is successful.");
                            EITpfQuery.manager(["GetListUID"]);
                        },
                        EITpfQuery.HOMING_CHANNEL[0],
                        EITpfQuery.HOMING_CHANNEL[1],
                        EITpfQuery.HOMING_CHANNEL[2],
                        function() {
                            Utilities.print("#VERIFICATION FAILED: "
                                            + "Switch to homing channel "
                                            + "was not performed");
                            EITpfQuery.manager(["ReturnResults", false]);
                        }
                    );
                }
            },
            "GetListUID" : function() {
                ServiceList.getServicelistUID(function(listUID){
                    EITpfQuery.manager(["CheckList", listUID]);
                }, serviceList);
            },
            "CheckList" : function(UIDs) {
                var UIDs = UIDs[0];
                var UID = UIDs[0];
                if (UIDs.length != 1) {
                    Utilities.print("#ERROR: " + UIDs.length
                                    + " service lists '" + serviceList 
                                    + "' are found.\nTest is terminated");
                    EITpfQuery.manager(["ReturnResults", false]);
                }
                else {
                    Utilities.print("Timeout before EIT p/f collection is "
                                    + (EITpfQuery.TIMEOUT/1000) + " seconds.");
                    setTimeout(function(){
                                    EITpfQuery.manager(["GetResults", UID]);
                                },EITpfQuery.TIMEOUT);
                }
            },
            "GetResults" : function(listUID) {
                var timeAPI = de.loewe.sl2.i64.datetime.time.utc;
                var serviceListTable = de.loewe.sl2.table.servicelist.list;
                var selections = [
                        {field:1, conditionType:1, condition: listUID[0]}
                    ];
                var orders = [];
                var queryDef = {
                    selections:  selections,
                    fields: EITpfQuery.FIELDS,
                    orders: orders
                };
                var result = [];
                var emptyEIT = [];
                var rowsNumber = 0;
                var currentPhase = "Read first rows second time";
                var currentIndex = 0;
                
                if (ServiceType != "all") {
                    selections.push(
                        {field: 21, conditionType:1, condition: ServiceType}
                    );
                }
                query = serviceListTable.createQuery(queryDef);
                query.onQueryReady.connect(this,onQueryReady);
                query.execute();
                Utilities.print("Start time of collection EIT p/f: "
                                + timeAPI.getValue());
                function rowSeeker(currentIndex) {
                    query.seekToRow(currentIndex, 0);
                    query.readNextRows(1);
                }

                function onQueryReady(count){
                    Utilities.print("Please wait...");
                    query.onQueryReady.disconnect(this, onQueryReady);
                    if (count == 0) {
                        EITpfQuery.manager(["ReturnResults"]);
                    }
                    else {
                        query.onRows.connect(this, onRows);
                        query.seekToRow(0, 0);
                        if (count > 10) {
                            query.readNextRows(10);
                        }
                        else {
                            query.readNextRows(count);
                        }
                        rowsNumber = count;
                    }
                }
                function onRows(id, rows){
                    if (currentPhase == "Read first rows second time") {
                        currentPhase = "Add rows to the result array";
                        query.seekToRow(0, 0);
                        if (rowsNumber > 10) {
                            query.readNextRows(10);
                        }
                        else {
                            query.readNextRows(rowsNumber);
                        }
                    }
                    else if (currentPhase == "Add rows to the result array") {
                        result = result.concat(rows);
                        if (rowsNumber > 10) {
                            currentPhase = "Read rows second time";
                            currentIndex++;
                            query.seekToRow((10*currentIndex), 0);
                            query.readNextRows(10);
                        }
                        else {
                            currentPhase = "Check results";
                            query.seekToRow(0, 0);
                            query.readNextRows(1);
                        }
                    }
                    else if (currentPhase == "Read rows second time") {
                        rowsNumber = rowsNumber - 10;
                        currentPhase = "Add rows to the result array";
                        if (rowsNumber > 10) {
                            query.seekToRow((10*currentIndex), 0);
                            query.readNextRows(10);
                        }
                        else {
                            query.seekToRow((10*currentIndex), 0);
                            query.readNextRows(rowsNumber);
                        }
                    }
                    else if (currentPhase == "Check results") {
                        result.forEach(function(item, i) {
                            /*Usually all data can't be read at once. So we  
                              check names of present (item[7]) and
                              following (item[12]) TV programs. In case of empty
                              data we try to reread rows in service table.
                            */
                            if (item[7] == "" || item[12] == "") {
                                emptyEIT = emptyEIT.concat(i);
                            }
                        });
                        var index;
                        for (var i=0; i<EITpfQuery.SKIP_SERVICES.length; i++) {
                            index = emptyEIT
                                .indexOf(EITpfQuery.SKIP_SERVICES[i]);
                            if (index != -1) {
                                emptyEIT.splice(index, 1);
                            }
                        }
                        if (emptyEIT.length == 0 || EITpfQuery
                                                        .UPDATE_COUNTER == 0) {
                            currentPhase = "End of results collection";
                            query.seekToRow(0, 0);
                            query.readNextRows(1);
                        }
                        else {
                            currentPhase = "Get data for empty fields";
                            currentIndex = 0;
                            setTimeout(function(){
                                query.seekToRow(emptyEIT[currentIndex], 0);
                                query.readNextRows(1);
                                }, 5000);
                        }
                    }
                    else if (currentPhase == "Get data for empty fields") {
                        if (currentIndex == emptyEIT.length) {
                            EITpfQuery.UPDATE_COUNTER--;
                            currentPhase = "Check results";
                            emptyEIT = [];
                            query.seekToRow(0, 0);
                            query.readNextRows(1);
                        }
                        else {
                            for (var i = 5; i < 15; i++) {
                                if (rows[0][i] != "") {
                                    result[emptyEIT[currentIndex]][i]
                                        = rows[0][i];
                                }
                            }
                            if (rows[0][7] == "" || rows[0][12] == "") {
                                currentPhase = "Second attempt to get data";
                                query.seekToRow(emptyEIT[currentIndex], 0);
                                query.readNextRows(1);
                            }
                            else {
                                currentIndex++;
                                if (currentIndex == emptyEIT.length) {
                                    query.seekToRow(0, 0);
                                    query.readNextRows(1)
                                }
                                else {
                                    query.seekToRow(emptyEIT[currentIndex], 0);
                                    query.readNextRows(1);
                                }
                            }
                        }
                    }
                    else if (currentPhase == "Second attempt to get data") {
                        currentPhase = "Get data for empty fields";
                        for (var i = 5; i < 15; i++) {
                            if (rows[0][i] != "") {
                                result[emptyEIT[currentIndex]][i] = rows[0][i];
                            }
                        }
                        currentIndex++;
                        if (currentIndex == emptyEIT.length) {
                            query.seekToRow(0, 0);
                            query.readNextRows(1)
                        }
                        else {
                            query.seekToRow(emptyEIT[currentIndex], 0);
                            query.readNextRows(1);
                        }
                    }
                    else if (currentPhase == "End of results collection") {
                        query.onRows.disconnect(this, onRows);
                        Utilities.print("End time of collection EIT p/f: "
                                        + timeAPI.getValue());
                        EITpfQuery.manager(["ReturnResults", result]);
                    }
                }
            },
            "ReturnResults": function(result){
                if (result[0] == false) {
                    Utilities.print("#ERROR: Results were not collected.");
                    Utilities.printTestResult();
                    Utilities.endTest();
                }
                else { 
                    if (result.length == 0) {
                        Utilities.print("WARN: Results are empty.");
                    }
                    else {
                        Utilities.print("#VERIFICATION PASSED: Results were "
                                        + "collected.");
                    }
                EITpfQuery.END(result[0]);
                }
            }
        }
        steps[args[0]](args.slice(1));
    },
/**
 * Function for comparison service lists.
 * @author Stanislav Chichagov schichagov@luxoft.com
 * @memberof EITpfQuery
 * 
 * @param {Array} broadcastingService
 * Homing channel describing by array:
 * <br/> [channel number, media type, name of service list]
 * 
 * @param {string} listName
 * Name of service list. If parameter is omitted, overall list will be used.
 * <br/> "UPC"
 * 
 * @param {Number} ServiceType
 * Service type for selections in the query:
 * <br/> MediaType.TV
 * <br/> MediaType.RADIO
 * <br/> "all"
 * 
 * @param {array} [expectedResult]
 * List of all services present in the service list under test
 * Each service should be described by the same parameter set and in
 * the same order as it's specified in the "EITpfQuery.FIELDS" parameter.
 * 
 * @param {number} timeout
 * Additional timeout before results comparing.
 * Common timeout = 20 second + additional timeout. 
 * 
 * @param {array} fieldsToDelete
 * List of fields which should be excluded from actual results for comparing
 * with expected result.
 * <br/> [SL_Fields.PRESENT_EVENT_SHORTINFO, SL_Fields.PRESENT_EVENT_LONGINFO]
 */
    compareLists: function (broadcastingService,
                            listName,
                            ServiceType,
                            expectedServiceList,
                            timeout,
                            fieldsToDelete,
                            skipServices,
                            exitFunc) {
        var exitFunc = exitFunc || function() {
                Utilities.printTestResult();
                Utilities.endTest();
            };
        var fieldsToDelete = fieldsToDelete || [
            SL_Fields.PRESENT_EVENT_SHORTINFO,
            SL_Fields.PRESENT_EVENT_LONGINFO,
            SL_Fields.FOLLOWING_EVENT_SHORTINFO,
            SL_Fields.FOLLOWING_EVENT_LONGINFO];
        var fieldsFilter = [];
        // Headers for result pretty printing
        var logLabels = EITpfQuery.FIELDS.map(
            function(item) {
                return Utilities.getKey(SL_Fields, item);
            }
        );
        if (fieldsToDelete.length != 0) {
            fieldsToDelete.forEach(
                function(item) {
                    fieldsFilter.push(EITpfQuery.FIELDS.indexOf(item));
                }
            );
        }
        var serviceList = listName || "";
        if (typeof(exitFunc) !== 'function') {
            Utilities.print("#ERROR: End function is not correct. "
                            + "\nTest cannot be executed.");
            EITpfQuery.END(false);
        }
        if (typeof(timeout) === 'number') {
            EITpfQuery.TIMEOUT = EITpfQuery.TIMEOUT + (timeout * 1000);
        }
        if (broadcastingService == "DNC") {
            EITpfQuery.HOMING_CHANNEL = "DNC";
        }
        else if (!Array.isArray(broadcastingService) ||
                 broadcastingService.length < 3 ) {
            Utilities.print("#ERROR: Broadcasting service is not specified."
                            + "\nEIT p/f can't be correctly collected.");
            EITpfQuery.END(false);
        }
        else {
            EITpfQuery.HOMING_CHANNEL = broadcastingService;
        }
        if (Array.isArray(skipServices) && skipServices.length > 0) {
            EITpfQuery.SKIP_SERVICES = skipServices;
        }
        if (ServiceType == "all" || ServiceType == "All") {
            ServiceType = "all";
        }
        else if (typeof(ServiceType) !== 'number') {
            Utilities.print(typeof(ServiceType));
            Utilities.print("#ERROR: Service type for the query is not "
                            + "specified. \nTest cannot be executed.");
            EITpfQuery.END(false);
        }
        if (Array.isArray(expectedServiceList)) {
            EITpfQuery.EXPECTED_RESULT = expectedServiceList;
            EITpfQuery.END = compareFunc;
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Get service list UID by list name.");
            Utilities.print("3. Get services from the list.");
            Utilities.print("4. Compare service list with expected result.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV(function(){
                                EITpfQuery.manager(["SwitchToActiveService"]);
                                });
        }
        else {
            Utilities.print("#ERROR: Expected service list is not specified."
                            + "\nTest is terminated.");
            EITpfQuery.END(false);
        }
        function compareFunc(services) {
            /*It is not possible to make changes in array of services in 
              Ubuntu 12 using following:
                services.forEach(
                    function(item) {
                        for (var k = fieldsFilter.length; k > 0; k--) {
                            item.splice(fieldsFilter[k-1], 1); 
                        }
                    }
                );
              That's why we will use copy of array using magic 
              "item = item.slice()"
            */
            var servicesForCorrectHandling = [];
            Utilities.print("Comparing services...");
            if (fieldsToDelete.length != 0) {
                if (fieldsFilter.length == 0) {
                    Utilities.print("WARN: Fields to delete were set "
                                    + "incorrectly. No fields will be deleted");
                    services.forEach(
                        function(item) {
                            item = item.slice();
                            servicesForCorrectHandling.push(item);
                        }
                    );
                }
                else {
                    services.forEach(
                        function(item) {
                            item = item.slice();
                            for (var k = fieldsFilter.length; k > 0; k--) {
                                item.splice(fieldsFilter[k-1], 1);
                            }
                            servicesForCorrectHandling.push(item);
                        }
                    );
                    for (var k = fieldsFilter.length; k > 0; k--) {
                        logLabels.splice(fieldsFilter[k-1], 1); 
                    }
                }
            }
            else {
                services.forEach(
                    function(item) {
                        item = item.slice();
                        servicesForCorrectHandling.push(item);
                    }
                );
            }
            // Hash function
            function makeIndex(line) {
                return EITpfQuery.HASH.map(
                    function(item) {
                        return line[
                            EITpfQuery.FIELDS.indexOf(
                                item)];
                    }).join("-");
            }
            var expNumServs = Utilities.numberOfElements(
                EITpfQuery.EXPECTED_RESULT);
            var actNumServs = Utilities.numberOfElements(services);

            if (expNumServs != actNumServs) {
                Utilities.print("INFO: Number of services is " 
                                + actNumServs + " instead of expected "
                                + expNumServs + ".");
            }

            var actualResult = Compare.makeDictionary(
                EITpfQuery.EXPECTED_RESULT,
                servicesForCorrectHandling,
                makeIndex
            );
            if (Compare.compareDictionaries(actualResult, logLabels) != true) {
                Utilities.print("#VERIFICATION FAILED: '" + serviceList
                                + "' is NOT equal to expected.");
                if (servicesForCorrectHandling.length != 0){
                    Utilities.print("");
                    Utilities.print("Actual list:");
                    servicesForCorrectHandling.forEach(function(item) {
                        Utilities.print(
                            item.reduce(function(accum, itm){
                                return accum + '"' + String(itm) + '", '
                            }, "[ ").slice(0, -2) + " ],"
                        );
                    });
                }
                else {
                    Utilities.print("");
                    Utilities.print("Actual list is empty or does not exist.");
                }
            }
            exitFunc(true);
        }
    },
}
}
