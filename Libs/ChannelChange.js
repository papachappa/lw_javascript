//dependency from other libraries
include('Utilities.js');
include('ServiceList.js')
include('Enumerators.js')
include('PressButton.js')

//library helios-kernel interface
init = function() {
/** @namespace
 * Functions to execute channel search
 * @requires Library: {@link Utilities}, {@link ServiceList}
*/
ChannelChange = {

/**
 * Zap to specified service
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ChannelChange
 * @param {string} channelUUID
 * @param {string} channelNumber
 * @param {string} channelType
 *
 * @example
 *
 * @requires Library: {@link Utilities},
*/
zapToService: function(exitFunc,
                       channelUUID,
                       channelNumber,
                       type,
                       listUID,
                       failFunc) {

    var failFunc = failFunc||exitFunc;
//has to be global to do not bind to function context 
    zapTimer = 0;
//Change type from serviceslist table to expected values
    if (type == 4) {
        var type = 4
    }
    if (type == 8) {
        var type = 2
    }
    if (type == 1) {
        var type = 4
    }
    if (type == 2) {
        var type = 2
    }
    
    var TVSERVICE_PLAY = de.loewe.sl2.action.tvservice.play;
    TVSERVICE_PLAY.onError.connect(onChChError);
    TVSERVICE_PLAY.onResult.connect(onChChResult);

    function onChChError() {
        TVSERVICE_PLAY.onError.disconnect(onChChError);
        window.clearTimeout(zapTimer);
        Utilities.print("#VERIFICATION FAILED: Service selection is failed.");
        failFunc();
    }

    function onChChTimeout() {
        window.clearTimeout(zapTimer);
        Utilities.print("WARN: Call of action to select item from dashboard"
                        +"does not return response in 10 sec.");
        window.setTimeout(exitFunc, 3000);
    }

    function onChChResult() {
        TVSERVICE_PLAY.onResult.disconnect(onChChResult);
        window.clearTimeout(zapTimer);
        Utilities.print("#VERIFICATION PASSED: Service was successfully selected.");
        window.setTimeout(exitFunc, 3000);
    }
    
    Utilities.print("Select item...");
// 0 -main window 1 pip
// UUID of favorit list ""-current list, dashboard
    TVSERVICE_PLAY.call(["0", listUID, channelUUID, channelNumber, type]);
    zapTimer = window.setTimeout(onChChTimeout, 10000);

},

/**
 * Zap to channel with verification by DVB triplet.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ChannelChange
 * @param {function} exitFunc
 * Function will be called on success (withSa "true" parameter)
 * @param {number} channelNumber
 * Channel number on which zap should be executed.
 * @param {number} serviceType
 * Media type of the service under interest
 * @param {string} [listName=""]
 * Name of service lists.
 * If parameter is omitted, overall list will be used.
 * @param {function} [failFunc=exitFunc]
 * Function will be called on failure (with "false" parameter)
 * @example
 *
 * @requires Library: {@link Utilities}, {@link ServiceList},
*/
zapWithVerification: function ( exitFunc,
                                channelNumber,
                                serviceType,
                                listName,
                                failFunc
                              ) {
    var listName = listName||"";
 //   var expDvbTriplet;
    var reg = /onid=\d+&sid=\d+&tsid=\d+/;//DVB triplet
    var failFunc = failFunc||exitFunc;
    function zapManager(args) {
        var steps = {
            "GetListUID" : function() {
                ServiceList.getServicelistUID(
                    function(serviceListUID){
                        zapManager(["GetServiceInfo", serviceListUID]);
                    }, listName);
            },
            "GetServiceInfo" : function(listUID) {
                if (Utilities.numberOfElements(listUID[0]) != 1) {
                    Utilities.print("#ERROR: "
                            + Utilities.numberOfElements(listUID[0])
                            + " servicelists '" + listName + "' are found.");
                    Utilities.print("Zap will not be executed.");
                    zapManager(["End", false]);
                }
                else {
                    var query  =  {
                        selections: [
                            { field: 1,
                              conditionType: 1,
                              condition: String(listUID[0]) },

                            { field: 6,
                              conditionType: 1,
                              condition: channelNumber},

                            { field: 21,
                              conditionType: 1,
                              condition: serviceType }
                        ],
                        fields: [7,21,0,2,6,1],
                    }
                var api = de.loewe.sl2.table.servicelist.list;

                Utilities.print("Get service info for channel change...");
                Utilities.getTableValues(function(serviceInfo){
                    zapManager(["ExecuteZap", serviceInfo]);
                    }, api, query);
                }
            },
            "ExecuteZap" : function(serviceInfo) {
                if (serviceInfo[0].length != 0 ){
                    if (serviceInfo[0][0][4] != channelNumber
                        && serviceInfo[0][0][1] != serviceType) {
                        Utilities.print("#ERROR: Services corresponding request"
                                        + " are not found.");
                        Utilities.print("Zap will not be executed.");
                        zapManager(["End", false]);
                    }
                    else {
                        if (serviceType == 4){
                            Utilities.print("Execute channel change "
                                            + "to TV service "
                                            + channelNumber + " '"
                                            + serviceInfo[0][0][2] + "' "
                                            + "from service list "
                                            + listName + ".");
                        }
                        else {
                             Utilities.print("Execute channel change "
                                             + "to Radio service "
                                             + channelNumber + " '"
                                             + serviceInfo[0][0][2] + "' "
                                             + "from service list "
                                             + listName + ".");
                        }
                        expDvbTriplet = String(reg.exec(serviceInfo[0][0][3]));
                        ChannelChange.zapToService(
                            function() {
                                zapManager(["CheckZap"])
                            },
                            serviceInfo[0][0][0],
                            serviceInfo[0][0][4],
                            serviceInfo[0][0][1],
                            serviceInfo[0][0][5]
                        );
                    }
                }
                else {
                    Utilities.print("#ERROR: Services corresponding request "
                                    + "are not found.");
                    zapManager(["End", false]);
                }
            },
            "CheckZap" : function() {
                var currentChannel = de.loewe.sl2.tvservice
                    .uri.main.getValue();
                if (String(reg.exec(currentChannel)) == expDvbTriplet) {
                    Utilities.print("INFO: Channel "
                                    + " change executed correctly, DVB triplet"
                                    + " is equal to expected.");
                    zapManager(["End", true]);
                }
                else {
                    Utilities.print("WARN: DVB triplet"
                                    + " is NOT equal to expected.");
                    zapManager(["End", false]);
                }
            },
            "End" : function(zapResult) {
                if (zapResult[0]) {
                    exitFunc(zapResult[0]);
                }
                else {
                    failFunc(zapResult[0]);
                }
            },
        };
        steps[args[0]](args.splice(1, 1));
    }

    zapManager(["GetListUID"]);
},

/**
 * Zap to channel by service name.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ChannelChange
 * @param {string} serviceName
 * Name of service on which zap should be executed.
 * @param {string} [listName=""]
 * Name of service lists.
 * If parameter is omitted, overall list will be used.
 * @example
 *
 * @requires Library: {@link Utilities}, {@link ServiceList},
*/
zapToServiceByName: function (  exitFunc,
                                serviceName,
                                serviceType,
                                listName,
                                failFunc
                             ) {
    var listName = listName||"";
    var failFunc = failFunc||exitFunc;
    var reg = /onid=\d+&sid=\d+&tsid=\d+/;//DVB triplet
    function zapManager(args) {
        var steps = {
            "GetListUID" : function() {
                ServiceList.getServicelistUID(
                    function(serviceListUID){
                        zapManager(["GetServiceInfo", serviceListUID]);
                    }, listName);
            },
            "GetServiceInfo" : function(listUID) {
                if (Utilities.numberOfElements(listUID[0]) != 1) {
                    Utilities.print("#ERROR: "
                                    + Utilities.numberOfElements(listUID[0])
                                    + " servicelists '" + listName
                                    + "' are found.");
                    Utilities.print("Zap will not be executed.");
                    zapManager(["End", false]);
                }
                else {
                    var query  =  {
                        selections: [
                            { field: 1,
                              conditionType: 1,
                              condition: String(listUID[0]) },

                            { field: 0,
                              conditionType: 1,
                              condition: serviceName},

                            { field: 21,
                              conditionType: 1,
                              condition: serviceType }
                        ],
                        fields: [7,21,0,2,6,1],
                    }
                var api = de.loewe.sl2.table.servicelist.list;

                Utilities.print("Get service info for channel change...");
                Utilities.getTableValues(function(serviceInfo){
                    zapManager(["ExecuteZap", serviceInfo]);
                    }, api, query);
                }
            },
            "ExecuteZap" : function(serviceInfo) {
                if (serviceInfo[0].length != 0 ){
                    if (String(serviceInfo[0][0][2]) != serviceName
                        && serviceInfo[0][0][1] != serviceType) {
                        Utilities.print(
                            "#ERROR: Services satisfying request "
                                + "are not found.");
                        Utilities.print("Zap will not be executed.");
                        zapManager(["End", false]);
                    }
                    else {
                        Utilities.print(
                            "Execute channel change to "
                                + (serviceType == 4 ? "TV" : "Radio")
                                + " service " + serviceInfo[0][0][4]+ " '"
                                + serviceInfo[0][0][2] + "' "
                                + "from service list " + listName + ".");
                        expDvbTriplet = String(reg.exec(serviceInfo[0][0][3]));
                        ChannelChange.zapToService(
                            function() {
                                zapManager(["CheckZap"])
                            },
                            serviceInfo[0][0][0],
                            serviceInfo[0][0][4],
                            serviceInfo[0][0][1],
                            serviceInfo[0][0][5]
                        );
                    }
                }
                else {
                    Utilities.print("#ERROR: Services satisfying request "
                                        + "are not found.");
                    zapManager(["End", false]);
                }
            },
            "CheckZap" : function() {
                var currentChannel = de.loewe.sl2.tvservice
                    .uri.main.getValue();
                if (String(reg.exec(currentChannel)) == expDvbTriplet ) {
                    Utilities.print("INFO: Channel "
                                    + " change executed correctly, DVB triplet"
                                    + " is equal to expected.");
                    zapManager(["End", true]);
                }
                else {
                    Utilities.print("WARN: DVB triplet"
                                    + " is NOT equal to expected.");
                    zapManager(["End", false]);
                }
            },
            "End" : function(zapResult) {
                if (zapResult[0]) {
                    exitFunc(zapResult[0]);
                }
                else {
                    failFunc(zapResult[0]);
                }
            },
        };
        steps[args[0]](args.splice(1, 1));
    }
    zapManager(["GetListUID"]);
},

/**
 * Direct zap to channel with verification by DVB triplet.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ChannelChange
 * @param {function} exitFunc
 * Function will be called on success (with "true" output parameter)
 * @param {number} channelNumber
 * Channel number on which zap should be executed.
 * @param {number} serviceType
 * Media type of the service under interest
 * @param {string} [listName=""]
 * Name of service lists.
 * If parameter is omitted, overall list will be used.
 * @param {function} [failFunc=exitFunc]
 * Function will be called on failure (with "false" parameter)
 * @example
 *
 * @requires Library: {@link Utilities}, {@link ServiceList},
*/
userZapWithVerification: function ( exitFunc,
                                      channelNumber,
                                      serviceType,
                                      listName,
                                      resultChannel,
                                      failFunc
                                    ) {
    var failFunc = failFunc||exitFunc;
    function directZapManager(args) {
        var steps = {
            "GetListUID" : function() {
                Utilities.print( "Check if service in that channel"
                    + " change should be executed is present " 
                    + "in services list.");
                ServiceList.getServicelistUID(
                    function(serviceListUID){
                        directZapManager(["GetServiceInfo", serviceListUID]);
                    }, listName);
            },
            "GetServiceInfo" : function(listUID) {
                if (Utilities.numberOfElements(listUID[0]) != 1) {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + Utilities.numberOfElements(listUID[0])
                                    + " servicelists '" + listName
                                    + "' are found.");
                    Utilities.print("Zap will not be checked.");
                    directZapManager(["EndTest", false]);
                }
                else {
                    testedListUID = listUID[0];
                    if (resultChannel === "" 
                       || typeof(resultChannel) == "undefined") {   
                        var newChannel = channelNumber; 
                    }
                    else {
                        var newChannel = resultChannel; 
                    }
                    var query  =  {
                        selections: [
                            { field: 1,
                              conditionType: 1,
                              condition: String(listUID[0]) },

                            { field: 6,
                              conditionType: 1,
                              condition: newChannel},

                            { field: 21,
                              conditionType: 1,
                              condition: serviceType }
                        ],
                        fields: [7,21,0,2,6,1],
                    }
                    var api = de.loewe.sl2.table.servicelist.list;

                    Utilities.print("Get checked service info...");
                    Utilities.getTableValues(function(serviceInfo){
                        directZapManager(["DirectZap", serviceInfo]);
                    }, api, query);
                }
            },
            "DirectZap" : function(serviceInfo) {
                if ( serviceInfo[0].length != 0 ){
                    if (serviceInfo[0][0][4] != channelNumber
                        && serviceInfo[0][0][1] != serviceType) {
                        Utilities.print( "#VERIFICATION FAILED: Tested service"
                            + " is not found in expected list." );
                        directZapManager(["EndTest", false]);
                    }
                    else {
                        var reg = /onid=\d+&sid=\d+&tsid=\d+/;//DVB triplet
                        expDvbTriplet = String(reg.exec(serviceInfo[0][0][3]));
                        Utilities.print("#VERIFICATION PASSED: Tested service"
                            + " is present in expected list.");
                        if (channelNumber == "P+") {
                            Utilities.print("Execute P+ zap to tested service.");
                            PressButton.singlePress(Key.CHANNEL_UP)
                        }
                        else if (channelNumber == "P-"){
                            Utilities.print("Execute P- zap to tested service.");
                            PressButton.singlePress(Key.CHANNEL_DOWN)
                            }
                        else if (typeof(channelNumber) == "number"){
                            var array = String(channelNumber);
                            for(var key in array){
                                PressButton.singlePress(array[key])
                            }
                            PressButton.singlePress(Key.OK)
                        }
                        window.setTimeout(function(){
                            var currentChannel = de.loewe.sl2.tvservice
                                .uri.main.getValue();
                            if (String(reg.exec(currentChannel)) == expDvbTriplet) {
                                Utilities.print("#VERIFICATION PASSED: Channel "
                                    + "change IS executed to expected service.");
                                directZapManager(["EndTest",true]);
                            }
                            else {
                                Utilities.print("current: " + currentChannel)
                                Utilities.print("expected: " + expDvbTriplet)
                                Utilities.print("#VERIFICATION FAILED: Channel "
                                    + "change is NOT executed to expected service");
                                directZapManager(["EndTest",false]);
                            }
                        }, 7000)
                    }
                }
                else {
                    Utilities.print("#ERROR: Services corresponding request "
                                        + "are not found.");
                    directZapManager(["EndTest", false]);
                }
            },
            "EndTest" : function(zapResult) {
                if (zapResult[0]) {
                    exitFunc(zapResult[0]);
                }
                else {
                    failFunc(zapResult[0]);
                }
            }
        };
        steps[args[0]](args.splice(1, 1));
    }
    directZapManager(["GetListUID"]);
}

}
}
