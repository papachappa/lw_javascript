include('../Utilities.js');
include('../ServiceList.js');

init = function () {

/** @namespace
* Test script to create new favorite list of services.
* @requires Library: {@link Utilities}, {@link ServiceList}
*/
NewFavoriteList = {

INITIAL_LIST: "",
NEW_LIST: "NewFavoriteList",
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
 * @memberof NewFavoriteList
 * 
 * @param {4|8} mediaType
 * Media type of services that new list should contain
 * 4 - TV, 8 - Radio
 * see {@link Mediatype} for available values;
 *
 * @param {string} [newListName = "NewFavoriteList"]
 * Name of new favorite list
 * If name is "", then current list with NewFavoriteList will be created.
 * 
 * @param {string} [initialList = ""]
 * Service list name that should be use as service source.
 * If name is "", empty list will be created.
 * 
 * @param {array} [addChannels = all]
 * Array  of channel numbers of services in initial list that should be     
 * added in new list.
 * If parameter is omitted, all visible services from initialList will be added 
 * to new service list (if initialList is defined)
 * 
 * @param {function} [exitFunc = function(){            
 *    Utilities.print("Test finished.");
 *    Utilities.printTestResult();
 *    Utilities.endTest()
 *    }]
 * Function that should be called at the end.
 * If parameter is set NewFavoriteList.manager will be executed as test step,
 * i.e. connection and end of test won't be executed
 * If parameter is not set, script will be executed as separate test, i.e
 * connection to TV will be called as first step, test will be finished 
 * with result printing after verification of list creation will be executed.
 * 
 * @requires Library: {@link Utilities}
 */
startTest: function (mediaType,
                     newListName,
                     initialList,
                     addChannels,
                     exitFunc) {
//index 1 and 4 are used for list creation instead of 4 and 8                       
    if (mediaType == 1) {
        var mediaType = 4
    }
    if (mediaType == 2) {
        var mediaType = 8
    }                    
    NewFavoriteList.MEDIA_TYPE = mediaType;

    if ( typeof(newListName) == "undefined"
         || newListName == "") {
        Utilities.print("INFO: 'NewFavoriteList' will be created as far as  "
                        + "newListName is not set in input parameters.");
        NewFavoriteList.NEW_LIST = "NewFavoriteList"
    }
    else {
        NewFavoriteList.NEW_LIST = newListName
    }

    if ( typeof(initialList) == "undefined"
         || initialList == "") {
        Utilities.print("INFO: Empty list will be created as far as "
                        + "initialList is not set in input parameters.");
        NewFavoriteList.INITIAL_LIST = "";
        NewFavoriteList.ADD_CHANNELS = []
    }
    else {
        NewFavoriteList.INITIAL_LIST = initialList;
        if (typeof(addChannels) != "undefined"
        && addChannels != ""
        && addChannels.length != 0){
            NewFavoriteList.ADD_CHANNELS = addChannels
        }
        else{
            var type = {"4":"TV", "8":"Radio"};
            Utilities.print("INFO: ALL visible " 
                + type[NewFavoriteList.MEDIA_TYPE] 
                + " services from services list " 
                + NewFavoriteList.INITIAL_LIST + " will be added to new list '" 
                + NewFavoriteList.NEW_LIST + "' as far as channel numbers "
                + "are not specified in addChannels.");
            Utilities.print("Services will be sorted "
                + "according to channel numbers in initial list.");
            NewFavoriteList.ADD_CHANNELS = []    
        }
    }
   
    if ( typeof(exitFunc) != "undefined" && exitFunc != "") {
        NewFavoriteList.END=exitFunc;
        NewFavoriteList.manager(["GetListUID"])
    }
    else {
        NewFavoriteList.END = function(){           
            Utilities.print("Test finished.");
            Utilities.printTestResult();
            Utilities.endTest()
        }
        NewFavoriteList.manager(["Connect"])
    }

},

/**
 * Create new favorite list of services.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof NewFavoriteList
 * @requires Library: {@link Utilities}, {@link ServiceList}
 */
manager: function (args) {
    var steps = {
        "Connect" : function() {
            Utilities.print(" ");
            Utilities.print("Test description:");
            Utilities.print("1. Connect PC to TV.");
            Utilities.print("2. Get initial list UUID if not empty list"
                            + " should be created.");
            Utilities.print("3. Get UUIDs of services that should be added " 
                            + "to new favorite list.");
            Utilities.print("4. Create new service list.");
            Utilities.print("5. Check if new list is created.");
            Utilities.print("6. Add required services to new list.");
            Utilities.print("7. Check if new list contains all required"
                            + " services.");
            Utilities.print(" ");
            Utilities.print("Test execution:");
            Utilities.connectToTV( function(){
                NewFavoriteList.manager(["GetListUID"]);
            });
        },
        "GetListUID" : function() {
            if (NewFavoriteList.INITIAL_LIST == ""){
                NewFavoriteList.manager(['CreateNewList'])
            }
            else {
                Utilities.print("Get initial service list...")
                ServiceList.getServicelistUID(
                    function(serviceListUID){
                        NewFavoriteList.manager(["GetServiceInfo"
                                                    , serviceListUID]);
                    }, NewFavoriteList.INITIAL_LIST);
            }
        },
        "GetServiceInfo" : function(listUID) {
            if (Utilities.numberOfElements(listUID[0]) != 1) {
                Utilities.print(Utilities.numberOfElements(listUID[0])
                                + " service lists with name containing '" 
                                + NewFavoriteList.INITIAL_LIST + "' are found.");
                Utilities.print("#ERROR: New list will NOT be created as"
                        + " far as not clear which service list should "
                        + "be used as source of services.") 
                NewFavoriteList.manager(["EndTest"]);
            }
            else {
                Utilities.print("Get UIDS of services that should be added"
                            + " to new favorite list...");

                var servicesQuery = {
                    selections:   [{field:1, conditionType:1, condition:String(listUID[0])},
                                   {field:21, conditionType:1, condition:String(NewFavoriteList.MEDIA_TYPE)}],
                    fields:       [7,6,21,24],
                    orders:       [{field: 6, direction: 1}]
                };

            Utilities.print("Get services...");
            Utilities.getTableValues(function(services){
                                NewFavoriteList.manager(["CreateUIDsList", services]);
                            }, de.loewe.sl2.table.servicelist.list, servicesQuery);
                    }
        },
        "CreateUIDsList" : function(services) {
            Utilities.print("Create list of UUIDs of services that should" 
                            + " be added to list...");
            if (NewFavoriteList.ADD_CHANNELS.length == 0 ){
                Utilities.print("INFO: All visible services will be added to list.");
                services[0].forEach(
                    function(line) {
                        if (line[2] == NewFavoriteList.MEDIA_TYPE
                            && line[3] == 1) {
                            NewFavoriteList.ADD_SERVICES.push(line[0]);
                            NewFavoriteList.ADD_CHANNELS.push(line[1]);
                        }
                    }
                );
                NewFavoriteList.manager(['CreateNewList'])
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
                for (var key in NewFavoriteList.ADD_CHANNELS){
                    //RRR stupid javacsript can't compare stings and numbers
                    NewFavoriteList.ADD_CHANNELS[key] 
                    = NewFavoriteList.ADD_CHANNELS[key].toString();
                    //get index of required service
                    var curIndex = allChannels.indexOf(NewFavoriteList.ADD_CHANNELS[key])
                    if (curIndex != -1) {
                        NewFavoriteList.ADD_SERVICES.push(services[0][curIndex][0]);
                            foundChannels.push(services[0][curIndex][1]);
                    }
                    else {
                        Utilities.print("#ERROR: Services with channel number " 
                                        + NewFavoriteList.ADD_CHANNELS[key] 
                                        + " is not found");
                    }
                }
                if (NewFavoriteList.ADD_CHANNELS.length 
                   != NewFavoriteList.ADD_SERVICES.length ){
                    Utilities.print("#ERROR: " 
                        + NewFavoriteList.ADD_CHANNELS.length 
                        + " services have been found in initial list instead of "
                        +" required " + NewFavoriteList.ADD_SERVICES.length  
                        +" list won't be created.")
                    Utilities.print("INFO: requested channel numbers - "
                        + NewFavoriteList.ADD_CHANNELS) 
                    Utilities.print("INFO: found channel numbers - "
                        + foundChannels) 
                    NewFavoriteList.manager(["EndTest"]);
                }
                else{
                    NewFavoriteList.manager(['CreateNewList'])   
                }
                
            }
        },
        "CreateNewList" : function() {
            ServiceList.createNewList(function(listUID){
                           NewFavoriteList.manager(['AddServices', listUID])},
                           NewFavoriteList.NEW_LIST,
                           NewFavoriteList.MEDIA_TYPE,
                           function(){NewFavoriteList.manager(['ListIsNotCreated'])})

        },
        "ListIsNotCreated" : function() {
            Utilities.print("#VERIFICATION FAILED: Required service list is " 
                            + "not created.");
            NewFavoriteList.manager(["EndTest"]);
        },
        "AddServices" : function(listUID) {
            if (NewFavoriteList.ADD_SERVICES.length>0) {
                Utilities.print("Add services to created favorite list...");
                ServiceList.updateFavoriteList(function(){
                   NewFavoriteList.manager(['EndTest', true])},
                   NewFavoriteList.MEDIA_TYPE,
                   listUID[0][0],
                   NewFavoriteList.ADD_SERVICES,
                   function(){NewFavoriteList.manager(['ListIsNotUpdated'])})
            }
            else {
                Utilities.print("#VERIFICATION PASSED: Empty services list"
                                + " is created");
                NewFavoriteList.manager(['EndTest', true])
            }
        },
        "ListIsNotUpdated" : function() {
            Utilities.print("#VERIFICATION FAILED: Required service list is " 
                            + "not updated according to request.");
            NewFavoriteList.manager(["EndTest"]);

        },
        "EndTest" : function(result){
            if (result[0]){
                Utilities.print("#VERIFICATION PASSED: Required Favorite list '"
                            + NewFavoriteList.NEW_LIST + "' is created.")
            }
            NewFavoriteList.END(result[0]||true);
        }
    };
    steps[args[0]](args.splice(1, 1));
}

}
}
