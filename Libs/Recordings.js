include('Utilities.js');

var RecordingType = {
    UNDEFINED:         '0',
    ONCE:              '1',
    MON2FRI:           '2',
    DAILY:             '4',
    WEEKLY:            '8',
    SERIAL:            '16',
    USER_NOTIFICATION: '32',
    RECODE:            '64',
    COPY:              '128'
};

var RecordingFields = {
    ANCESTOR: 0,  /**< ancestor */
    CAPTION: 1,   /**< item name */
    TYPE: 2,      /**< item type (e.g. tv, video, ...), see #ENUM_SL2_TVAPI_TABLE_DIRECTORY_FIELD_TYPE for different values */
    SUBTYPE: 3,   /**< item subtype, see #ENUM_SL2_TVAPI_TABLE_DIRECTORY_FIELD_SUBTYPE for different values */
    LOCATOR: 4,   /**< item URL */
    THUMBNAIL_URL: 5,/**< item thumbnail URL */
    TITLE: 6,     /**< item title (music) */
    ARTIST: 7,    /**< item artist */
    PRODUCER: 7,  /**< DEPRECATED */
    ALBUM: 8,     /**< item album */
    GENRE: 9,    /**< item genre */
    DATE: 10,     /**< item date */
    ACTOR: 11,    /**< item actor */
    DIRECTOR: 12, /**< item director */
    PLAYTIME: 13, /**< playtime */
    INDEX: 14,    /**< item index in a list */
    ATTRIBUTES: 15,/**< item attributes, see #ENUM_SL2_TVAPI_TABLE_DIRECTORY_FIELD_ATTRIBUTES for different flags*/
    FILE_SIZE: 16,/**< file size */
    COMMENT: 17,  /**< comment */
    DESCRIPTION: 18,/**< item description (PVR recordings: this is the epg short info) */
    NEWS: 19,     /**< optional news info (e.g. used in dashboard for series recordings items of DR+ archive */
    UUID: 20,     /**< uuid of medialist item */
    LONG_INFO: 21,/**< detailed description (PVR recordings: this is the epg long info) */
    START_TIME: 22,/**< for PVR recordings: start time calculated out of dateNumeric. */
    MAX_POS: 23,  /**< for PVR recordings: this is the percentage of the maximum position ever seen in playback. */
    RESOLUTION: 24,/**< item resolution, only for photo such as 1920*1080 */
    VOLUME_ID: 25, /**< volumeId */
    UNIQUE: 26, /**< expects "EQUALS" <any field id>: Returns unique things like all albums etc. */
    TRACK_NUMBER: 27, /**< Track number of the item in a CD or similar */
    IS_ACTIVE: 28, /**< Wether the medium is active */
    ORIGINAL_UUID: 29, /**< original UUID */
    ORIGINAL_VOLUME_ID: 30, /**< original volumeId */
    STATION_NAME: 31, /**< for PVR recordings: station name needed as specified. */
    DATE_NUMERIC: 32, /**< modification time (UTC timestamp) */
    ALBUM_UUID: 33, /**< album ID */
    EVENT_TAG: 34, /**< event tag */
    USER: 35, /**< extended user-defined queries (not a real selection) */
    ASSOCIATED_UUID: 36 /**< uuid of associated item for folders */
};

init = function() {

/** @namespace
 * Functions to work with DR+ recordings
 * @requires Library: {@link Utilities}
*/
Recordings = {

/**
 * Get UID of HDR drive
 * @author vkuchuk@luxoft.com
 * @memberof Recordings
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @return {object} HDR volume UID 
 * UID will be passed to exitFunc as input parameter.
 * @requires Library: {@link Utilities},
*/
getInternalVolumeUID: function (exitFunc) {
    var api = de.loewe.sl2.volume.table.main;
    var queryForVolume  =  {
        selections:   [
            { field: 1, conditionType: 2, condition: "#"},
            { field: 0, conditionType: 2, condition: "FSL2"}
        ],
        // Get UID
        fields:       [0],
        orders:       []
    };
    function parseByName(volumeId) {
        Utilities.print("Got volume UID: " + volumeId);
        exitFunc(volumeId);
    }

    Utilities.print("Get volume UID...");
    Utilities.getTableValues(parseByName, api, queryForVolume);
},

getInternalRecordings: function (exitFunc, fields) {
    Recordings.getInternalVolumeUID(
        function(volumeId) {
            var apiDir = de.loewe.sl2.table.directory;
            var fields = fields || [29];
            var queryForRecs  =  {
                selections:   [
                    { field: 25, conditionType: 1, condition: volumeId.toString()},
                    { field: 2, conditionType: 1, condition: 4},
                    { field: 3, conditionType: 1, condition: 12}
                ],
                // Get recording UUID
                fields:       fields,
                orders:       []
            };
            Utilities.getTableValues(exitFunc, apiDir, queryForRecs);
        }
    );
},

/**
 * Delete recordings from HDR volume
 * @author vkuchuk@luxoft.com
 * @memberof Recordings
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @param {object} [volumeId]
 * UID of hdr volume
 * @return none
 * @requires Library: {@link Utilities},
*/
deleteRecordings: function (exitFunc, volumeId) {
    var apiDir = de.loewe.sl2.table.directory;
    var queryForRecs  =  {
        selections:   [
            { field: 25, conditionType: 1, condition: volumeId.toString()},
            { field: 2, conditionType: 1, condition: 4},
            { field: 3, conditionType: 1, condition: 12}
        ],
        // Get recording UUID
        fields:       [29],
        orders:       []
    };


    function onRecRemoveActionResult(actionCallId, results){
        Utilities.print("onRecRemoveActionResult");
        var mes_id = de.loewe.sl2.messages.messageid
        var id = mes_id.getValue();
        var action = de.loewe.sl2.messages.action.confirm;
    setTimeout(
            function()
            {
                action.call([(0,id),(1,"2")]);
                exitFunc();                       
            },
            1000
        );
    }

    
    function onRecordingList(recIds) {
        Utilities.print("Got rec ids " + recIds);
        var ids = [];
        var delAction = de.loewe.sl2.hdr.action.archive.remove;
        delAction.onResult.connect(this, onRecRemoveActionResult)
        for(var i=0;i<recIds.length;i++){
            ids.push(recIds[i][0])
        }
        Utilities.print("ids " + ids);
        delAction.call(ids);
    }

    Utilities.print("Getting recording ids for volume " + volumeId);
    Utilities.getTableValues(onRecordingList, apiDir, queryForRecs);
},

/**
 * Delete recording timers
 * @author vkuchuk@luxoft.com
 * @memberof Recordings
 * @param {function} exitFunc
 * Function that should be called when request is finished
 * @return none
 * @requires Library: {@link Utilities},
*/
deleteRecordingTimers: function (exitFunc) {
   api = de.loewe.sl2.timer.list.table;
   var queryForTimers  =  {
       selections:   [],
       fields:       [0],
       orders:       []
   };
   Utilities.getTableValues(onTimerList, api, queryForTimers);

   function onTimerList(timerIds) {
       Utilities.print("Got timer ids " + timerIds);
       var ids = [];
       var delAction = de.loewe.sl2.timer.list.entry.remove;
       for(var i=0;i < timerIds.length;i++){
           ids.push(timerIds[i][0])
       }
       Utilities.print("ids " + ids);
       Utilities.callModelAction(delAction, ids, onTimersRemoveActionResult, onTimersRemoveActionError)

       function onTimersRemoveActionResult(actionCallId, results){
           Utilities.print("onTimersRemoveActionResult");
           exitFunc();
       }

       function onTimersRemoveActionError(actionCallId, errorCode){
           Utilities.print("#ERROR: onTimersRemoveActionError " + errorCode);
           exitFunc();
       }
   }
},

/**
 * Add recording timers
 * @author vkuchuk@luxoft.com
 * @memberof Recordings
 * @param {array} args
 * @param {function} exitFunc
 * called on OK 
 * @param {function} errorFunc
 * called on error
 * @return none
 * @requires Library: {@link Utilities},
*/
addRecordingTimer: function (args, exitFunc, errorFunc) {
    Utilities.print("Adding timer..." );
    var addAction = de.loewe.sl2.timer.list.entry.add;
    Utilities.callModelAction(addAction, args, exitFunc, errorFunc); 
},

getTimerArgsForEpgProgram: function (favListName, channelNum, serviceName, eventTitle, exitFunc, errorFunc) {
    var services = [
        [channelNum, MediaType.TV, favListName],
    ];
    var filters = {};
    filters[EPG.TITLE] = eventTitle;
    var optionalFields = [EPG.TITLE, EPG.START_TIME, EPG.END_TIME];
    var epgFields = [EPG.SID, EPG.TSID, EPG.ONID, EPG.EID].concat(
                                                       optionalFields);
    ServiceList.getServicelistUID(
        function(serviceListUID){
            EPGquery.getEPG(
                function(result) {
                    var epgResult = result[0];
                    var filter = {};
                    filter[SL_Fields.SERVICE_NAME] = serviceName;
                    ServiceList.getFilteredServicesFromList(
                        function(serviceInfo){
                            var timerArgs = [
                                '',                   // 0
                                epgResult[4],         // 1
                                serviceInfo[0][1],    // 2
                                '0',                  // 3
                                epgResult[5],         // 4
                                epgResult[6],         // 5
                                '0',                  // 6
                                '1',                  // 7
                                '1',                  // 8              
                                '0',                  // 9
                                '0',                  // 10
                                '2',                  // 11
                                '',                   // 12
                                '',                   // 13
                                serviceInfo[0][0],    // 14
                                '',                   // 15
                                '',                   // 16
                                '',                   // 17
                                epgResult[3]          // 18
                            ]
                            exitFunc(timerArgs);
                        },
                        serviceListUID[0],
                        filter,
                        [SL_Fields.SERVICE_NAME, SL_Fields.SERVICE_UUID]
                    );
                },
                services,
                filters,
                epgFields,
                errorFunc);
        },
        favListName );
}

}
}
