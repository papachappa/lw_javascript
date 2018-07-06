include('../Utilities.js');
include('../ServiceList.js');

init = function () {

/** @namespace
* Test script to create new favorite list of services.
* @requires Library: {@link Utilities}, {@link ServiceList}
*/
ComplexFavoriteList = {

NEW_LIST: "ComplexFavoriteList",
ADD_CHANNELS: [],
ADD_SERVICES: [],
MEDIA_TYPE: 4,
END: function(){            
    Utilities.print("Test finished.");
    Utilities.printTestResult();
    Utilities.endTest()
    },

/**
 * Set test variables and start test execution.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ComplexFavoriteList
 * 
 * @param {4|8} mediaType
 * Media type of services that new list should contain
 * 4 - TV, 8 - Radio
 * see {@link Mediatype} for available values;
 *
 * @param {string} [newListName = "ComplexFavoriteList"]
 * Name of new favorite list
 * If name is "", then current list with ComplexFavoriteList will be created.
 * 
 * @param {array} addChannels = [["chNum1", "initList1"],
 *                               ["chNum1", "initList1"],
 *                               ["chNum1", "initList1"]]
 * Array of channel numbers that should be added to new list 
 * (channel numbers should be correlated with initial list names)
 * ATTENTION! UI doesn't allow to add one service twice into list , but you can do it
 * using this script
 * 
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set ComplexFavoriteList.manager will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished 
 * with result printing after verification of list creation will be executed.
 * 
 * @requires Library: {@link Utilities}
 */
startTest: function (mediaType,
                     newListName,
                     addChannels,
                     exitFunc) {
//index 1 and 4 are used for list creation instead of 4 and 8 from ./Enumerators.js                        
    if (mediaType == 1) {
        var mediaType = 4
    }
    if (mediaType == 2) {
        var mediaType = 8
    }                    
    ComplexFavoriteList.MEDIA_TYPE = mediaType;

    if ( typeof(newListName) == "undefined"
         || newListName == "") {
        Utilities.print("INFO: 'ComplexFavoriteList' will be created as far as  "
                        + "newListName is not set in input parameters.");
        ComplexFavoriteList.NEW_LIST = "ComplexFavoriteList"
    }
    else {
        ComplexFavoriteList.NEW_LIST = newListName
    }

    if (typeof(addChannels) != "undefined"
    && addChannels != ""
    && addChannels.length != 0){
        ComplexFavoriteList.ADD_CHANNELS = addChannels
    }
    else{
        Utilities.print("WARN: Empty favorite list will be created as "
                        + "far as addChannels is not specified.");
        ComplexFavoriteList.ADD_CHANNELS = []    
    }
   
    if ( typeof(exitFunc) != "undefined" && exitFunc != "") {
        ComplexFavoriteList.END=exitFunc;
        ComplexFavoriteList.manager(["GetListUID"])
    }
    else {
        ComplexFavoriteList.END = function(){           
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        };
        ComplexFavoriteList.manager(["Connect"])
    }

},

/**
 * Create new favorite list of services.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof ComplexFavoriteList
 * @requires Library: {@link Utilities}, {@link ServiceList}
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Get UIDs of services that should be added " 
                            + "to new favorite list.");
            Utilities.print("3. Create new service list is all required "
                            + "services are found.");
            Utilities.print("4. Check if new list is created.");
            Utilities.print("5. Add required services to new list.");
            Utilities.print("6. Check if new list contains all required"
                            + " services.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                ComplexFavoriteList.manager(["GetListUID"]);
            });
        },
        "GetListUID" : function() {
            if (ComplexFavoriteList.ADD_CHANNELS.length > 0) {
                Utilities.print("Get UIDS of service with channel number "
                + ComplexFavoriteList.ADD_CHANNELS[0][0] 
                + " form service list " 
                + ComplexFavoriteList.ADD_CHANNELS[0][1] + "...");
                ServiceList.getServicelistUID(
                    function(serviceListUID){
                        ComplexFavoriteList.manager(["GetServiceInfo"
                                                    , serviceListUID]);
                    }, ComplexFavoriteList.ADD_CHANNELS[0][1]);
            }
            else {
                ComplexFavoriteList.manager(['CreateNewList'])    
            }
        },
        "GetServiceInfo" : function(listUID) {
            if (Utilities.numberOfElements(listUID[0]) != 1) {
                Utilities.print(Utilities.numberOfElements(listUID[0])
                                + " service lists with name containing '" 
                                + ComplexFavoriteList.INITIAL_LIST + "' are found.");
                Utilities.print("#ERROR: New list will NOT be created as"
                        + " far as not clear which service list should "
                        + "be used as source of services.") 
                ComplexFavoriteList.manager(["EndTest"]);
            }
            else {
                var servicesQuery = {
                    selections:   [
                     {
                      field:1, 
                      conditionType:1,
                      condition:String(listUID[0][0])
                     },
                    {
                      field:21, 
                      conditionType:1,
                      condition:ComplexFavoriteList.MEDIA_TYPE
                     },
                     {
                      field:6,
                      conditionType:1,
                      condition:ComplexFavoriteList.ADD_CHANNELS[0][0]
                     }
                    ],
                    fields:       [7],
                    orders:       [{field: 6, direction: 1}]
                };

                var api = de.loewe.sl2.table.servicelist.list;

                Utilities.print("Get services UID...");
                Utilities.getTableValues(function(services){
                    ComplexFavoriteList.manager(["CreateUIDsList", services]);
                }, api, servicesQuery);
            }
        },
        "CreateUIDsList" : function(services) {
            if (services[0].length > 0) {
                Utilities.print("INFO: Service is found and will be added"
                                + " to new favorite list.");
                ComplexFavoriteList.ADD_SERVICES.push(services[0]);
                ComplexFavoriteList.ADD_CHANNELS 
                            = ComplexFavoriteList.ADD_CHANNELS.slice(1);
                ComplexFavoriteList.manager(['GetListUID']);
            }
            else {
                Utilities.print("#ERROR: Required service is not found. "
                                + "New favorite list will not be created.");
                ComplexFavoriteList.manager(['ListIsNotCreated'])                                
            }
        },
        "CreateNewList" : function() {
            ServiceList.createNewList(function(listUID){
                           ComplexFavoriteList.manager(['AddServices', listUID])},
                           ComplexFavoriteList.NEW_LIST,
                           ComplexFavoriteList.MEDIA_TYPE,
                           function(){ComplexFavoriteList.manager(['ListIsNotCreated'])})

        },
        "ListIsNotCreated" : function() {
            Utilities.print("#VERIFICATION FAILED: Required service list is " 
                            + "not created.");
            ComplexFavoriteList.manager(["EndTest"]);
        },
        "AddServices" : function(listUID) {
            if (ComplexFavoriteList.ADD_SERVICES.length>0) {
                Utilities.print("Add services to created favorite list...");
                ServiceList.updateFavoriteList(function(){
                   ComplexFavoriteList.manager(['EndTest', true])},
                   ComplexFavoriteList.MEDIA_TYPE,
                   listUID[0][0],
                   ComplexFavoriteList.ADD_SERVICES,
                   function(){ComplexFavoriteList.manager(['ListIsNotUpdated'])})
            }
            else {
                Utilities.print("#VERIFICATION PASSED: Empty services list"
                                + " is created");
                ComplexFavoriteList.manager(['EndTest',true])
            }
        },
        "ListIsNotUpdated" : function() {
            Utilities.print("#VERIFICATION FAILED: Required service list is " 
                            + "not updated according to request.");
            ComplexFavoriteList.manager(["EndTest"]);

        },
        "EndTest" : function(result){
            if (result[0]){
                Utilities.print("#VERIFICATION PASSED: Required Favorite list '"
                            + ComplexFavoriteList.NEW_LIST + "' is created.")
            };
            ComplexFavoriteList.END(result[0]||false);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}
}
