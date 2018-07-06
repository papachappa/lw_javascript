include('Utilities.js');
include('PressButton.js');
include('Enumerators.js')
include('Scan.js');

init = function() {
/** @namespace
 * Work with CAMs
 * @requires Library: {@link Utilities}
*/
CAM = {

/**
 * Stop CAM authontication
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CAM
*/
stopAuthentication: function (exitFunc) {

    var camMenu = de.loewe.sl2.common.intf.vstr.menu;
    var currentMenu = camMenu.getValue()

    if (currentMenu[6] =="Authentication in progress") {
        Utilities.print("#VERIFICATION PASSED: Authentication menu"
                            + " is displayed.");
        Utilities.print("Stop authentication...");
        PressButton.singlePress(Key.END);
        window.setTimeout(function(){
            currentMenu = camMenu.getValue();
            if (currentMenu.length == 0) {
                Utilities.print("#VERIFICATION PASSED: Authentication"
                                    + " menu is closed.");
                exitFunc()
            }
            else {
                Utilities.print("#VERIFICATION FAILED: Unexpected menu"
                                + " is displayed -'" + currentMenu)
                exitFunc()
            }
        },3000);
    }
    else {
        if (currentMenu.length == 0) {
//two states is ok for current test implementations if no CAM menu is
// displayed and if Authontication menu is displayed 
            Utilities.print("#VERIFICATION PASSED: No CAM message"
                        + " is displayed. " + currentMenu)
            }
        else {
            Utilities.print("#VERIFICATION FAILED: Unexpected menu"
                        + " is displayed -'" + currentMenu)
        }
        exitFunc()
    }

},
/**
 * Verify CAM availability
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof CAM
*/
isCamAvailable: function () {
    var camExists = de.loewe.sl2.i32.channel.search.cam.op
                                                    .exists.getValue();
    return camExists;
},

/**
 * CAM scan
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @param {array} list of selected fronteds
 * @memberof CAM
*/
camScanHandler: function (exitFunc, scanSource, messages, failFunc) {
    var timerID;
    var failFunc = failFunc || exitFunc;
    var camMenu = de.loewe.sl2.common.intf.vstr.menu;
    var camDialog = de.loewe.sl2.i32.channel.search.dialog
                                        .cam.set_signal_sources;
    var camScanState = de.loewe.sl2.tvapi.i32.channel.search
                                                .cam.scan.state;
    var messagesQueue = messages;

    function checkSelectedSource(source) {
        var signalSources = de.loewe.sl2.vint32.channel.search
                                    .cam.signal_sources.getValue();
        var selectedSources = de.loewe.sl2.vint32.channel.search
                                .cam.signal_sources.selected.getValue();
        for (var key in selectedSources){
            selectedSources[key]=0
        }
        
        for (var key in signalSources){
            signalSources[key]=signalSources[key].toString()
        }

        var src = {12 : "DVB-C", 11 : "DVB-T", 13 : "DVB-S" };
        scanSource.forEach(function(entry){
            var currentIndex = signalSources.indexOf(String(entry));
            if (currentIndex != -1){
                selectedSources[currentIndex] = 1
            }
            else {
                Utilities.print("#VERIFICATION FAILED: " + src[entry]
                            + " source is not determinate as"
                            + " possible for scan.");
                Utilities.print("Scan will be started as far as"
                            + " there is no way to refuse it.")
            }
        })
        var setSource = de.loewe.sl2.vint32.channel.search
                                .cam.signal_sources.selected;                     
        setSource.setValue(selectedSources);
        //calculate scan settings lists
        if (scanSource.indexOf(11) !=-1) {
            Utilities.print("INFO: UI for DVB-T settings is not checked, "
                + "default settings are accepted.")
            Utilities.print("Blind passage through scan settings wizard.");
            PressButton.singlePress(Key.FAST_FWD);
        }
        if (scanSource.indexOf(13) !=-1) {
            Utilities.print("INFO: UI for DVB-S settings is not checked, "
                + "default settings are accepted.")
            Utilities.print("Blind passage through scan settings wizard.");
            for (var i=0; i<4; i++) {
                window.setTimeout(function(){
                    PressButton.singlePress(Key.FAST_FWD);}, 2000)
            }
        }
        
        Utilities.print("Start CAM scan.");
        timerID = window.setTimeout(timeOutSSClosed, 5000);
        camDialog.onChange.connect(CheckSSClosed)
        camMenu.onChange.connect(checkCamMenus);
        PressButton.singlePress(Key.FAST_FWD);
    }

    function timeOutOpen() {
        camMenu.onChange.disconnect(checkCamMenus);
        Utilities.print("#VERIFICATION FAILED: Cam Scan is not started"
                        + " during 30 seconds.")
        window.clearTimeout(timerID);
        failFunc()
    }
    
    function timeOutEnd() {
        camMenu.onChange.disconnect(checkCamMenus);
        Utilities.print("#VERIFICATION FAILED: All expected Cam scan messages"
            + " are not displayed during 240 sec after the last one.")
        window.clearTimeout(timerID);
        Utilities.print("Next messages are not displayed:")
        for (var key in messagesQueue) {
            var ind = Number(key)+1;
            Utilities.print(ind + ": field - " 
                                + messagesQueue[key][0]
                                + " content - '" 
                                + messagesQueue[key][1]
                                +"';")
        }
        timerID = window.setTimeout(checkScanEnd, 240000);
        camScanState.onChange.connect(checkScanEnd) 
    }

    function timeOutSSClosed() {
        camDialog.onChange.disconnect(CheckSSClosed);
        Utilities.print("#VERIFICATION FAILED: Cam dialog to select scanned"
                    + " frontend is NOT closed during 5 sec.")
        Utilities.print("One more try to start scan.")
        PressButton.singlePress(Key.FAST_FWD);
        window.setTimeout(CheckSSClosed, 2000)
    }
    
    function CheckSSClosed() {
        window.clearTimeout(timerID);
        if (camDialog.getValue() == 0) {
            Utilities.print("#VERIFICATION PASSED: Cam dialog to"
                        + " select scanned frontend is closed.");
            timerID = window.setTimeout(timeOutOpen, 30000);
        }
        else {
            Utilities.print("#VERIFICATION FAILED: Cam dialog to select"
                        +" scanned frontend is NOT closed.");
            failFunc()
        }
    }
    
    function checkScanEnd(){
        var current = camScanState.getValue()
        window.clearTimeout(timerID);
        camScanState.onChange.disconnect(checkScanEnd);
        if (current == 0 || current == 2){
            Utilities.print("#VERIFICATION PASSED: CI scan is finished");
            exitFunc()
        }
        else {
            var states ={ 1:"wait", 2:"ready", 3: "progress"}
            Utilities.print("#VERIFICATION FAILED: CI scan is in '"
                            + states[current] + "' state.");
            Utilities.print("INFO: The following logic is implemented for the CAM scan state"
                + ", which has a misleading name:")
            Utilities.print("- It is reset to WAITING once the initial installation is started.")
            Utilities.print("- It is set to READY if at least one CAM requested an operator" 
                + "profile scan, and it is known from all the CAMs whether or not they support"
                + " an operator profile scan or a timeout has elapsed.")
            Utilities.print("- It is set to FINISHED if none of the CAMs requested an operator"
                + "profile scan, and it is known from all the CAMs whether or not they support"
                + " an operator profile scan or a timeout has elapsed.")
            Utilities.print("The value is of no significance after the initial installation"
                + "wizard has stepped over the point where it displays the screen that it is"
                + " waiting for the CAM.");
            failFunc()
        }
    }

    function checkCamMenus() {
        var currentMenu = camMenu.getValue();
        window.clearTimeout(timerID);
        timerID = window.setTimeout(timeOutEnd, 240000);
        if (messagesQueue.length == 0){
            if (currentMenu.length != 0){
                Utilities.print("WARN: Some message that is not described"
                        + " in test result is displayed.");
                Utilities.print(currentMenu);
            }
            else {
                Utilities.print("#VERIFICATION PASSED: All CI messages "
                            + "were displayed and closed.");
                window.clearTimeout(timerID);
                timerID = window.setTimeout(checkScanEnd, 30000);
                camScanState.onChange.connect(checkScanEnd)        
            }
        }
        else {
            if (currentMenu[messagesQueue[0][0]] == messagesQueue[0][1]) {
                Utilities.print("#VERIFICATION PASSED: Expected message '"
                        + messagesQueue[0][1] 
                        + "' is displayed.");
                messagesQueue = messagesQueue.slice(1);
            }
            else if (currentMenu.length != 0) {
                Utilities.print("WARN: Some message that is not described"
                        + " in test result is displayed.");
                Utilities.print(currentMenu)
            }
            else {
                Utilities.print("All messages currently closed");
            }
        }
    }

    if (camDialog.getValue() == 0) {
        Utilities.print("#VERIFICATION FAILED: Cam dialog to select scanned"
                        + " frontend is not displayed.");
        failFunc();
    }
    else {
        Utilities.print("#VERIFICATION PASSED: Cam dialog to select scanned"
                        + " frontend is displayed.");
        checkSelectedSource(scanSource);
    }

},

/**
 * CAM initial scan
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @param {array} list of selected fronteds
 * @memberof CAM
*/
camInitialScanHandler: function (exitFunc, messages, continueFunc, failFunc) {
    var timerID;
    var failFunc = failFunc || exitFunc;
    var camMenu = de.loewe.sl2.common.intf.vstr.menu;
    var camDialog = de.loewe.sl2.i32.channel.search.dialog
                                        .cam.set_signal_sources;
    var camScanState = de.loewe.sl2.tvapi.i32.channel.search
                                                .cam.scan.state;
    var searchState = de.loewe.sl2.tvapi.i32.channel
                                            .search.search.state;
    var messagesQueue = messages;

    function timeOutOpen() {
        camMenu.onChange.disconnect(checkCamMenus);
        Utilities.print("#VERIFICATION FAILED: No of CAM messages were" 
                +" displayed in 30 sec after scan is started. It is"
                +" determinated as no CAM is started.");
        checkScanEnd()
    }
    
    function timeOutEnd() {
        if (messagesQueue.length !=0 ) {
            Utilities.print("#VERIFICATION FAILED: All expected Cam scan messages"
                + " are not displayed during 240sec after the last one.")
            window.clearTimeout(timerID);
            Utilities.print("Next messages are not displayed:")
            for (var key in messagesQueue) {
                var ind = Number(key)+1;
                Utilities.print(ind + ": field - " 
                                    + messagesQueue[key][0]
                                    + " content - '" 
                                    + messagesQueue[key][1]
                                    +"';")
            }
            timerID = window.setTimeout(checkScanEnd, 240000); 
        }
        camScanState.onChange.connect(checkScanEnd) 
    }
    
    function checkScanEnd(){
        var current = camScanState.getValue()
        window.clearTimeout(timerID);
        if (current == 0 || current == 2){
            Utilities.print("#VERIFICATION PASSED: Current CI scan is finished.");
            Utilities.print("scanMethod" +scanMethod);
            if (scanMethod == 2) {
                camScanState.onChange.disconnect(checkScanEnd);
                camMenu.onChange.disconnect(checkCamMenus);
                exitFunc()
            }
            else {
//if error happend during scan, we should not disconnect from cam api, 
//as far as scan can be repeated 
                if (searchState.getValue() != 11 ){
                    camScanState.onChange.disconnect(checkScanEnd);
                    camMenu.onChange.disconnect(checkCamMenus);
                }
                if (searchState.getValue() == 0 ) {
                    Utilities.print("#VERIFICATION PASSED: Scan complitely finished");
                    exitFunc()
                }
            }
        }
        else {
            var states ={ 1:"wait", 3: "progress"}
            Utilities.print("#VERIFICATION FAILED: CI scan is in '"
                            + states[current] + "' state.");
            Utilities.print("INFO: The following logic is implemented for the CAM scan state"
                + ", which has a misleading name:")
            Utilities.print("- It is reset to WAITING once the initial installation is started.")
            Utilities.print("- It is set to READY if at least one CAM requested an operator" 
                + "profile scan, and it is known from all the CAMs whether or not they support"
                + " an operator profile scan or a timeout has elapsed.")
            Utilities.print("- It is set to FINISHED if none of the CAMs requested an operator"
                + "profile scan, and it is known from all the CAMs whether or not they support"
                + " an operator profile scan or a timeout has elapsed.")
            Utilities.print("The value is of no significance after the initial installation"
                + "wizard has stepped over the point where it displays the screen that it is"
                + " waiting for the CAM.");
            if (scanMethod == 1) {
                camScanState.onChange.disconnect(checkScanEnd);
                camMenu.onChange.disconnect(checkCamMenus);
                failFunc()
            }
            else if (searchState.getValue() == 0 ) {
                camScanState.onChange.disconnect(checkScanEnd);
                camMenu.onChange.disconnect(checkCamMenus);
                failFunc()
            }
        }
    }

    function checkCamMenus() {
        var currentMenu = camMenu.getValue();
        window.clearTimeout(timerID);
        if (messagesQueue.length == 0){
            if (currentMenu.length != 0){
                Utilities.print("WARN: CAM message that is not described in"
                                + " expeced result is displayed.");
                Utilities.print(currentMenu);
            timerID = window.setTimeout(timeOutEnd, 240000);
            }
            else {
                Utilities.print("#VERIFICATION PASSED: All CAM messages "
                            + "were displayed and closed.");
                window.clearTimeout(timerID);
                timerID = window.setTimeout(checkScanEnd, 30000);
                camScanState.onChange.connect(checkScanEnd)        
            }
        }
        else {
            timerID = window.setTimeout(timeOutEnd, 240000);
            if (currentMenu[messagesQueue[0][0]] == messagesQueue[0][1]) {
                Utilities.print("#VERIFICATION PASSED: Expected CAM message '"
                        + messagesQueue[0][1] 
                        + "' is displayed.");
                messagesQueue = messagesQueue.slice(1);
            }
            else if (currentMenu.length != 0) {
                Utilities.print("WARN: CAM message that is not described in"
                    + " expeced result is displayed.");
                Utilities.print(currentMenu)
            }
            else {
                Utilities.print("All messages currently closed");
                if (camScanState.getValue() == 0 ) {
                    checkScanEnd()
                }
            }
        }
    }

    var scanMethod = de.loewe.sl2.tvapi.i32.channel.search.scan.method.getValue();
    if (scanMethod == 2){
        Utilities.print("Start Cam scan."); 
        camMenu.onChange.connect(checkCamMenus);
        var startSearch = de.loewe.sl2.action.channel.search.initial.search;
        timerID = window.setTimeout(timeOutOpen, 30000);
        startSearch.call()
    }
    else if(scanMethod == 3){
        //~ camMenu.onChange.connect(checkCamMenus);
        //~ timerID = window.setTimeout(timeOutOpen, 30000);
        continueFunc()
    }
    else if(scanMethod == 1 ){
        continueFunc()
    }
    else{
         Utilities.print("Unsupported value of search.scan.method = " + scanMethod);
    }
},

/**
 * Delay function call until the end of currently running scan.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called if no scan is active.
 * @example
 * // call startTest() function when no scans are active.
 * Scan.waitScanFinish(startTest)
 * @requires Library: {@link Utilities},
*/
waitCamScanFinish: function(exitFunc) {

    var camScanState = de.loewe.sl2.tvapi.i32.channel.search.cam.scan.state.getValue();

    if (camScanState == 0 || camScanState == 2) {
        Utilities.print("No CAM search is in progress.");
        exitFunc();
    }
    else {
       var states ={ 1:"wait", 3: "progress"}
       Utilities.print("CI scan is in '" + states[camScanState] + "' state.");
       Utilities.print("There is no investigation how to handle this state.");
       Utilities.print("WARN: test will be continued as is.");
       exitFunc();
     }

}


}
}
