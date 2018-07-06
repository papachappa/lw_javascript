init = function() {
    /** @namespace
     * Util functions
    */
    Utilities = {
    
    compareString: function(expected_str, actual_str) {
        if (expected_str.length > actual_str.length) {
            var long = expected_str;
        }
        else {
            var long = actual_str;
        }
        for (var i = 0; i < long.length; i++) {
            if (expected_str[i] != actual_str[i]) {
                try {
                    actual_str[i].charCodeAt()
                }
                catch (e) {
                    jbiz.writeLine("\nEnd of the actual string reached")
                    var t1 = ("\nDifferent character in expected string is #"
                              +  expected_str[i].charCodeAt() + "#")
                    var t2 = ("\nPosition of difference in expected string is '"
                              + i + "'")
                    jbiz.writeLine(t1 + t2)
                    return
                }

                try {
                    expected_str[i].charCodeAt()
                }
                catch (e) {
                    jbiz.writeLine("\nEnd of the expected string reached")
                    var t1 = ("\nDifferent character in actual string is #"
                             +  actual_str[i].charCodeAt() + "#")
                    var t2 = ("\nPosition of difference in actual string is '"
                             + i + "'")
                    jbiz.writeLine(t1 + t2)
                    return
                }

                var t1 = ("\nDifferent character in actual string is #"
                         +  actual_str[i].charCodeAt() + "#")
                var t2 = ("\nDifferent character in expected string is #"
                         +  expected_str[i].charCodeAt() + "#")
                var t3 = "\nPosition of difference in both strings is '" + i + "'"
                jbiz.writeLine(t1 + t2 +t3)
                return
            }
        }
    },
        
    /**
     * Print function to write test log and test result.
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {string} [logText=" "]
     * The text to be printed in command line.
     * If parameter is missed, then empty line will be printed
     * @param {"PASSED"|"FAILED"} [verificationResult]
     * Result is concated with label and used to display test result via Web UI.
     * If unexpected value is set, test result on UI will be displayed as N/A.
     * ATTENTION! PASSED result should be printed only once - after last verification.
     * Test result can't be printed without log printing
     * @example
     * // write informative log without test result
     * Utilities.print("Scan is started.");
     * @example
     * // write test log and test result
     * Utilities.print("Test execution is finished. Test is PASSED.","PASSED");
    */
    
    print: function(logText, elementID){
        logText = logText || "";
    //time printing is commented, team doesn't want to see it
        //~ try {
            //~ var tvTime = de.loewe.sl2.i64.datetime.time.utc.getValue();
        //~ }
        //~ catch(err) {
            //~ var tvTime = "undefined";
        //~ }
    //    jbiz.writeLine(tvTime + ": " + logText);
    
    //print to logfile
        jbiz.writeLine(logText);
        
    //print to weBiz window
        if (typeof(elementID) != "undefined"){
            //to add new line we should concat it with already printed
            var initial = document.getElementById(String(elementID)).innerHTML;
            var text= String(initial)+logText+"<br />"
            document.getElementById(String(elementID)).innerHTML = text;
        }
    
        if (   String(logText).indexOf('FAIL') != -1
            || String(logText).indexOf('ERROR') != -1 ){
            UTILITIES_TEST_RESULT="TEST_FAILED"
        }
    },
    
    /**
     * Return number of first level elemets of an object.
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {object} array
     * @return {number} Number of high level elements in object
     * @example
     * // returns 2
     * Utilities.numberOfElements(["1","apple"]);
     * @example
     * // returns 0
     * Utilities.numberOfElements({});
     * @example
     * // returns 3
     * Utilities.numberOfElements({key1:1, key2:["a","b"], key3:{v1:1,v2:1});
    */
    numberOfElements: function (array) {
        if (typeof(array) == "undefined"){
            Utilities.print("#ERROR: Array is undefined.");
        }
        else{
            var i = 0;
            for(var key in array){
                i++;
            }
            return i;
        }
    },
    
    /**
     * Connect WeBiz to TV.
     * @author loewe/tools/projects/lconnect/Resources/WeBiz/WeBizExamples
     * @memberof Utilities
     * @param {function} exitFunc
     * Function that should be called after all APIs are connected.
     * @param {number} [connectTimeout=5000]
     * Timeout in milliseconds to wait TV connection.
     * Test will be terminated if connection is not executed during the timeout.
     * @example
     * // call startTest() function when connection to TV APIs is fully established.
     * Utilities.connectToTV(startTest)
    */
    connectToTV: function (exitFunc, connectionTimeout, startTimeout) {
        var connectionTimeout = connectionTimeout || 5000;
        var startTimeout = startTimeout || 1000;
        var connectionTimeoutId = 0;
    
        function onConnectionStateChanged(state) {
            if(state === 2) {
                connector.onConnectionStateChanged.disconnect(
                    this, onConnectionStateChanged);
                clearTimeout(connectionTimeoutId);
                Utilities.print("Connection to TV is established.");
                // Objects cannot be accessed instantly after the load
                setTimeout(runScript, startTimeout);
            }
        }
    
        function onConnectionTimeout() {
            Utilities.print("WeBiz cannot connect to TV! Test is stopped.");
            setTimeout(jbiz.exit, 1000);
        }
    
        function runScript() {
            var dataModel = connector.dataModel;
            window.dataModel = dataModel;
            var de = dataModel.de;
            window.de = de;
            Utilities.print("All APIs are connected.");
            setTimeout(exitFunc, 2000);
        }
    
        //create JBizConnector object
        var connector = biz.createConnector();
        window.connector = connector;
        //use onConnectionStateChanged function to listen for connection state
        // change
        connector.onConnectionStateChanged.connect(this, onConnectionStateChanged);
        //connect to device
        connectionTimeoutId = setTimeout(onConnectionTimeout, connectionTimeout);
        // Last parameter defines whether all objects should be connected
        // by default
        connector.connect("localhost", 12321, true);
    },
    
    /**
     * Connect WeBiz to TV to specified apis.
     * @author loewe/tools/projects/lconnect/Resources/WeBiz/WeBizExamples
     * @memberof Utilities
     * @param {function} exitFunc
     * Function that should be called after all APIs are connected.
     * @param {list} [apiList]
     * List of api that has to be connected
     * @example
     * // call startTest() function when connection to TV APIs is fully established.
     * Utilities.connectToTV(startTest)
    */
    connectToAPIs: function (exitFunc, apiList, printing) {
        var connectionIterator = 0;
        var printing = printing || 1;
    
        function onConnectionStateChanged( state ) {
            if( state == 2 ) {
                if (printing == 1){
                    Utilities.print("Connection to TV is established.");
                }
                clearTimeout(connectionTimeoutId);
                dataModel = connector.dataModel;
                connector.dataModel.onObjectAdded.connect( this, onObjectAdded );
            }
        }
    
        function onConnectionTimeout(){
            if(connectionIterator>2){
                Utilities.print("WeBiz cannot connect to TV!");
                setTimeout(jbiz.exit,1000);
            }
            else{
                connectionIterator++;
                if (printing == 1){
                    Utilities.print ("The " + connectionIterator + " attempt to connect to TV.")
                }
                connectionTimeoutId = setTimeout(onConnectionTimeout, 5000);
                connector.connect("localhost",12321, false);
            }
        }
    
        function onObjectAdded(o){
            var i = apiList.indexOf(o.getFullName());
            if(i>-1){
                if (printing == 1){
                    Utilities.print("Connected: " + o.getFullName())
                }
                o.connect();
                apiList.splice(i, 1);
                if( apiList.length == 0 ) {
                    onAllRequiredValuesReady();
                }
            }
        }
    
        function onAllRequiredValuesReady() {
            de = dataModel.de;
            if (printing == 1){
                Utilities.print("All required APIs are connected.");
            }
            setTimeout(exitFunc,1000);
        }
    
        connector = biz.createConnector();
        connectionTimeoutId = setTimeout(onConnectionTimeout, 5000);
        connector.onConnectionStateChanged.connect( this, onConnectionStateChanged );
        connector.connect( "localhost", 12321, false );
    },
    
    /**
     * Function to stop test execution and put to log tested version.
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
    */
    endTest: function (elementID) {
        //getting chassis and sw information is moved to controllers
        //var softVersion = de.loewe.sl2.str.software.update.current.packet.getValue();
        //var chassis = de.loewe.sl2.str.servicemode.chassis.name.getValue();
    
        //Utilities.print("------------", elementID);
        //Utilities.print("Tested configuration.", elementID);
        //Utilities.print("Software Version: " + softVersion + ".", elementID);
        //Utilities.print("Chassis: " + chassis + ".", elementID);
        setTimeout(function(){jbiz.exit()},1500);
    },
    
    /**
     * Get table values
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {function} exitFunc
     * Function that will be called on success with a request result
     * as parameter
     * @param {object} api
     * Table API
     * @param {object} request
     * Request parameters
     * @param {function} [failFunc=Utilities.endTest]
     * Function that will be called on failure
     * as parameter
     * @example
     * // get servicelist UID by servicelist name
     * var servicelistUIDquery  =  {
            selections:   [ { field: 0, conditionType: 1, condition: "DVB-T"}],
            fields:       [1],
            orders:       [ {field: 0, direction: 1} ]
        };
     * var api = de.loewe.sl2.table.favouritelist.list
     * Utilities.getTableValues(getServices, api, servicelistUIDquery)
    */
    getTableValues: function (exitFunc, api, request, failFunc, rowsN) {
        var result = [];
        var left = 0;
        var rowsN = rowsN || 10
        var failFunc = failFunc || exitFunc;
        //stop test execution if one of parameters is missed
        if (typeof(request) != "object" || typeof(api) != "object") {
            Utilities.print("#ERROR: Not all required input parameters"
                           + " are set for Utilites.getTableValues");
            failFunc(result);
        }
    
        function onQueryReady(count) {
            query.onQueryReady.disconnect(this, onQueryReady);
            //do not connect to onRows if there is no requested elements
            //otherwise WeBiz hangs up.
            if (count < 0) {
                Utilities.print("#ERROR: count < 0. Empty result will be returned.");
                exitFunc(result);
            }
            else if (count == 0) {
                Utilities.print("WARN: No lines satisfy the specified "
                                + "table request.");
                exitFunc(result);
            }
            else {
                query.onRows.connect(this, onRows);
                if (count % rowsN) {
                    left = count - count % rowsN;
                    query.readRows(left, count % rowsN);
                }
                else {
                    left = count - rowsN;
                    query.readRows(left, rowsN);
                }
            }
        }
    
        function onRows(id, rows){
            result = rows.concat(result);
            if (left == 0) {
                query.onRows.disconnect(this, onRows);
                exitFunc(result);
            }
            else {
                left = left - rowsN;
                query.readRows(left, rowsN);
            }
        }
    
        var query = api.createQuery(request);
        query.onQueryReady.connect(this, onQueryReady);
        query.execute();
    },
    
    /**
     * Check API value.
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {object} obj
     * See example to check required structure.
     * @param {string|number} expectedValue
     * @param {string} {checkType="INFO"|"WARN"|"RSLT"}
     * Type of verification. For INFO, any result will be marked by "INFO",
     * for "WARN", in case of inequality result will be marked with "WARN", and
     * in case of equality result will be marked as "INFO".
     * For "RSLT" in case of equality result will be marked as "#VERIFICATION PASSED"
     * and in another case as "#VERIFICATION FAILED".
     * Default value is "INFO".
     * @return {true|currectValue}
     * Function returns 'true' in case of equality of current and expected values,
     * and returns current value if current and expected values are different.
     * @example
     * //if description is not set, then api name will be used as description
     * var setting = {
     *      description: "searching method",
     *      api: de.loewe.sl2.i32.channel.search.method,
     *  };
    */
    getCheckAPIValue: function(obj, expectedValue, checkType) {
        var checkType = checkType||"INFO";
        if (typeof(expectedValue) == "undefined") {
            Utilities.print("#ERROR: Utilities.getCheckAPIValue is called"
                            + " with unexpected value of 'expectedValue'.");
            return false
        }
        if (typeof(obj.api) == "undefined") {
            Utilities.print("#ERROR: Utilities.getCheckAPIValue is called"
                            + " with unexpected value of 'obj.api'.");
            return false
        }
        
        obj.description = obj.description || String(obj.api);
        if (expectedValue == "DNC"){
            Utilities.print("INFO: verification of " + obj.description
                            + " is not required.");
            return true
        }
    
        var currentValue = obj.api.getValue();
        // Print descriptive log strings for empty string values
        var logExpectedValue = (expectedValue === ""? "empty value" :
                                expectedValue);
        var logCurrentValue = (currentValue === ""? "empty" : currentValue);
    
        //Utilities.print("Current API value: " + currentValue)
        if (currentValue.toString() == expectedValue.toString()) {
            if (checkType == "RSLT"){
                checkType = "#VERIFICATION PASSED"
            }
            Utilities.print(checkType + ": Current value of " + obj.description
                            + " is equal to expected " + logCurrentValue + ".");
            return true
        }
        else {
            if (checkType == "RSLT"){
                checkType = "#VERIFICATION FAILED"
            }
            Utilities.print( checkType +": Current value of "
                            + obj.description + " is " + logCurrentValue
                            + " that is different from expected "
                            + logExpectedValue + ".");
    //TODO add print of api
            return false
        }
    },
    
    /**
     * Detect current system version
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {function} exitFunc
     * Function will be executed on success
     * with defined system version as an argument
     * @param {function} [failFunc=exitFunc]
     * Function will be executed on failure
     * @example
     * //Print main system version
     * Utilities.getMainSystemVersion(
     * Utilities.print)
    */
    getMainSystemVersion: function(exitFunc, failFunc) {
        var failFunc = failFunc || exitFunc;
        var table = de.loewe.sl2.servicemode.versioninfo.table;
        var serviceQuery = {
            // Select all lines
            selections: [
                { field: 0, conditionType: 2, condition: ""}
            ],
            // Get module name and version
            fields: [0, 1]
        };
        function getVersion(versionInfos) {
            var version = "";
            versionInfos.forEach(
                function(item) {
                    if (item[0].indexOf("Main System") != -1) {
                        version = item[1];
                    }
                }
            );
            if (version === "") {
                Utilities.print("#ERROR: 'Main System' module is not found "
                                + "in the systeminfo table.");
                failFunc(version);
            }
            else {
                exitFunc(version);
            }
        }
    
        Utilities.getTableValues(getVersion, table, serviceQuery, failFunc);
    },
    
    /**
     * Print the current package info
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {function} exitFunc
     * Function will be executed on success with true as its argument
     * @param {function} [failFunc=exitFunc]
     * Function will be executed on failure with false as its argument
    */
    printPackageInfo: function(exitFunc, failFunc) {
        var failFunc = failFunc || exitFunc;
        var table = de.loewe.sl2.servicemode.versioninfo.table;
        var serviceQuery = {
            // Select all lines
            selections: [
                { field: 0, conditionType: 2, condition: ""}
            ],
            // Get module name and version
            fields: [0, 1, 2, 3]
        };
        function printComponent(allInfo) {
            allInfo.forEach(
                function(item) {
                    Utilities.print("Name:   \t" + item[0]);
                    Utilities.print("Version:\t" + item[1]);
                    Utilities.print("HWID:   \t" + item[2]);
                    Utilities.print("SWID:   \t" + item[3] + "\n");
                }
            );
            exitFunc(true);
        }
    
        Utilities.getTableValues(printComponent, table, serviceQuery, failFunc);
    },
    
    /**
     * Check test result and print required label to command line
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
    */
    printTestResult: function(elementID){
        if (typeof(UTILITIES_TEST_RESULT) != "undefined") {
            Utilities.print("Test result: TEST_FAILED",elementID)
        }
        else {
            Utilities.print("Test result: TEST_PASSED",elementID)
        }
    },
    
    /**
     * Get key by value.
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {object} object
     * @param value
     * @return {string} kye
     * @example
     * // returns 2
     * Utilities.getKey("1","apple");
    */
    getKey: function (obj, value) {
        if (typeof(obj) == "undefined"){
            Utilities.print("#ERROR: Input parameter 'obj' is undefined for "
                            + "'Utilities.getKey' function.");
            return false;
        }
        else if (typeof(value) == "undefined"){
            Utilities.print("#ERROR: Input parameter 'obj' is undefined for "
                            + "'Utilities.getKey' function.");
            return false;
        }
        else{
            for(var key in obj){
                if (obj[key] == value) {
                    var required = key
                }
            }
            if (typeof(required) == "undefined") {
                Utilities.print("WARN: Required value is not found in object.");
                return false;
            }
            else {
                return required;
            }
        }
    },
    /**
     * Call model action with timeout
     * @author vkuchuk@luxoft.com
     * @memberof Utilities
     * @param {object} action api
     * @param args to call with
     * @param callback if timeout
     * @return 
     * @example
    */
    callModelAction: function (action, args, onResult, onError) {
        action.onResult.connect(this, onActionResult)
        action.onError.connect(this, onActionError)
        timerID = window.setTimeout(onTimeout, 10000);
        action.call(args);
        function onActionResult(actionCallId, results){
        window.clearTimeout(timerID);
        onResult(actionCallId, results);
        }
    
        function onActionError(actionCallId, errorCode){
        window.clearTimeout(timerID);
        onError(actionCallId, errorCode);
        }
    
        function onTimeout() {
        window.clearTimeout(timerID);
        Utilities.print("WARN: Call of action does not "
                            +"return response in 10 sec.");
        onError(-1, -1);
        }
    },
    
    /**
     * Pretty print for actual result
     * @author mkustova
     * @memberof Utilities
     * @param {arr} action api
    */
    prettyPrint: function (arr) {
        return arr.reduce(
            function(accum, itm) {
                return accum + '"' + String(itm) + '", '
            },
            "[ "
        ).slice(0, -2) + " ],";
    },
    
    /**
     * Displaying playback progress
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {arr} action 
    */
    streamingProcess: function (streamName, streamLingth, initialPosition, elementID, playerID){
    //global variable as far as can be used in test to call action on specific stream time 
        STREAM_POSITION[playerID] = initialPosition;
        
        if ( elementID != ""){
            var progressID = String(elementID+"progress")
            document.getElementById(elementID).innerHTML = 
                    '<p class="leftstr">Playback of ' +streamName+'</p>'
                    +'<p class="rightstr">'+streamLingth+'s</p>'
                    + '<div style="clear: left"></div>'
                    +'<div id='+progressID+'></div>';
        //print to test log stream info
            Utilities.print("Playback of " + streamName + " is on progress...");
        }
        else {
            var progressID = elementID
        }
    
        
        window.setInterval(function(){display(streamLingth, 
                                              STREAM_POSITION[playerID], 
                                              progressID)
                            }, 1000);
        
        function display(valuemax, value, elementID){   
                STREAM_POSITION[playerID] = value+1;
                var procent = value/valuemax*100;
                if ( elementID != ""){
                    document.getElementById(elementID).innerHTML = 
                        '<div class="progress">'
                            +'<div class="progress-bar progress-bar-info" '
                                +'role="progressbar" aria-valuenow="0" '
                                +'aria-valuemin="0" aria-valuemax="100'
                                +'" style="width: '+procent+'%;">' 
                            + STREAM_POSITION[playerID] +'s </div>' 
                        +'</div>';
                };
                if (valuemax <= value) 
                {
                    STREAM_POSITION[playerID] = 0;
                }
            }
    },
    
    /**
     * Display manual verification on WeBiz window
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {arr} action 
    */
    manualVerification: function (verificationText,
                                  elementID,  
                                  passState,
                                  blockState,
                                  failState,
                                  playerID,
                                  startPosition,
                                  stopPosition){
                                      
        var displayStart = startPosition-STREAM_POSITION[playerID];
        displayStart = (displayStart>0) ? displayStart:0;
        if (stopPosition != 0 && typeof(stopPosition) != "undefined") {
            var displayStop = stopPosition-STREAM_POSITION[playerID];
            displayStop = (displayStop>0) ? displayStop:0;
        }
        else{
            var displayStop=900; //15min
        }
        
        setTimeout(function(){
            var passUIText = verificationText + " - PASSED";
            var blockUIText = verificationText + " - BLOCKED";
            var failUIText = verificationText + " - FAILED";
            
            var passLogText = "#VERIFICATION PASSED: " + passUIText;
            var blockLogText = "#VERIFICATION FAILED: " + blockUIText;
            var failLogText = "#VERIFICATION FAILED: " + failUIText;
    
        //onclick="function('par1','par2')"
        //FIXME! change passState to exitFunc(). 
        //' symbole is the problem for call from 'onclick'          
            document.getElementById(elementID).innerHTML = 
                '<div class="alert alert-info" role="alert">'
                + verificationText + "     " 
                +'<button type="button" class="btn btn-success"' 
                    +'onclick="Utilities.manualResult(\'' +"success"+ "','"
                                                          +passUIText+"','"
                                                          +elementID+"','"
                                                          +passLogText+"','"
                                                          +passState+'\');">'
                +   'Pass'
                + '</button>'
                +' '
                +'<button type="button" class="btn btn-warning"'
                    +'onclick="Utilities.manualResult(\'' +"warning"+ "','"
                                                          +blockUIText+"','"
                                                          +elementID+"','"
                                                          +blockLogText+"','"
                                                          +blockState+'\');">'
                +   'Block'
                + '</button>'
                +' '
                + '<button type="button" class="btn btn-danger"' 
                    +'onclick="Utilities.manualResult(\'' +"danger"+ "','"
                                                          +failUIText+"','"
                                                          +elementID+"','"
                                                          +failLogText+"','"
                                                          +failState+'\');">'
                +   'Fail'
                +'</button>'
                +'</div>';
            },displayStart*1000)
            
                
            DISPLAY_TIMEOUT = setTimeout(function(){
                var blockUIText = verificationText + " - BLOCKED (time is expired)";
                var blockLogText = "#VERIFICATION FAILED: " + blockUIText;
                Utilities.manualResult("warning",
                                        blockUIText,
                                        elementID,
                                        blockLogText,
                                        blockState)
                },displayStop*1000)
                          
            
    },
    
    manualResult: function (resultType, UItext, elementID, logText, exitState){
        if (typeof(DISPLAY_TIMEOUT) != "undefined"){
            clearTimeout(DISPLAY_TIMEOUT)
        }
        Utilities.print(String(logText));
        document.getElementById(elementID).innerHTML =
            '<div class="alert alert-'+resultType+' role="alert">'
            + UItext
            +'</div>';
    //FIXME! change manager([String(exitState)]) to exitFunc(). 
    //' symbole is problem for call from 'onclick'
        if(exitState != 'DNC'){
            manager([String(exitState)])
        }
    },
    
    prindHeader: function (h1, h2, elementID){
        document.getElementById(elementID).innerHTML =  
        '<h1>'+h1+' <small>'+h2+'</small></h1>';
        Utilities.print(h1+': '+h2);
    },
    
    /**
     * Display manual verification on WeBiz window
     * @author Anna Klimovskaya aklimovskaya@luxoft.com
     * @memberof Utilities
     * @param {arr} action 
    */
    timeDependentVerification: function (verification,
                                         playerID,
                                         startPosition,
                                         stopPosition,
                                         timeExpired){
                                      
        var startOfVerification = startPosition-STREAM_POSITION[playerID];
        startOfVerification = (startOfVerification>0) ? startOfVerification:0;
        if (stopPosition != 0 && typeof(stopPosition) != "undefined") {
            var stopOfVerification = stopPosition-STREAM_POSITION[playerID];
            stopOfVerification = (stopOfVerification>0) ? stopOfVerification:0;
        }
        else{
            var stopOfVerification=900; //15min
        }
        
        if (stopOfVerification>0){
            setTimeout(function(){
                    verification();
                },startOfVerification*1000)
        }
        else{
            Utilities.print("#ERROR: Verification can't be executed as far as "
                + "time is expired.");
            timeExpired()
        }                     
            
    }
    
    
    }
    }
    
