include('../Utilities.js');
include('../ServiceList.js');

init = function () {

/** @namespace
* Test script to create new favorite list of services.
* @requires Library: {@link Utilities}, {@link ServiceList}, {@link Enumerators}
*/
SetAttributeToServices = {

INITIAL_LIST: "#3052",
CHANNELS: "all",
SERVICES_UIDS: [],
FOUND_CHANNELS: [],
MEDIA_TYPE: 4,
ATTRIBUTE: undefined,
ATTRIBUTE_NAME: undefined,
VALUE: 0,
TEST_RESULT:true,
END: function(){            
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
    },

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof SetAttributeToServices
 * 
 * @param {number} attribute
 * Service attribute that has to be set to reqiured value
 * see {@link SL_Attributes } for available values;
 * 
 * @param {0|1} value
 * Attribute value (0-NO, 1-YES)
 * 
 * @param {string} [initialList = "#3052"]
 * Service list name that should be use as service source.
 * If name is "" overflow list will be used
 * 
 * @param {4|8} mediaType
 * Media type of services that new list should contain
 * 4 - TV, 8 - Radio
 * see {@link Mediatype} for available values;
 * @param {array} [channels = all]
 * Array  of channel numbers of services in initial list there requied 
 * attribute has to be set
 * If parameter is omitted, all services from initialList will be updated
 * 
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set SetAttributeToServices.manager will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished 
 * with result printing after verification of list creation will be executed.
 * 
 * @requires Library: {@link Utilities}, {@link Enumerators}
 */
startTest: function (attribute,
                     attributeValue,
                     mediaType,
                     channels,
                     initialList,
                     exitFunc) {

    if (typeof(attribute) == "number") {
        SetAttributeToServices.ATTRIBUTE= attribute
        SetAttributeToServices.ATTRIBUTE_NAME = Utilities.getKey(SL_Attributes,
                                                                attribute)
    }
    else {
         Utilities.print("#ERROR: input parameter of attribute is not "
                        + "specified as required current library.");
         if ( typeof(exitFunc) == "undefined" && exitFunc == "") {
            exitFunc(false);
        }
        else {
            Utilities.print("Test finished.");
            Utilities.print("TEST_FAILED");
            setTimeout(jbiz.exit,1000)
        }
    }  
    
    if (attributeValue === 0 || attributeValue === 1) {
        SetAttributeToServices.VALUE = attributeValue
    }
    else {
        Utilities.print("#ERROR: input parameter of attrubute value is not "
                        + "specified as required current library.");
         if ( typeof(exitFunc) == "undefined" && exitFunc == "") {
            exitFunc(false);
        }
        else {
            Utilities.print("Test finished.");
            Utilities.print("TEST_FAILED");
            setTimeout(jbiz.exit,1000)
        }
    }
    
    if (mediaType == 4 || mediaType == 8) {
        SetAttributeToServices.MEDIA_TYPE = mediaType 
    }
    else {
        Utilities.print("#ERROR: services type is not defined in input value.");
        if ( typeof(exitFunc) == "undefined" && exitFunc == "") {
            exitFunc(false);
        }
        else {
            Utilities.print("Test finished.");
            Utilities.print("TEST_FAILED");
            setTimeout(jbiz.exit,1000)
        }
    }             

    if ( typeof(initialList) == "undefined"
         || initialList == "") {
        Utilities.print("INFO: Overflow list will be used " 
                        + "as source of services");
    }
    else {
        SetAttributeToServices.INITIAL_LIST = initialList;
    }
    
    if (typeof(channels) != "undefined"
        && channels != ""
        && channels.length != 0){
            SetAttributeToServices.CHANNELS = channels
        }
        else{
            var type = {"4":"TV", "8":"Radio"};
            
            Utilities.print("INFO: For aLL " 
                + type[SetAttributeToServices.MEDIA_TYPE] 
                + " services from services list '" 
                + SetAttributeToServices.INITIAL_LIST + "' attribute " 
                + SetAttributeToServices.ATTRIBUTE_NAME + "will be set to "
                + SetAttributeToServices.VALUE);    
        }
   
    if ( typeof(exitFunc) == "undefined" && exitFunc == "") {
        SetAttributeToServices.END=exitFunc;
        SetAttributeToServices.manager(["GetListUID"])
    }
    else {
        SetAttributeToServices.END = function(){            
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        }
        SetAttributeToServices.manager(["Connect"])
    }

},

/**
 * Set attribute for services.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof SetAttributeToServices
 * @requires Library: {@link Utilities}, {@link ServiceList}
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Get initial list UUID");
            Utilities.print("3. Get UUIDs of services that should be updated");
            Utilities.print("4. Set attribute to required value");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                SetAttributeToServices.manager(["GetListUID"]);
            });
        },
        "GetListUID" : function() {
            Utilities.print("Get initial service list...")
            ServiceList.getServicelistUID(
                function(serviceListUID){
                    SetAttributeToServices.manager(["GetServiceInfo",
                                                    serviceListUID]);
                }, SetAttributeToServices.INITIAL_LIST);
        },
        "GetServiceInfo" : function(listUID) {
            if (Utilities.numberOfElements(listUID[0]) != 1) {
                Utilities.print(Utilities.numberOfElements(listUID[0])
                                + " service lists with name '" 
                                + SetAttributeToServices.INITIAL_LIST + "' are found.");
                Utilities.print("#ERROR: Services won't be updated as"
                        + " far as not clear which service list should "
                        + "be used as source of services.") 
                SetAttributeToServices.TEST_RESULT = false;
                SetAttributeToServices.manager(["EndTest"]);
            }
            else {
                var servicesQuery = {
                    selections:   [{field:1, conditionType:1, condition:String(listUID[0])},
                                   {field:21, conditionType:1, condition:String(SetAttributeToServices.MEDIA_TYPE)}],
                    fields:       [7,6],
                    orders:       [{field: 6, direction: 1}]
                };

            Utilities.print("Get UIDS of all services from initial list...");
            Utilities.getTableValues(function(services){
                                SetAttributeToServices.manager(["CreateUIDsList", services]);
                            }, de.loewe.sl2.table.servicelist.list, servicesQuery);
                    }
        },
        "CreateUIDsList" : function(services) {
            Utilities.print("Create list of UUIDs of services that should" 
                            + " be updated...");
            if (SetAttributeToServices["CHANNELS"]["0"] == "all" ){
                var type = {"4":"TV", "8":"Radio"};
                Utilities.print("INFO: Atribute will be set for all "
                            + type[SetAttributeToServices.MEDIA_TYPE] 
                            + " services from services list '" 
                            + SetAttributeToServices.INITIAL_LIST + "'.");
                services[0].forEach(
                    function(line) {
                            SetAttributeToServices.SERVICES_UIDS.push(line[0]);
                            SetAttributeToServices.FOUND_CHANNELS.push(line[1]);
                    }
                );
                SetAttributeToServices.manager(['SetAttribute'])
            }
            else {
                var foundChannels = [];
                var allChannels = [];
//create array of channel numbers
                services[0].forEach(
                        function(line) {
                            allChannels.push(line[1])
                        }
                    );
                for (var key in SetAttributeToServices.CHANNELS){
                    //RRR stupid javacsript can't compare stings and numbers
                    SetAttributeToServices.CHANNELS[key] 
                    = SetAttributeToServices.CHANNELS[key].toString();
                    //get index of required service
                    var curIndex = allChannels.indexOf(SetAttributeToServices.CHANNELS[key])
                    if (curIndex != -1) {
                        SetAttributeToServices.SERVICES_UIDS.push(services[0][curIndex][0]);
                            foundChannels.push(services[0][curIndex][1]);
                    }
                    else {
                        Utilities.print("#ERROR: Services with channel number " 
                                        + SetAttributeToServices.CHANNELS[key] 
                                        + " is not found");
                        SetAttributeToServices.TEST_RESULT = false
                    }
                }
                if (SetAttributeToServices.CHANNELS.length 
                   != SetAttributeToServices.SERVICES_UIDS.length ){
                    Utilities.print("#ERROR: " 
                        + SetAttributeToServices.CHANNELS.length 
                        + " services have been found in initial list instead of "
                        +" required " + SetAttributeToServices.SERVICES_UIDS.length  
                        +". Attribute will be set for other found services.")
                    Utilities.print("INFO: requested channel numbers - "
                        + SetAttributeToServices.CHANNELS) 
                    Utilities.print("INFO: found channel numbers - "
                        + foundChannels)
                }
                else {
                    Utilities.print("INFO: All required services are found.");
                }
                SetAttributeToServices.manager(['SetAttribute'])                
            }
        },
        "SetAttribute" : function() {
            Utilities.print("Set attribute " 
            + SetAttributeToServices.ATTRIBUTE_NAME +" to "
            + SetAttributeToServices.VALUE + " for found channels."); 
            ServiceList.setAttribute(function(){
                   SetAttributeToServices.manager(['EndTest'])},
                   SetAttributeToServices.ATTRIBUTE,
                   SetAttributeToServices.VALUE,
                   SetAttributeToServices.SERVICES_UIDS,
                   function(){SetAttributeToServices.TEST_RESULT = false;
                              SetAttributeToServices.manager(['EndTest'])})
        },
        "EndTest" : function(){
            SetAttributeToServices.END(SetAttributeToServices.TEST_RESULT);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}
}
