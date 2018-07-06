//dependency from other libraries
include('Utilities.js');
include('PressButton.js');
include('ServiceList.js');
include('Enumerators.js');
include('Compare.js');
include('Messages.js');
include('ParentalControl.js');

//library helios-kernel interface
init = function() {
/** @namespace
 * Functions to execute channel search.
 * @requires Library: {@link Utilities}, {@link PressButton},
 * {@link ServiceList}, {@link Compare}
*/
Scan = {

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
waitScanFinish: function(exitFunc) {
    var searchState = de.loewe.sl2.tvapi.i32.channel.search.search.state;
    Utilities.print("INFO: channel.search.search.state = " + searchState.getValue());
    var curState = searchState.getValue()
    if (curState == 0  ||  curState == 12) {
        Utilities.print("No channel search is in progress.");
        exitFunc();
    }
    else {
        Utilities.print("Another channel search is in progress. "
                        + "Processing...");
        //var manualState = de.loewe.sl2.i32.channel.search.dialog.manual.open
        var dcmState = de.loewe.sl2.i32.channel.search.osd.dcm.interactive
        if (dcmState.getValue() == 1) {
            Utilities.print("INFO: DCM UI is displayed");
            Scan.defaultScan(1, exitFunc);
        }
        else {
            Utilities.print("INFO: No scan UI is open");
            Scan.defaultScan(0, exitFunc);
        }
    }
},

/**
 * Activate intial scan wizard.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called after wizard is activated.
*/
activateInitialScanWizard: function(exitFunc){
    var scanType = {
            description: "initial scan wizard",
            api: de.loewe.sl2.system.firstInstallation.wizard.active,
            operatingValue: 1,
        };

    Scan.getSetCheck(exitFunc, scanType);
},

/**
 * Deactivate intial scan wizard.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called after wizard is deactivated.
*/
deactivateInitialScanWizard: function(exitFunc){
    var scanType = {
            description: "initial scan wizard",
            api: de.loewe.sl2.system.firstInstallation.wizard.active,
            operatingValue: 0,
        };

    Scan.getSetCheck(exitFunc, scanType);
},
/**
 * Open manual scan wizard.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called on success
 * @param {function} [failFunc=exitFunc]
 * Function that should be called on failure
*/
openManualScanWizard: function(exitFunc, failFunc) {
    var manualUI = {
            description: "manual scan wizard",
            api: de.loewe.sl2.i32.channel.search.dialog.manual.open,
            operatingValue: 1,
        };

    Scan.getSetCheck(exitFunc, manualUI, failFunc);
},

/**
 * Close manual scan wizard.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called on success
 * @param {function} [failFunc=exitFunc]
 * Function that should be called on failure
*/
closeManualScanWizard: function(exitFunc, failFunc) {
    var manualUI = {
            description: "manual scan wizard",
            api: de.loewe.sl2.i32.channel.search.dialog.manual.open,
            operatingValue: 0
        };

    Scan.getSetCheck(exitFunc, manualUI, failFunc);
},
/**
 * Check if manual scan is forbidden for the current configuration.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @returns {boolean} is_allowed
 * True if manual scan is allowed, false otherwise.
*/
isManualScanInhibited: function() {
    var allowedFrontends = de.loewe.sl2.vi32
        .channel.search.manual.inhibited.getValue();
    var currentFrontend = de.loewe.sl2.i32.channel.search.source.getValue();
    if (allowedFrontends.indexOf(currentFrontend) == -1) {
        return true;
    }
    else {
        return false;
    }
},
/**
 * Get current TV settings, set their values to new ones if differ,
 * check changes were applied.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called after all TV settings are set.
 * @param {object} setTVSettings
 * List of TV setting that should be set: TV location {@link Location},
 * connected cables, scanned front-end id {@link Source}.
 * Settings are optional.
 * @example
 * var tvSettings = {
 *      location: {
 *          operatingValue: location.BELGIUM,
 *          initialValue: "DNC",
 *      },
 *      connectedCables: {
 *          operatingValue: [0,0,1,0,0],
 *          initialValue: "DNC",
 *      },
 *      frontend: {
 *          operatingValue: frontEnd.DVB_C,
 *          initialValue: "DNC",
 *      }
 * };
 * Scan.setTVSettings(exitFunc, tvSettings)
 * @requires Library: {@link Utilities}
*/
setTVSettings: function(exitFunc, setTVSettings, failFunc) {
    var setTVSettings = setTVSettings||{};
    Utilities.print("Set/Check TV settings: "
                    + "location, connected cables, front-end...");
    Scan.settingsHandler(exitFunc, setTVSettings, Scan.getSetCheck, failFunc);
},

/**
 * Set scan settings.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @requires Library: {@link Utilities}
*/
setScanSettings: function(exitFunc, scanSettings, failFunc) {
    var scanSettings = scanSettings||{};
    Utilities.print("Set/Check scan settings...");
    Scan.settingsHandler(exitFunc, scanSettings, Scan.getSetCheck, failFunc);
},

/**
 * Set pin settings.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @requires Library: {@link Utilities}
*/
setPINSettings: function(exitFunc, pinSettings, failFunc) {
    var pinSettings = pinSettings||{};
    Utilities.print("Set/Check post scan settings...");
    Scan.settingsHandler(exitFunc, pinSettings, Scan.getSetCheck, failFunc);
},

/**
 * Check list of settings.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @requires Library: {@link Utilities}
*/
checkSettings: function(exitFunc, settingsList, failFunc) {
    var settingsList = settingsList||{};
    if (Utilities.numberOfElements(settingsList) >0) {
        Scan.settingsHandler(exitFunc,
                             settingsList,
                             Scan.checkValue,
                             failFunc);
    }
    else {
        exitFunc()
    }
},

/**
 * Settings handler.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * Notes about PIN settings:
 * <br/> - "PIN_initialAgeAvailable" (read-only) - does the initial
 * installation wizard allow to select age for parental control
 * <br/> - "PIN_initialCodeAvailable" (read-only) - does the initial
 * installation wizard allow to setup PIN for parental control
 * (if PIN_initialAgeAvailable is set to '0' and PIN_initialCodeAvailable
 * is set to '1', then the wizard _requires_ PIN setup during initial
 * installation)
 * <br/> - "PIN_deactivationAllowed" (read-only) - can PIN requests be turned
 * off via UI
 * <br/> - "PIN_resetAllowed" (read-only) - can PIN requests be turned off and
 * all related settings set to default via UI
 * <br/> - "PIN_ageRelatedLockActive" - is age-related parental control turned
 * on (can be set to '1' even if PIN is not specified yet)
 * <br/> - "PIN_ageRelatedLockLevel" - age level of parental control
 * @requires Library: {@link Utilities}
*/
settingsHandler: function(exitFunc, inputSettings, operatingFunc, failFunc) {

    var inputSettings = inputSettings||{};

    if (inputSettings.hasOwnProperty("PIN_code")) {
        if (inputSettings.PIN_code.hasOwnProperty("operatingValue")) {
            inputSettings.PIN_code.operatingValue = ParentalControl.checkPIN(
                inputSettings.PIN_code.operatingValue);
        }
        if (inputSettings.PIN_code.hasOwnProperty("initialValue")) {
            inputSettings.PIN_code.initialValue = ParentalControl.checkPIN(
                inputSettings.PIN_code.initialValue);
        }
    }

    var objKeys = [
        //------ TV settings --------
        "languageOSD",
        "location",
        "connectedCables",
        "frontend",
//      "cableСonnectors",
        "scanMethod",
        "dvbCharsetSettings",

        //------ Scan settings --------
//        "scanRadio",
        "scramblingSelectable",
        "searchScrambled",
        "lcnSelectable",
        "lcnAccepted",
        "searchingMethodSelectable",
        "searchMethod",
        "networkidSelectable",
        "networkid",
        "networkidNoneSelectable",
        "networkidNone",
        "modulationSelectable",
        "modulation",
        "frequencySelectable",
        "frequency",
        "symbolrateSelectable",
        "symbolrate",
        "voltage",
//        "hdPreferredSelectable",
//        "hdPreferred",
        "satelliteBand",
        "allScanSatellites",
        "currentScanSatellite",
        "m7group",

        //------ Network rules --------
        "hideInputValues",
        "takeoverServicesChanges",
        "timeControl",
        "languageSubtitleFavoured",
        "languageSubtitleAlternative",
        "languageAudioFavoured",
        "languageAudioAlternative",
        "subtitleMode",
        "dcmAutoUpdate",
        "servicelistExportAllowed",
        "availabilityDcmMenu",

        //------ Antenna settings --------
        "satConnectionScheme",
        "satellite1",
        "satellite2",
        "satellite3",
        "satellite4",
        "satelliteName1",
        "satelliteName2",
        "satelliteName3",
        "satelliteName4",
        "bandMode",
        "lowBand1",
        "lowBand2",
        "lowBand3",
        "lowBand4",
        "highBand1",
        "highBand2",
        "highBand3",
        "highBand4",

        //------ PIN settings --------
        "PIN_initialModificationAllowed",
        "PIN_initialPinDefinitionAllowed",
        "PIN_deactivationAllowed",
        "PIN_resetAllowed",
        "PIN_ageRelatedLockActive",
        "PIN_ageRelatedLockLevel",
        "PIN_ageRelatedAlwaysExist",
        "PIN_ageRelatedLockDisengageable",
        "PIN_code"
    ];
    var objDescs = [
        //------ TV settings --------
        "menu language",
        "TV location id",
        "connected cables",
        "front-end id",
//        "available front-ends",
        "scan method",
        "dvb charset settings",

        //------ Scan settings --------
//        "media type for manual scan",
        "selectability of searching scrambled services",
        "searching scrambled services",
        "selectability of ordering by LCN",
        "sorting services by LCN",
        "selectability of searching method",
        "searching method",
        "selectability of network id",
        "network id",
        "selectability of NONE network id",
        "NONE network id",
        "selectability of QAM",
        "modulation",
        "selectability of start frequency",
        "start frequency",
        "selectability of symbolrate",
        "symbolrate",
        "voltage",
//        "selectability of HD preference",
//        "HD preferred",
        "satellite band for manual scan",
        "satellites available for the scan",
        "satellite selected for the scan",
        "M7Group network rules applied",

         //------ Network rules --------
        "hide input values",
        "automatic applying of service list changing",
        "user time control",
        "favoured language of subtitles",
        "alternative language of subtitles",
        "favoured language of audio",
        "alternative language of audio",
        "subtitle mode",
        "DCM update allowed",
        "ability to export services list",
        "availability of menu for DCM update",


        //------ Antenna settings --------
        "satellite configuration",
        "ID of satellite #1",
        "ID of satellite #2",
        "ID of satellite #3",
        "ID of satellite #4",
        "name of satellite #1",
        "name of satellite #2",
        "name of satellite #3",
        "name of satellite #4",
        "band configuration for single satellite",
        "low band frequency for satellite #1",
        "low band frequency for satellite #2",
        "low band frequency for satellite #3",
        "low band frequency for satellite #4",
        "high band frequency for satellite #1",
        "high band frequency for satellite #2",
        "high band frequency for satellite #3",
        "high band frequency for satellite #4",

        //------ PIN settings --------
        "availability of modification of parental control settings at "
            + "initial installation",
        "availability of PIN definition at initial installation",
        "availability of PIN deactivation",
        "availability of PIN reset",
        "age-related parental lock",
        "level of age-related parental lock (in years)",
        "availability of always blocking age-related lock",
        "availability of age-related lock deactivation",
        "parental control code"
    ];
    var objAPIs = [
        //------ TV settings --------
        de.loewe.sl2.i32.language.osd,
        de.loewe.sl2.i32.basic.settings.tvset.location,
        de.loewe.sl2.vint32.antenna.connected.cables,
        de.loewe.sl2.i32.channel.search.source,
//      de.loewe.sl2.vint32.antenna.cable.connectors,
        de.loewe.sl2.tvapi.i32.channel.search.scan.method,
        de.loewe.sl2.i32.basic.settings.enum.dvb.charset,

        //------ Scan settings --------
//        de.loewe.sl2.i32.channel.search.tv.radio,
        de.loewe.sl2.i32.channel.search.scrambling.selectable,
        de.loewe.sl2.i32.channel.search.scrambled,
        de.loewe.sl2.i32.channel.search.network.lcn.selectable,
        de.loewe.sl2.i32.channel.search.lcn.accepted,
        de.loewe.sl2.i32.channel.search.source.network.scan.supported,
        de.loewe.sl2.i32.channel.search.method,
        de.loewe.sl2.i32.channel.search.networkid.selectable,
        de.loewe.sl2.i32.channel.search.networkid,
        de.loewe.sl2.i32.channel.search.networkid.none.selectable,
        de.loewe.sl2.i32.channel.search.networkid.none,
        de.loewe.sl2.i32.channel.search.source.modulation.exist,
        de.loewe.sl2.vi32.channel.search.qam,
        de.loewe.sl2.i32.channel.search.source.start.frequency.exists,
        de.loewe.sl2.i32.search.frequency,
        de.loewe.sl2.i32.channel.search.source.symbolrate.exists,
        de.loewe.sl2.vi32.channel.search.symbolrate,
        de.loewe.sl2.i32.antenna.dvbt.voltage,
//        de.loewe.sl2.i32.channel.search.hd.preferred.selectable,
//        de.loewe.sl2.i32.channel.search.hd.preferred,
        de.loewe.sl2.i32.channel.search.satelliteband,
        de.loewe.sl2.vstr.channel.search.satellitenamelist,
        de.loewe.sl2.str.channel.search.satellitename,
        de.loewe.sl2.i32.channel.search.m7group,

        //------ Network rules --------
        de.loewe.sl2.i32.channel.search.hide_input_values,
        de.loewe.sl2.i32.channel.search.takeover_services_changes,
        de.loewe.sl2.i32.datetime.time.locked,
        de.loewe.sl2.i32.language.subtitle.favoured,
        de.loewe.sl2.i32.language.subtitle.alternative,
        de.loewe.sl2.i32.language.audio.favoured,
        de.loewe.sl2.i32.language.audio.alternative,
        de.loewe.sl2.i32.basic.settings.enum.dvb.mode.subtitle,
        de.loewe.sl2.i32.channel.search.dcm.auto.update,
        de.loewe.sl2.i32.servicelist.im_export_allowed,
        de.loewe.sl2.i32.channel.search.dcm.auto.update_allowed,

        //------ Antenna settings --------
        de.loewe.sl2.i32.antenna.dvbs.enum.installation,
        de.loewe.sl2.i32.antenna.dvbs.satellite._1.index,
        de.loewe.sl2.i32.antenna.dvbs.satellite._2.index,
        de.loewe.sl2.i32.antenna.dvbs.satellite._3.index,
        de.loewe.sl2.i32.antenna.dvbs.satellite._4.index,
        de.loewe.sl2.str.antenna.dvbs.satellite._1.name,
        de.loewe.sl2.str.antenna.dvbs.satellite._2.name,
        de.loewe.sl2.str.antenna.dvbs.satellite._3.name,
        de.loewe.sl2.str.antenna.dvbs.satellite._4.name,
        de.loewe.sl2.i32.antenna.dvbs.highband,
        de.loewe.sl2.i32.antenna.dvbs.satellite1.band.low,
        de.loewe.sl2.i32.antenna.dvbs.satellite2.band.low,
        de.loewe.sl2.i32.antenna.dvbs.satellite3.band.low,
        de.loewe.sl2.i32.antenna.dvbs.satellite4.band.low,
        de.loewe.sl2.i32.antenna.dvbs.satellite1.band.high,
        de.loewe.sl2.i32.antenna.dvbs.satellite2.band.high,
        de.loewe.sl2.i32.antenna.dvbs.satellite3.band.high,
        de.loewe.sl2.i32.antenna.dvbs.satellite4.band.high,

        //------ PIN settings --------
        de.loewe.sl2.i32.parental.lock.initial.install.modification.allowed,
        de.loewe.sl2.i32.parental.lock.initial.install.pin.definition.allowed,
        de.loewe.sl2.i32.parental.lock.deactivate.allowed,
        de.loewe.sl2.i32.parental.lock.reset.allowed,
        de.loewe.sl2.i32.parental.lock.age_related,
        de.loewe.sl2.i32.parental.lock.age,
        de.loewe.sl2.i32.parental.lock.age_related.always.exist,
        de.loewe.sl2.i32.parental.lock.age_related.disengageable,
        de.loewe.sl2.str.parental.lock.pin
    ];
    var template = [];
    objKeys.forEach(
        function(item, id) {
            if (Object.keys(inputSettings).indexOf(item) != -1) {
                template.push(
                    {
                        "description" : objDescs[id],
                        "api" : objAPIs[id],
                        "operatingValue" :
                        inputSettings.hasOwnProperty(item)
                            && inputSettings[item].hasOwnProperty(
                                "operatingValue")
                            ?
                            inputSettings[item].operatingValue : "DNC",
                        "initialValue" :
                        inputSettings.hasOwnProperty(item)
                            && inputSettings[item].hasOwnProperty(
                                "initialValue")
                            ?
                            inputSettings[item].initialValue : "DNC"
                    }
                );
            }
        }
    );

//if you are adding new api please do not forget to update list
//of master settings in Scan.getSetCheck function

   Scan.goThroughSettingList(exitFunc, 0, template, operatingFunc, failFunc);
},

/**
 * Go through list of settings
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called after list is finished.
 * @param {number} settingIndex
 * Index of checked element
 * @param {object} obj
 * @param {function} failFunc
 * Function that should be given to operating function if it is required.
 * @param {function} operatingFunc
 * Function that should be called for each of setting.
 * Function should take exitFunc, obj, failFunc as input parameters
 * Array of settings
 * @requires Library: {@link Utilities}
*/
goThroughSettingList: function(exitFunc,
                               settingIndex,
                               obj,
                               operatingFunc,
                               failFunc){

    var operatingFunc = operatingFunc || Scan.getSetCheck;
    if (settingIndex < Utilities.numberOfElements(obj)) {
        operatingFunc(
            function() {
                settingIndex++;
                Scan.goThroughSettingList(exitFunc,
                                          settingIndex,
                                          obj,
                                          operatingFunc,
                                          failFunc);
            },
            obj[settingIndex],
            failFunc
        );
    }
    else {
        exitFunc()
    }
},

/**
 * Set and check setting.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called after list is finished.
 * @param {object} setting
 * See example to check required structure
 * @param {number} [timeoutForCheck = 3000]
 * Time to check updated value (msec)
 * @example
 * var setting = {
 *      description: "searching method",
 *      api: de.loewe.sl2.i32.channel.search.method,
 *      operatingValue: 1,
 *      initialValue: 0,
 *  };
 * @requires Library: {@link Utilities}, Enumerators
*/
getSetCheck: function(exitFunc, obj, failFunc) {
    var currentValue = obj.api.getValue();
    var failFunc = failFunc || exitFunc;

/* input value of connected cables for old test has standart format
 * [Analog,DVB-T,DVB-C,DVB-S1,DVB-S2]. Additional interface for Germany IPTV is
 * available since HL1 V2.0.6. This interfase will be added in future for others
 * countries. Also list of front-end depends on TV chassis. To be independent
 * from sw implementation "connectedCables" will be automaticly modified
 * according to supported front-ends
*/

    if (obj.description == "connected cables") {
//      var availableFrontEnds = de.loewe.sl2.vint32
//                    .antenna.cable.connectors.getValue();
        var availableFrontEnds = de.loewe.sl2.vint32
                    .antenna.connected.cables.getValue();
//Looks that availableFrontEnds depends on location and get data from previous scan.
        Utilities.print("DEBUG. AvailableFrontEnds: " + String(availableFrontEnds));

        function updateValue(key){
            if (availableFrontEnds.length <
                obj[key].length) {
                Utilities.print("WARN: " + key
                    + " of connectedCables is  ["
                    + obj[key]
                    + "] that is bigger than list of supported"
                    + " front-ends ["
                    + String(availableFrontEnds) + "].");

                obj[key] = obj[key].slice(0, availableFrontEnds.length)

                Utilities.print("INFO: " + key
                    + " of connectedCables is cutted "
                    + "according to number of available front-ends: ["
                    + obj[key]+ "].");
            }
            if (availableFrontEnds.length >
                obj[key].length) {
                Utilities.print("WARN: " + key
                    + " of connectedCables is  ["
                    + obj[key]
                    + "] that is smaller than list of supported"
                    + " front-ends ["
                    + String(availableFrontEnds) + "].");

//in the current date all our test has 5 values of connectedCables: {operatingValue: [NO,NO,YES,NO,NO]
//that's why we just add las 3 items from availableFrontEnds to our connected cables from tests. N.B.
//If test use IP, Multiroom or SatIP test must be updated.

                //because HL1e does not have 2nd DVB-S2 tuner and html tests does not contain value 'NOT' for it -
                //cut this value and add from available cable.

                var withoutthree = availableFrontEnds.slice(-4)
                obj[key] = obj[key].slice(0, 4)
                obj[key].length =  obj[key].push(withoutthree)
                /*for (var i = obj[key].length;
                         i < availableFrontEnds.length;
                         i++){
                        for (var n = 0;
                         n < withoutthree.length;
                         n++)
                         Utilities.print("Withoutthree:" + withoutthree[n])
                            obj[key][i] = withoutthree[n]
                }*/

                Utilities.print("INFO: " + key
                    + " of connectedCables is expanded "
                    + "according to number of available front-ends: ["
                    + obj[key]
                    + "].");
            }

        }

        if (typeof(obj.initialValue) != "undefined"
                            && obj.initialValue != "DNC") {
            updateValue("initialValue")
        }
                if (typeof(obj.operatingValue) != "undefined"
                            && obj.operatingValue != "DNC") {
            updateValue("operatingValue")
        }

    }


    if (typeof(obj.initialValue) != "undefined" && obj.initialValue != "DNC") {
        if (currentValue.toString() == obj.initialValue.toString()) {
            Utilities.print("#VERIFICATION PASSED: initial value of "
                            + obj.description + " is '" + currentValue
                            + "'.");
            if (typeof(obj.operatingValue) != 'undefined'
                && obj.operatingValue.toString() != "DNC"){
                Utilities.print("Set " + obj.description + " to "
                                + obj.operatingValue +"...");
                //timeout to check if value was set correctly
                Scan.setCheckSetting(
                            exitFunc,
                            obj,
                            obj.operatingValue,
                            failFunc
                );
            }
            else {
                exitFunc()
            }
        }
        else{
            Utilities.print("#VERIFICATION FAILED: initial value of "
                            + obj.description + " is '" + currentValue
                            + "' that is different from expected '"
                            + obj.initialValue + "'.");
            // check if setting is master
            var masretList = [
                "available front-ends",
                "selectability of searching scrambled services",
                "selectability of ordering by LCN",
                "selectability of searching method",
                "selectability of network id",
                "selectability of NONE network id",
                "selectability of QAM",
                "selectability of start frequency",
                "selectability of symbolrate",
                "selectability of HD preference",
                "hide input values",
                "user time control",
                "possibility of manual service list changing during scan",
                "satellites available for the scan",
                "satellite selected for the scan",
                "M7Group network rules applied",
                "favoured language of subtitles",
                "alternative language of subtitles",
                "favoured language of audio",
                "alternative language of audio",
                "availability of modification of parental control settings at "
                    + "initial installation",
                "availability of PIN definition at initial installation",
                "availability of PIN deactivation",
                "availability of PIN reset",
                "availability of age-related lock deactivation",
                "availability of always blocking age-related lock",
                "name of satellite #1",
                "name of satellite #2",
                "name of satellite #3",
                "name of satellite #4",
                "DCM update allowed",
                "ability to export services list",
                "availability of menu for DCM update",
                "automatic applying of service list changing"
            ];
            if (masretList.indexOf(obj.description) == -1) {
            // set test setting if current value is different from expected
            // and test do not required to set new value
                if (typeof(obj.operatingValue) == "undefined"
                    || obj.operatingValue.toString() == "DNC"){
                    Utilities.print("Set " + obj.description
                                    + " to the expected initial value '"
                                    + obj.initialValue + "'...");
                    //timeout to check if value was set correctly
                    Scan.setCheckSetting(exitFunc,
                                         obj,
                                         obj.initialValue,
                                         failFunc);

                }
                else{
                    Utilities.print("Set " + obj.description + " to '"
                                    + obj.operatingValue + "'...");
                    //timeout to check if value was set correctly
                    Scan.setCheckSetting(exitFunc,
                                         obj,
                                         obj.operatingValue,
                                         failFunc);
                }
            }
            else {
                Utilities.print("INFO: " + obj.description
                        + " is a read-only API and"
                        + " can't be changed. "
                        + "Test will proceed with the current value...");
                exitFunc();
            }
        }
    }
    else {
        // set test setting if current value is different
        // and test required to set new value
        if (typeof(obj.operatingValue) != "undefined"
            && obj.operatingValue.toString() != "DNC") {
            Utilities.print("Set " + obj.description
                            + " to '" + obj.operatingValue + "'...");
        //timeout to check if value was set correctly
            Scan.setCheckSetting(exitFunc,
                                 obj,
                                 obj.operatingValue,
                                 failFunc);
        }
        else {
            exitFunc()
        }
    }
},

/**
 * Check network settings.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called after list is finished.
 * @param {object} setting
 * See example to check required structure
 * @param {number} [timeoutForCheck = 3000]
 * Time to check updated value (msec)
 * @example
 * var setting = {
 *      description: "searching method",
 *      api: de.loewe.sl2.i32.channel.search.method,
 *      operatingValue: 1,
 *      initialValue: 0,
 *  };
 * @requires Library: {@link Utilities}, Enumerators
*/
checkValue: function(exitFunc, obj, failFunc) {
    var currentValue = obj.api.getValue();
    var failFunc = failFunc || exitFunc;
    if (typeof(obj.operatingValue) != "undefined"
            && obj.operatingValue.toString() != "DNC"){
        if (Utilities.getCheckAPIValue(obj,obj.operatingValue,"RSLT")){
            exitFunc()
        }
        else{
            failFunc()
        }
    }
    else {
        if (typeof(obj.initialValue) != "undefined"
                    && obj.initialValue.toString() != "DNC"){
                if (Utilities.getCheckAPIValue(obj,obj.initialValue,"RSLT")){
                    exitFunc()
                }
                else{
                    failFunc()
                }
        }
        else{
            exitFunc()
        }
    }
},

/**
 * Check setting value. Test will be stopped if setting value
 * differs from expected.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called after list is finished.
 * @param {object} obj
 * See example to check required structure.
 * @param {object} expectedValue
 * @example
 * var setting = {
 *      description: "searching method",
 *      api: de.loewe.sl2.i32.channel.search.method
 *  };
 * @requires Library: {@link Utilities}
*/
setCheckSetting: function(exitFunc, obj, expectedValue, failFunc) {
    // FIXME: replace Utilities.endTest inherited from
    // current logic with full failFunc support
    // (can affect currently implemented tests)
    var failFunc = failFunc || Utilities.endTest;
    var timerID = 0;
    function check () {
        obj.api.onChange.disconnect(listener);
        currentValue = obj.api.getValue();
        if (currentValue.toString() == expectedValue.toString() ){
            Utilities.print("#VERIFICATION PASSED: " + obj.description
                            + " is set to '" + currentValue + "'.");
            exitFunc();
        }
        else {
            Utilities.print("#VERIFICATION FAILED: " + obj.description
                            + " is set to " + currentValue
                            + " that is different from expected '"
                            + expectedValue + "'.");
            failFunc();
        }
    }

    function listener() {
        if (timerID) {
            window.clearTimeout(timerID);
        }
        timerID = window.setTimeout(
            function () {
                timerID = 0;
                check();
            },
            2000
        );
    }
//define timeout to value verification
    var currentValue = obj.api.getValue();

    if (currentValue.toString() == expectedValue.toString()) {
        //fast verification if update is not executed
        var timeout = 2000;
    }
    else {
        var timeout = 10000;
    }

    obj.api.onChange.connect(listener);
    obj.api.setValue(expectedValue);
    timerID = window.setTimeout(check, timeout);
},

/**
 * Check setting value. Test will proceed independently on
 * verification result.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @requires Library: {@link Utilities}
*/
getCheckValue: function(exitFunc, obj, expectedValue) {
    var currentValue = obj.api.getValue();
    if (currentValue.toString() == expectedValue.toString() ){
        Utilities.print("#VERIFICATION PASSED: " + obj.description
                        + " is equal to expected '" + expectedValue + "'.");
        exitFunc();
    }
    else {
        Utilities.print("#VERIFICATION FAILED: " + obj.description
                        + " is " + currentValue
                        + " that is different from expected '"
                        + expectedValue + "'.");
        exitFunc();
    }
},

/**
 * Set operator ID
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function that should be called on success
 * @param {number} front-end
 * Checked front-end
 * @param {number} operator
 * Required operator ID
 * @param {number} [satellite=-1]
 * Current satellite
 * @param {function} [failFunc=utilities.endTest]
 * Function that should be called on failure
* @requires Library: {@link Utilities},
*/
setOperator: function (exitFunc, frontend, operator, satellite, failFunc) {
    var operatorObj = {
        description: "operator id",
        api: de.loewe.sl2.i32.channel.search.selected.network.id,
        operatingValue: operator
    };
    // Default failFunc is set to endTest because setOperator()
    // already used similar logic
    var failFunc = failFunc || Utilities.endTest;
    var is_initialWizardActive = de.loewe.sl2
        .system.firstInstallation.wizard.active.getValue();
    // If 'frontend' is not specified use current one
    if (typeof(frontend) != "number") {
        frontend = de.loewe.sl2.i32.channel.search.source.getValue();
    }
    // If 'satellite' is not specified use the current one
    if (typeof(satellite) != "number" && frontend == 13
        && !is_initialWizardActive) {
        satellite = de.loewe.sl2.tvapi.i32.channel.search
            .satellite.id.getValue();
    }
    function checkSetNetworks (exitFunc, networksIDs, failFunc){
        var setNetwork = de.loewe.sl2.action.channel.search.network.set;
        var timerID = 0;

        function onSetResult(){
            setNetwork.onResult.disconnect(this, onSetResult);
            setNetwork.onError.disconnect(this, onSetError);
            window.clearTimeout(timerID);
            if (frontend != 13) {
                Structures.smoothCheck(operatorObj, "", exitFunc, failFunc);
            }
            else {
                exitFunc();
            }
        }

        function onSetError(){
            setNetwork.onResult.disconnect(this, onSetResult);
            setNetwork.onError.disconnect(this, onSetError);
            window.clearTimeout(timerID);
            Utilities.print("#ERROR: NID setup returns error.");
            failFunc();
        }

        for (var key in networksIDs){
                networksIDs[key]=networksIDs[key].toString();
            }
        if (networksIDs.indexOf(operatorObj.operatingValue.toString()) == -1){
            Utilities.print("#ERROR: Required operator ID " + operator
                            +" is not supported for current settings.");
            failFunc();
        }
        else {
            setNetwork.onResult.connect(this, onSetResult);
            setNetwork.onError.connect(this, onSetError);
        //Second parameter is a satellite
            var currentScanSat = -1;
            if (frontend == 13) {
                currentScanSat = de.loewe.sl2.tvapi.i32
                .channel.search.satellite.id.getValue();
            }
            setNetwork.call([frontend,
                             currentScanSat,
                             operatorObj.operatingValue]);
            timerID = window.setTimeout(onSetResult, 10000);
        }
    };
    function getAvailableNetworkIDs (exitFunc, failFunc){
        if (typeof(satellite) == "number" && satellite != -1) {
            var networksQuery  =  {
                selections: [
                    { field: 2, conditionType: 1, condition: frontend},
                    { field: 3, conditionType: 1, condition: satellite}
                ],
                fields: [0] //Get NIDs
            };
        }
        else {
            var networksQuery  =  {
                selections: [
                    { field: 2, conditionType: 1, condition: frontend}
                ],
                fields: [0] //Get NIDs
            };
        }
        var availableNID = de.loewe.sl2.channel.search.table.dvbnetworks;
        Utilities.getTableValues(
            function(networksIDs){
                checkSetNetworks(exitFunc, networksIDs, failFunc);
            },
            availableNID,
            networksQuery,
            failFunc
        );
    };

    Utilities.print("Set operator id to " + operator + "...");
    getAvailableNetworkIDs (exitFunc, failFunc);
},

/**
 * Start execution monitor for initial scan.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
*/
startInitialScanMonitor: function (exitFunc, scanResult, failFunc) {
    var startSearch = de.loewe.sl2.action.channel.search.initial.search;
    var failFunc = failFunc || exitFunc;
    var scanType = {
        description: "initial scan wizard",
        api: de.loewe.sl2.system.firstInstallation.wizard.active,
        operatingValue: "DNC",
        initialValue: 1,
        };

    Scan.getSetCheck(
        function() {
            Scan.startScanMonitor(exitFunc,
                                  startSearch,
                                  "",
                                  scanResult,
                                  failFunc);
        },
        scanType);
},

/**
 * Start execution monitor for auto scan.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
*/
startAutoScanMonitor: function (exitFunc, scanResult) {
    var startSearch = de.loewe.sl2.action.channel.search.start;

    var scanType = {
        description: "auto scan wizard",
        api: de.loewe.sl2.system.firstInstallation.wizard.active,
        operatingValue: "DNC",
        initialValue: 0,
        };

    Scan.getSetCheck(
        function(){
            Scan.startScanMonitor(exitFunc, startSearch, 0, scanResult);
        },
        scanType);
},
/**
 * Start execution monitor for manual scan.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
*/
startManualScanMonitor: function (exitFunc, scanResult, failFunc) {
    var startSearch = de.loewe.sl2.action.channel.search.start;
    Scan.startScanMonitor(exitFunc, startSearch, 1, scanResult, failFunc);
},

/**
 * Start scan and monitor it.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function will be called on success (with "true" parameter)
 * @param {API} startSearch
 * API for start scan action
 * @param {Number} scanType
 * scanType: 0 - auto, 1 - manual, "" - initial
 * @param {object} scanResult
 * Object containing expected scan result
 * @param {function} [failFunc=exitFunc]
 * Function will be called on failure (with "false" parameter)
 * @param {function} [errorFunc=Utilities.endTest]
 * Function will be called on error terminating the test procedure
 * @requires Library: {@link Utilities}, {@link ParentalControl}
*/
startScanMonitor: function (exitFunc,
                            startSearch,
                            scanType,
                            scanResult,
                            failFunc) {
    var searchState = de.loewe.sl2.tvapi.i32.channel.search.search.state;
    var scanningProgress = de.loewe.sl2.i32.channel.search.searching.progress;
    var sortingProgress = de.loewe.sl2.i32.channel.search.sorting.progress;
    var currentFrontend = de.loewe.sl2.i32.channel.search.source;
    var currentSatName = de.loewe.sl2.str.channel.search.satellitename;
    var scanResult = scanResult || {} ;
    scanResult.lcnConflict = scanResult.lcnConflict || {};
    scanResult.lcnConflict.serviceList = scanResult.lcnConflict.serviceList
        || [];
    scanResult.lcnConflict.executeSwap = scanResult.lcnConflict.executeSwap
        || [];
    // Create expected result depending on the type of scan
    if (scanType == 1) {
        scanResult.foundServices = scanResult.foundServices || {};
        scanResult.foundServices.serviceList =
            scanResult.foundServices.serviceList || [];
        scanResult.foundServices.saveServices =
            scanResult.foundServices.saveServices || [];
    // not sure if region selection can happened for manual scan.
        scanResult.regionSelection = scanResult.regionSelection || [];
        var expectedScanResult = Scan.createExpResForManualScan(
            scanResult.foundServices.serviceList,
            scanResult.foundServices.saveServices
        );
    }
    else {
        scanResult.newServices = scanResult.newServices || {};
        scanResult.newServices.serviceList =
            scanResult.newServices.serviceList || [];
        scanResult.newServices.removeServices =
            scanResult.newServices.removeServices || [];
        scanResult.unfoundServices = scanResult.unfoundServices || {};
        scanResult.unfoundServices.serviceList =
            scanResult.unfoundServices.serviceList || [];
        scanResult.unfoundServices.removeServices =
            scanResult.unfoundServices.removeServices || [];
        scanResult.regionSelection = scanResult.regionSelection || [];
        scanResult.errorType = scanResult.errorType || 0;

        var expectedScanResult = Scan.createExpResForUpdatedServices(
            scanResult.newServices.serviceList,
            scanResult.unfoundServices.serviceList,
            scanResult.newServices.removeServices,
            scanResult.unfoundServices.removeServices,
            5
        );
    }
    var failFunc = failFunc || exitFunc;
    var workflow = expectedScanResult.workflow;
    var testRes = true;
    var is_scanning = 0;
    var is_sorting = 0;
    var timerID = 0;
    var regionTimerID = 0;

    if ( Utilities.numberOfElements(
        scanResult.lcnConflict.serviceList
    ) != 0 ) {
        workflow.push(5);
        workflow.sort();
    };

    scanResult.regionSelection.forEach(function(item){
    if ( item.hasOwnProperty("selectRegion") ) {
        if ( item.selectRegion != 'DNC') {
            workflow.push(3);
            workflow.sort();
        }
    }
    else if ( item.hasOwnProperty("listOfRegions")){
        if ( item.listOfRegions != 'DNC') {
            workflow.push(3);
            workflow.sort();
        }
    };})

//create form for scan error verification
    if ( scanResult.hasOwnProperty("errorType")){
        if (scanResult.errorType != 0 ) {
            workflow.push(11);
            workflow.sort();
        }
        else {
            scanResult.errorType = 0;
        }
    }
    else {
        scanResult.errorType = 0;
    }

    //~ var serviceListHandlerAPI = de.loewe.sl2.i32.channel.search
                                //~ .takeover_services_changes.getValue();
    //~ var workflowIDs = [7, 9];
    //~ if (serviceListHandlerAPI == 1) {
        //~ for (i = 0; i < workflowIDs.length; i++) {
            //~ var index = workflow.indexOf(workflowIDs[i]);
            //~ if (index > -1){
                //~ workflow.splice(index, 1);
            //~ }
        //~ }
    //~ }
    // Pretty printing
    var statesPrint = [
        "No active search",
        "Scanning",
        "Sorting",
        "Region selecting",
        "Manual scan",
        "LCN conflict",
        "New TV services",
        "Unfound TV services",
        "New Radio services",
        "Unfound Radio services",
        "Scan result",
        "Scan exception",
        "UNCHECKED Idle"
    ];

    // Control correctness of current state
    //scan result should be displayed after each scan except manual scan
    if (scanType != 1) {
        if (scanResult.errorType == 0 ) {
            workflow.push(10);
        };
    }

    function checkScanState(state) {
        if ((workflow.indexOf(state) != -1) || (3 > state) || (12 == state)) {
            Utilities.print("#VERIFICATION PASSED: Current state: "
                            + statesPrint[state]);
            proceed(state);
        }
        /*else if (11 == state) {
            if (workflow.indexOf(10) != -1) {
                var i = workflow.indexOf(10);
                workflow.splice (i, 1);
            }

            Utilities.print("WARN: Scan error is happened.");
            Scan.proceed();
            }
            */
        else {
            Utilities.print("#VERIFICATION FAILED: " + "state "
                            + statesPrint[state]
                            + " is not expected.");
            testRes = false;
            Utilities.print("The state will be processed by default.")
            Scan.proceed();
        }
    }

    function proceed(state) {
        window.clearTimeout(regionTimerID);
        // For all states but scanning and sorting
        // current state is removed from workflow
        switch (true) {
        case ((state == 0) || (state == 12)):
            Utilities.print("Scanning is finished");
            searchState.onChange.disconnect(delayedListener);
            currentSatName.onChange.disconnect(printSat)
            // Check workflow
            if (workflow.length != 0) {
                Utilities.print("#VERIFICATION FAILED: "
                                + "next states were expected, "
                                + "but didn't appear during scan: ");
                workflow.map(
                    function(item) {
                        Utilities.print("#ERROR:\t -- " + statesPrint[item]);
                    }
                );
                testRes = false;
            }
            var camScanState = de.loewe.sl2.tvapi.i32.channel.search
                                            .cam.scan.state.getValue();
            Utilities.print("TV scan is finished");
            if (camScanState == 0 || camScanState == 2) {
                if (testRes) {
                    Utilities.print("All scans are finished");
                    exitFunc(testRes);
                }
                else {
                    Utilities.print("All scans are finished");
                    failFunc(testRes)
                }
            }
            else {
                Utilities.print("WARN: CAM state is " + camScanState);
                exitFunc(testRes);
            }
            break;
        case (state == 1):
            function printScan(state) {
                Utilities.print("Progress of scan: " + state + "%")
                var fr = de.loewe.sl2.i32.channel.search
                    .progress.frequency.getValue()
                Utilities.print("Scan frequency: " + fr)
            }

            is_scanning++
            Utilities.print("Scan #" + is_scanning + " started.")
            if (currentFrontend.getValue() == 13) {
                if (currentSatName.getValue() != ""){
                    Utilities.print("Scan started on '" + currentSatName.getValue()
                                    + "' satellite.");
                }
            }
            if (is_scanning == 1) {
                scanningProgress.onChange.connect(printScan)
            }
            break;
        case (state == 2):
            function printSort(state){
                Utilities.print("Progress of sorting: " + state + "%")
            }

            is_sorting++
            Utilities.print("Sorting #" + is_sorting + " started.")
            if (is_sorting == 1) {
                sortingProgress.onChange.connect(printSort)
            }
            break;
        case (state == 3):
            var indexOfState = workflow.indexOf(Number(state));
            if (indexOfState != -1){
                workflow.splice(indexOfState, 1);
            }
            setTimeout(function(){
                regionSelection( scanResult.regionSelection, Scan.proceed )},
                5000);

            break;
        case (state == 4):
            workflow.splice(workflow.indexOf(state), 1);
            Scan.manualScanResultsAnalysis( expectedScanResult, Scan.proceed );
            break;
        case (state == 5):
            workflow.splice(workflow.indexOf(state), 1);
            Scan.lcnConflictHandler( scanResult.lcnConflict, Scan.proceed );
            break;
        case ((state >= 6) && (state <= 9)):
            workflow.splice(workflow.indexOf(state), 1);
            Scan.updatedServicesAnalysis( expectedScanResult,
                                          state,
                                          Scan.proceed );
            break;
            // These states are left for future compatibility
            // when they could be processed correctly
        case (state == 10):
            var indexOfState = workflow.indexOf(Number(state));
            if (indexOfState != -1){
                workflow.splice(indexOfState, 1);
            }
            Scan.proceed()
            break;
        case (state == 11):
        Utilities.print("Scan exception is happened.")
            var indexOfState = workflow.indexOf(Number(state));
            if (indexOfState != -1){
                workflow.splice(indexOfState, 1);
            }
            var currentError = de.loewe.sl2.tvapi.i32.channel.search.search.error.getValue();
	    var currentErrorType = Utilities.getKey(ScanError, currentError);
            var expectedErrorType = Utilities.getKey(ScanError, scanResult.errorType);
            if (currentError == scanResult.errorType){
                Utilities.print("#VERIFICATION PASSED: Scan exception " + expectedErrorType
                    + " is displayed.")
            }
            else {
                Utilities.print("#VERIFICATION FAILED: Scan exception " + currentErrorType + " (ID = "
                    + currentError + ") is displayed, but expected " + expectedErrorType
                    + " (ID = " + scanResult.errorType + ").");
            }
            Scan.proceed()
            break;
        default:
                Utilities.print("#VERIFICATION FAILED: UNKNOWN STATE " + state);
                Scan.proceed()
        break;
        }
    }

    //Do not use Structures.delayedListener because of self disconnection
    function delayedListener(state) {
        if (timerID) {
            window.clearTimeout(timerID);
        }
        checkScanState(state);
    }

    searchState.onChange.connect(delayedListener);
    timerID = window.setTimeout(
        function() {
            var currState = searchState.getValue();
            checkScanState(currState);
        },
        10000
    );

    function printSat(sat) {
        if (currentFrontend.getValue() == 13) {
             if (sat != "") {
                Utilities.print("Current satellite is set to '" + sat + "'.");
            }
        }
    }
    currentSatName.onChange.connect(printSat)

    Utilities.print("Start scan...")
    if (scanType.toString() === "") {
        var nid = de.loewe.sl2.i32.channel.search.networkid;
        startSearch.call();
    }
    else {
        startSearch.call([scanType]);
        if (scanType == 1) {
            ParentalControl.enterSystemPin(function(){});
        }
    }

    function regionSelection (expectedResult, proceedFunction) {
        var regionList = de.loewe.sl2.vstr.channel.search.selection.list.getValue();
        if (expectedResult.length > 0) {
            var currentExpectedResult = expectedResult[0];
            scanResult.regionSelection.splice(0, 1);
            currentExpectedResult.listOfRegions =
                currentExpectedResult.listOfRegions || 'DNC'
            if (currentExpectedResult.listOfRegions != 'DNC') {
                if (regionList.length == currentExpectedResult.listOfRegions.length){
                    var result=true;
                    regionList.forEach(function(item,index){
                        if(item != currentExpectedResult.listOfRegions[index]){
                        result=false;
                        }
                    });
                    if (result) {
                        Utilities.print("#VERIFICATION PASSED: Available "
                            + "regions are equal to expected.")
                    }
                    else {
                        Utilities.print("#VERIFICATION FAILED: Available "
                            + "regions are NOT equal to expected.");
                        Utilities.print("INFO: Expected list:");
                        Utilities.print(currentExpectedResult.listOfRegions);
                        Utilities.print("INFO: Actual list:");
                        Utilities.print(regionList);
                    }
                }
                else{
                    Utilities.print("#VERIFICATION FAILED: number of available regions is "
                                    + regionList.length
                                    + " that is different from expected "
                                    + currentExpectedResult.listOfRegions.length + ".")
                    Utilities.print("INFO: Expected list:");
                    Utilities.print(currentExpectedResult.listOfRegions);
                    Utilities.print("INFO: Actual list:");
                    Utilities.print(regionList);
                    //~ Utilities.print("Default region will be selected: "
                            //~ + regionList[de.loewe.sl2.i32.channel.search.selected.index.getValue()]);
                    //~ proceedFunction();
                }
            }
            else {
                Utilities.print("Verification of available regions is not required");
            }

            currentExpectedResult.selectRegion =
                currentExpectedResult.selectRegion || 'DNC'
            if (currentExpectedResult.selectRegion != "DNC"){
                var currentSelect = regionList.indexOf(currentExpectedResult.selectRegion);
                Utilities.print("Set "+currentExpectedResult.selectRegion+" region...");
                if (currentSelect != -1){
                    de.loewe.sl2.i32.channel.search.selected.index.setValue(currentSelect);
                }
                else{
                    Utilities.print("#VERIFICATION FAILED: Requested region is not found")
                    Utilities.print("Default region will be selected: "
                    + regionList[de.loewe.sl2.i32.channel.search.selected.index.getValue()]);
                    proceedFunction();
                }
            }
            else{
                Utilities.print("Default region will be selected: "
                    + regionList[de.loewe.sl2.i32.channel.search.selected.index.getValue()]);
                proceedFunction();
            }
        }
        else{
            Utilities.print("#VERIFICATION FAILED: Region selection"
                +"is active but didn't expected.")
            Utilities.print("INFO: Actual list:");
                Utilities.print(regionList);
                Utilities.print("Default region will be selected: "
                        + regionList[de.loewe.sl2.i32.channel.search.selected.index.getValue()]);
                proceedFunction();
        }
        regionTimerID = setTimeout(function(){
        Utilities.print("#INFO: Region selecting still is active");
        proceed("3")}, 2000)
    }


},

/**
 * Start monitor for night update result.
 * After wake up TV displays DCM wizard, so all TV manipulations should be
 * executed via simulation of RC key presses
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function will be called on the exit of the procedure
 * @param {Number} numberNewTVServices
 * Expected number of new TV services
 * @param {Number} numberNewRadioServices
 * Expected number of new radio services
 * @param {object} scanResult
 * Object containing expected scan result
 * @requires Library: {@link Utilities}
*/
dcmMonitor: function (exitFunc,
                      numberNewTVServices,
                      numberNewRadioServices,
                      scanResult) {
    var searchState = de.loewe.sl2.tvapi.i32.channel.search.search.state;
    var dcmActive = de.loewe.sl2.i32.channel.search.osd.dcm.interactive;
    // Auxiliary variable
    var timerID = 0;
    // variable to control number of enties
    var is_lcnconflict = 0;
    var is_newTV = 0;
    var is_newRadio = 0;
    var is_unfoundTV = 0;
    var is_unfoundRadio = 0;
    var is_dcmResult = 0
    var is_scanError = 0
    var scanResult = scanResult || {} ;
    scanResult.lcnConflict = scanResult.lcnConflict || {};
    scanResult.lcnConflict.serviceList = scanResult.lcnConflict.serviceList || [];
    scanResult.lcnConflict.executeSwap = scanResult.lcnConflict.executeSwap || [];
    scanResult.newServices = scanResult.newServices || {};
    scanResult.newServices.serviceList = scanResult.newServices.serviceList || [];
    scanResult.newServices.removeServices = scanResult.newServices.removeServices || [];
    scanResult.unfoundServices = scanResult.unfoundServices || {};
    scanResult.unfoundServices.serviceList = scanResult.unfoundServices.serviceList || [];
    scanResult.unfoundServices.removeServices = scanResult.unfoundServices.removeServices || [];
    scanResult.errorType = scanResult.errorType || 0;
//create expected result for verification updated services
    var expectedScanResult = Scan.createExpResForUpdatedServices(
                                scanResult.newServices.serviceList,
                                scanResult.unfoundServices.serviceList,
                                scanResult.newServices.removeServices,
                                scanResult.unfoundServices.removeServices,
                                5
                            );
    //~ var serviceListHandlerAPI = de.loewe.sl2.i32.channel.search
                                        //~ .takeover_services_changes.getValue();
    //~ var workflowIDs = [6, 7, 8, 9];
    //~ if (serviceListHandlerAPI == 1) {
        //~ for (i = 0; i < workflowIDs.length; i++) {
            //~ var index = expectedScanResult.workflow.indexOf(workflowIDs[i]);
            //~ if (index > -1){
                //~ expectedScanResult.workflow.splice(index, 1);
            //~ }
        //~ }
    //~ }
    if (scanResult.scanError != 0 ){
        expectedScanResult.workflow.push(11);
        expectedScanResult.workflow.sort();
    }
    else {
        expectedScanResult.workflow.push(10);
        expectedScanResult.workflow.sort();
    }

    function checkScanState(state) {
        switch (true) {
            case ((state == 0) || (state == 12)):
            Utilities.print("Scanning is finished");
                    searchState.onChange.disconnect(delayedListener);
                    if (dcmActive.getValue() == 0) {
                        Utilities.print("#VERIFICATION PASSED: DCM window"
                                        + " is not active.");
                    }
                    else {
                        Utilities.print("#VERIFICATION FAILED: DCM window"
                                        + " is active.");
                    }
                    if (is_lcnconflict == 0
                        && Utilities.numberOfElements(
                            scanResult.lcnConflict.serviceList) != 0 ){
                        Utilities.print("#VERIFICATION FAILED: LCN conflict"
                                        + " has NOT happened.");
                    }
                    if (is_newTV == 0
                    && (expectedScanResult.workflow.indexOf(6) != -1) ){
                        Utilities.print("#VERIFICATION FAILED: New TV services"
                                        + " were not found.");
                    }
                    if (is_newRadio == 0
                    && (expectedScanResult.workflow.indexOf(8) != -1) ){
                        Utilities.print("#VERIFICATION FAILED: "
                                        + "New Radio services"
                                        +" were not found.");
                    }
                    if (is_unfoundTV == 0
                    && (expectedScanResult.workflow.indexOf(7) != -1) ){
                    //for DVB-T list of unfound services should be displayed only
                    //after closing DCM window
                        if (de.loewe.sl2.i32.channel.search.source.getValue() != 11) {
                            Utilities.print("#VERIFICATION FAILED: "
                                + "Unfound TV services"
                                + " were not detected in service list."
                               );
                        }
                    }
                    if (is_unfoundRadio == 0
                    && (expectedScanResult.workflow.indexOf(9) != -1) ){
                    //for DVB-T list of unfound services should be displayed only
                    //after closing DCM window
                        if (de.loewe.sl2.i32.channel.search.source.getValue() != 11) {
                            Utilities.print("#VERIFICATION FAILED: Unfound Radio services "
                                + "were not detected in service list.");
                        }
                    }
                    if (is_dcmResult == 0 &&
                        (numberNewTVServices + numberNewRadioServices) != 0) {
                        Utilities.print("#VERIFICATION FAILED: DCM result "
                        + "was not displayed (number of new found services).")
                    }
                    window.setTimeout(exitFunc, 1000);
            break;
            case (state == 1):
                Utilities.print("#VERIFICATION FAILED: Scanning started");
            break;
            case (state == 2):
                Utilities.print("#VERIFICATION FAILED: Sorting started.");
            break;
            case (state == 3):
                Utilities.print("#VERIFICATION FAILED: Unexpected state "
                                +"'Region selecting'.");
                //FIXME: Add correct exit
                Utilities.print("FIXME - I don't know correct exit. "
                                + "Test is stopped.");
                Utilities.endTest();
            break;
            case (state == 4):
                Utilities.print("#VERIFICATION FAILED:  Unexpected state "
                                + "'Manual scan'.");
                //FIXME: Can affect synchronization of UI and biz
                proceed();
            break;
            case (state == 5):
                    Utilities.print("Manual LCN conflict resolution "
                                    + "is activated.");
                    if(is_lcnconflict != 0){
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "manual conflict resolution wizard"
                                    + " is displayed repeatedly.");
                    }
                    is_lcnconflict++;
                    Scan.lcnConflictHandler(scanResult.lcnConflict, proceed);
            break;
            case (state == 6):
                Utilities.print("New TV services are found." );
                if(is_newTV != 0){
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "new found TV services wizard"
                                    + " is displayed repeatedly.");
                }
                is_newTV++;
                if (expectedScanResult.workflow.indexOf(6) == -1 ){
                    Utilities.print("#VERIFICATION FAILED: New TV services"
                        + " are found, but were not expected. "
                        + "Test will proceed without services analysis.");
                    proceed();
                }
                else{
                    Scan.updatedServicesAnalysis( expectedScanResult,
                                                  state,
                                                  proceed);
                }
            break;
            case (state == 7):
                Utilities.print("TV services that are not broadcast anymore"
                                + " are found in existing service list.");
                //for DVB-T list of unfound services should be displayed only
                //after closing DCM window
                if (de.loewe.sl2.i32.channel.search.source.getValue() != 11) {
                    if(is_unfoundTV != 0){
                        Utilities.print("#VERIFICATION FAILED: "
                                        + "unfound TV services wizard"
                                        + " is displayed repeatedly.");
                    }
                    is_unfoundTV++;
                    if (expectedScanResult.workflow.indexOf(7) == -1 ){
                        Utilities.print("#VERIFICATION FAILED: Unfound TV services"
                            + " are found, but were not expected."
                            + " Test will proceed without services analysis.");
                        proceed();
                    }
                    else{
                        Scan.updatedServicesAnalysis( expectedScanResult,
                                                      state,
                                                      proceed);
                    }
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: Unfound services"
                        + " for T operators should be displayed after DCM wizard is closed");
                    Scan.updatedServicesAnalysis( expectedScanResult,
                                  state,
                                  proceed);
                }
            break;
            case (state == 8):
                Utilities.print("New Radio services are found." );
                if(is_newRadio != 0){
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "new found Radio services wizard"
                                    + " is displayed repeatedly.");
                }
                is_newRadio++;
                if (expectedScanResult.workflow.indexOf(8) == -1 ){
                    Utilities.print("#VERIFICATION FAILED: New Radio services"
                        + " are found, but were not expected."
                        + " Test will proceed without services analysis.");
                    proceed();
                }
                else{
                    Scan.updatedServicesAnalysis( expectedScanResult,
                                                  state,
                                                  proceed);
                }
            break;
            case (state == 9):
                Utilities.print("Radio services that are not broadcast anymore"
                                + " are found in existing service list.");
                if (de.loewe.sl2.i32.channel.search.source.getValue() != 11) {
                    if(is_unfoundRadio != 0){
                        Utilities.print("#VERIFICATION FAILED: "
                                        + "unfound Radio services wizard"
                                        + " is displayed repeatedly.");
                    }
                    is_unfoundRadio++;
                    if (expectedScanResult.workflow.indexOf(9) == -1 ){
                        Utilities.print("#VERIFICATION FAILED: "
                                        + "Unfound Radio services"
                                        + " are found, but were not expected."
                                        + " Test will proceed without services "
                                        + "analysis.");
                        proceed();
                    }
                    else{
                        Scan.updatedServicesAnalysis( expectedScanResult,
                                                      state,
                                                      proceed);
                    }
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: Unfound services"
                        + " for T operators should be displayed after DCM wizard is closed");
                    Scan.updatedServicesAnalysis( expectedScanResult,
                                  state,
                                  proceed);
                }
            break;
            case (state == 10):
                if(is_dcmResult != 0){
                        Utilities.print("#VERIFICATION FAILED: "
                                + "scan result is displayed repeatedly.");
                    }
                is_dcmResult++
                if (currentOperator == 25 ){
                    if ( (numberNewTVServices+numberNewRadioServices) != 0 ) {
                        Utilities.print("#VERIFICATION PASSED: "
                            + "New found services"
                            + " are detected during night DCM.");
                        Scan.checkNumberOfTVServices(numberNewTVServices);
                        Scan.checkNumberOfRadioServices(numberNewRadioServices);
                    }
                    else {
                        Utilities.print("#VERIFICATION FAILED: "
                                    + "New found services are "
                                    + "detected "
                                    + "but not expected!");
                        Scan.checkNumberOfTVServices(numberNewTVServices);
                        Scan.checkNumberOfRadioServices(numberNewRadioServices);
                    }
                }
                else{
                    if ( expectedScanResult.workflow.indexOf(5) == -1 &&
                         expectedScanResult.workflow.indexOf(6) == -1 &&
                         expectedScanResult.workflow.indexOf(7) == -1 &&
                         expectedScanResult.workflow.indexOf(8) == -1 &&
                         expectedScanResult.workflow.indexOf(9) == -1 &&
                         (numberNewTVServices+numberNewRadioServices) == 0 ) {
                        Utilities.print("#VERIFICATION FAILED: "
                                    + "Scan result is displayed "
                                    + "but not expected!");
                        Scan.checkNumberOfTVServices(numberNewTVServices);
                        Scan.checkNumberOfRadioServices(numberNewRadioServices);

                    }
                    else {
                        Utilities.print("#VERIFICATION PASSED: "
                            + "Scan result is displayed.");
                        Scan.checkNumberOfTVServices(numberNewTVServices);
                        Scan.checkNumberOfRadioServices(numberNewRadioServices);
                    }
                }
                proceed();
            break;
            case (state == 11):
                if(is_scanError != 0){
                        Utilities.print("#VERIFICATION FAILED: "
                                + "scan exception is displayed repeatedly.");
                    }
                is_scanError++
                var currentError = de.loewe.sl2.tvapi.i32.channel.search.search.error.getValue();
                var expectedErrorType = Utilities.getKey(ScanError, scanResult.errorType);
                if (expectedScanResult.workflow.indexOf(11) == -1 ){
                    Utilities.print("#VERIFICATION FAILED: Scan exception with ID ("
                    + currentError + ") is displayed")
                    proceed();
                }
                else{
                    if (currentError == scanResult.errorType){
                        Utilities.print("#VERIFICATION PASSED: Scan exception " + expectedErrorType
                            + " is displayed.")
                    }
                    else {
                        Utilities.print("#VERIFICATION FAILED: Scan exception with ID ("
                            + currentError + ") is displayed, but expected " + expectedErrorType
                            + " (id is " + scanResult.errorType + ").");
                    }
                }
                workflow.splice(workflow.indexOf(state), 1);
                proceed();
            break;
            default:
                Utilities.print("#VERIFICATION FAILED: UNKNOWN STATE " + state);
                proceed()
            break;
            }
    }

    // Wait 5 seconds before check changed value
    // (Added to allow UI load service lists in case of RCU emulation)
    // TODO: Verify in practice if delay is necessary
    function delayedListener(state) {
        if (timerID) {
            window.clearTimeout(timerID);
        }
        timerID = window.setTimeout(
            function () {
                checkScanState(state);
                timerID = 0;
            },
            5000);
        /* Listener w/o delay
           ------------------
           if (timerID) {
               window.clearTimeout(timerID);
           }
           checkScanState(state);
        */
    }

//For Mediaset and tivusat DCM window should be displayed only if new services of
//new conflict are detected
    var currentOperator = de.loewe.sl2.i32.channel.search.
                                        selected.network.id.getValue();

    if (currentOperator == 25 || currentOperator == 15){
        if ( numberNewTVServices != 0 || numberNewRadioServices != 0
            || scanResult.lcnConflict.serviceList.length !=0 ) {
            if (dcmActive.getValue() == 1) {
                Utilities.print("#VERIFICATION PASSED: DCM window is displayed.");
                var proceed = Scan.uiProceed;
            }
            else {
                Utilities.print("#VERIFICATION FAILED: DCM window"
                                + " is NOT displayed.")
                var proceed = Scan.proceed;
            }
        }
        else {
             if (dcmActive.getValue() == 1) {
                Utilities.print("#VERIFICATION FAILED: DCM window is displayed.");
                var proceed = Scan.uiProceed;
            }
            else {
                Utilities.print("#VERIFICATION PASSED: DCM window"
                                + " is NOT displayed.")
                var proceed = Scan.proceed;
            }
        }
    }
    else{
        if (   expectedScanResult.workflow.indexOf(5) == -1 &&
               expectedScanResult.workflow.indexOf(6) == -1 &&
               expectedScanResult.workflow.indexOf(7) == -1 &&
               expectedScanResult.workflow.indexOf(8) == -1 &&
               expectedScanResult.workflow.indexOf(9) == -1 &&
               (numberNewTVServices+numberNewRadioServices) == 0 ) {
            if (dcmActive.getValue() == 1) {
                Utilities.print("#VERIFICATION FAILED: DCM window is displayed.");
                var proceed = Scan.uiProceed;
            }
            else {
                Utilities.print("#VERIFICATION PASSED: DCM window"
                                + " is NOT displayed.")
                var proceed = Scan.proceed;
            }

        }
        else {
            if (dcmActive.getValue() == 1) {
                Utilities.print("#VERIFICATION PASSED: DCM window is displayed.");
                var proceed = Scan.uiProceed;
            }
            else {
                Utilities.print("#VERIFICATION FAILED: DCM window"
                                + " is NOT displayed.")
                var proceed = Scan.proceed;
            }
        }
    }

    searchState.onChange.connect(delayedListener);
    // If during 5 seconds scan state wasn't changed
    // perform verification
    timerID = window.setTimeout(
        function() {
            checkScanState(searchState.getValue());
        },
        5000
    );
},

/**
 * Start monitor for live update
 * As far as the sequence of wizard pages depends on
 * scan results (from 0 up to 2 pages with number of found services)
 * emulation RCU is not applicable
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {function} exitFunc
 * Function will be called on success (with "true" parameter)
 * @param {object} scanResult
 * Object containing expected scan result
 * @param {Number} wizarActionParams
 * 1 Interactive DCM wizard is checked and should be closed at the end of test
 * 2 Interactive DCM wizard is checked and should NOT be closed at the end of test
 * 3 CAM wirad is checked
 * 4 No wizard should be checked
 * also can be set any expected messages Message.DCM_LIVE, for example
 * Second case is for "before standy" update
 * @param {function} [failFunc=exitFunc]
 * Function will be called on failure (with "false" parameter)
 * @param {function} [errorFunc=Utilities.endTest]
 * Function will be called on error terminating the test procedure
 * @requires Library: {@link Utilities}, {@link PressButton},
 * {@link Messages}
*/
liveDcmMonitor: function (exitFunc,
                          numberNewTVservices,
                          numberNewRadioServices,
                          scanResult,
                          wizardVerification,
                          failFunc,
                          errorFunc) {
    var searchState = de.loewe.sl2.tvapi.i32.channel.search.search.state;
    var dcmActive = de.loewe.sl2.i32.channel.search.osd.dcm.interactive;
    var timerID = 0;
    var testRes = true;
    // Approximate number of DCM wizard pages
    // should be closed
    var counter = 10;
    var scanResult = scanResult || {} ;
    scanResult.errorType = scanResult.errorType || 0;
    scanResult.lcnConflict = scanResult.lcnConflict
        || {};
    scanResult.lcnConflict.serviceList = scanResult.lcnConflict.serviceList
        || [];
    scanResult.lcnConflict.executeSwap = scanResult.lcnConflict.executeSwap
        || [];
    scanResult.newServices = scanResult.newServices
        || {};
    scanResult.newServices.serviceList = scanResult.newServices.serviceList
        || [];
    scanResult.newServices.removeServices = scanResult.newServices
        .removeServices
        || [];
    scanResult.unfoundServices = scanResult.unfoundServices
        || {};
    scanResult.unfoundServices.serviceList = scanResult.unfoundServices
        .serviceList
        || [];
    scanResult.unfoundServices.removeServices = scanResult.unfoundServices
        .removeServices
        || [];
    var errorFunc = errorFunc || Utilities.endTest;
    var failFunc = failFunc || exitFunc;
    //create expected result for verification updated services
    var expectedScanResult = Scan.createExpResForUpdatedServices(
                                scanResult.newServices.serviceList,
                                scanResult.unfoundServices.serviceList,
                                scanResult.newServices.removeServices,
                                scanResult.unfoundServices.removeServices,
                                5
                            );
    //For future use: retrieve number of services from expected result
    /*
     * if (numberNewTVservices == "") {
     *   numberNewTVservices = expectedScanResult.hasOwnPoperty("4")
     *   && expectedScanResult[4].hasOwnPoperty("128")?
     *   expectedScanResult[4][128].all.length : 0;
     * }
     * if (numberNewRadioServices == "") {
     *   numberNewRadioServices = expectedScanResult.hasOwnPoperty("8")
     *   && expectedScanResult[8].hasOwnPoperty("128")?
     *   expectedScanResult[8][128].all.length : 0;
     * }
     */
    // Pretty printing
    var workflow = expectedScanResult.workflow;
    if (Utilities.numberOfElements(scanResult.lcnConflict.serviceList) != 0) {
        workflow.push(5);
    }

    //~ }
    var statesPrint = [
        "Default state (no active scan)",
        "Scanning",
        "Sorting",
        "Region selecting",
        "Manual scan",
        "LCN conflict",
        "New TV services",
        "Unfound TV services",
        "New Radio services",
        "Unfound Radio services",
        "Scan result",
        "Scan exception",
        "UNCHECKED Idle"
    ];

    // Auxiliary functions for scan proceed in case of
    // LCN conflicts and found/non found services
    var lcnProceed = function() {
        Scan.lcnConflictHandler(scanResult.lcnConflict, Scan.proceed);
    };
    var servicesProceed = function(state) {
        Scan.updatedServicesAnalysis( expectedScanResult,
                                      state,
                                      Scan.proceed);
    };
    // Control correctness of current state
    //scan result should be displaed after each interactive scan if no error happend
    if (scanResult.errorType == 0){
        workflow.unshift(10);
    }
    else {
        workflow.unshift(11);
    }
    function checkCurrentState(proceedFunc, state) {
        if (workflow.indexOf(state) == -1) {
            Utilities.print("#VERIFICATION FAILED: " + "State "
                            + statesPrint[state] + " is not expected."
                            + " Results will be processed by default.");
            testRes = false;
            Scan.proceed();
        }
        else {
            // Remove current state from expected workflow
            workflow.splice(workflow.indexOf(state), 1);
            proceedFunc(state);
        }
    }
    // Close UI after scan handling via APIs
    function closeWizard () {
        if (dcmActive.getValue() == 1) {
            if  (counter >= 0) {
                counter--;
                PressButton.singlePress(Key.FAST_FWD);
                PressButton.singlePress(Key.FAST_FWD);
                PressButton.singlePress(Key.END);
                window.setTimeout(closeWizard, 1000);
            }
            else {
                Utilities.print("#ERROR: DCM wizard cannot be closed by "
                                + "key press emulation");
                // FIXME: Remove the line below
                // when TP will start support
                // 'NA' test result
                Utilities.print("FAIL: The test cannot proceed.");
                errorFunc();
            }
        }
        else {
            window.setTimeout(
                function(testRes) {
                    if (testRes) {
                        exitFunc(testRes);
                    }
                    else {
                        failFunc(testRes)
                    }
                }
                , 1000, testRes);
        }
    }

    function checkScanState(state) {
        switch (true) {
            case ((state == 0) || (state == 12)):
                Utilities.print("Scanning is finished");
                searchState.onChange.disconnect(delayedListener);
                // Check number of found services (both media types)
                if ((numberNewTVservices !== "")
                    && (numberNewTVservices != "DNC")) {
                    Scan.checkNumberOfTVServices(
                        numberNewTVservices
                    );
                }
                if ((numberNewRadioServices !== "")
                    && (numberNewRadioServices != "DNC")) {
                    Scan.checkNumberOfRadioServices(
                        numberNewRadioServices
                    );
                }
                // Check work flow
                if (workflow.length != 0) {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "next states were expected, "
                                    + "but didn't appear during DCM: ");
                    workflow.map(
                        function(item) {
                            Utilities.print("#ERROR:\t -- " + statesPrint[item]);
                        }
                    );
                    testRes = false;
                }
                // Close UI if necessary
                if (wizardVerification == 1) {
                    Utilities.print("Closing UI...");
                    Messages.closeMessages(
                        closeWizard,
                        Message.NO_MESSAGE,
                        errorFunc
                    );
                }
                else if (wizardVerification == 0) {
                    if (testRes) {
                        exitFunc(testRes);
                    }
                    else {
                        failFunc(testRes)
                    }
                }
                else{
                    exitFunc(testRes);
                }
            break;
            case (state == 1):
                Utilities.print("#VERIFICATION PASSED: Scanning started");
            break;
            case (state == 2):
                Utilities.print("#VERIFICATION PASSED: Sorting started.");
            break;
            case (state == 3):
                Utilities.print("Region selection is activated.");
                checkCurrentState(lcnProceed, state);
            break;
            case (state == 4):
                Utilities.print("#VERIFICATION FAILED:  Unexpected state "
                                + statesPrint[state]);
                testRes = false;
                Scan.proceed();
            break;
            case (state == 5):
                Utilities.print("Manual LCN conflict resolution "
                                + "is activated.");
                checkCurrentState(lcnProceed, state);
            break;
            case (state == 6):
                Utilities.print("New TV services are found." );
                checkCurrentState (servicesProceed, state);
            break;
            case (state == 7):
                Utilities.print("TV services that are not broadcast anymore"
                                + " are found in existing service list. ");
                checkCurrentState (servicesProceed, state);
            break;
            case (state == 8):
                Utilities.print("New Radio services are found." );
                checkCurrentState (servicesProceed, state);
            break;
            case (state == 9):
                Utilities.print("Radio services that are not broadcast anymore"
                                + " are found in existing service list. ");
                checkCurrentState (servicesProceed, state);
            break;
            case (state == 10):
                Utilities.print("Scan result is displayed");
                checkCurrentState (Scan.proceed, state);
            break;
            case (state == 11):
                Utilities.print("Scan exception is displayed");
                var currentError = de.loewe.sl2.tvapi.i32.channel.search.search.error.getValue();
                var expectedErrorType = Utilities.getKey(ScanError, scanResult.errorType);
                if (currentError == scanResult.errorType){
                    Utilities.print("#VERIFICATION PASSED: Scan exception " + expectedErrorType
                        + " is displayed.")
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: Scan exception with ID ("
                        + currentError + ") is displayed, but expected " + expectedErrorType
                        + " (id is " + scanResult.errorType + ").");
                }
                checkCurrentState (Scan.proceed, state);
            break;
            default:
                Utilities.print("#VERIFICATION FAILED: UNKNOWN STATE " + state);
                checkCurrentState (Scan.proceed, state);
            break;
            }
    }
    /* Wait 5 seconds before check changed value
    Workaround: Looks that this timeout is not working. Added additional condition of states that were missed during
    * the scan / test. See HL1-15652 for more details*/
    function delayedListener(state) {
        if (timerID) {
            window.clearTimeout(timerID);
        }
        Utilities.print("Current state: " + statesPrint[state]);
        var searchStateRes = de.loewe.sl2.tvapi.i32.channel.search.search.state.getValue();
        if ((searchStateRes == 5) || (searchStateRes == 6) || (searchStateRes == 7) || (searchStateRes == 8)) {
			checkScanState(state)
		}
        timerID = window.setTimeout(
            function () {
                checkScanState(state);
                timerID = 0;
            },
            5000);
    }
    // Check if DCM wizard is available
    if (wizardVerification == 0 || wizardVerification == 1 ) {
        if (dcmActive.getValue() == 1) {
            Utilities.print("#VERIFICATION PASSED: DCM window is displayed.");
        }
        else {
            Utilities.print("#VERIFICATION FAILED: DCM window is not displayed.");
            testRes = false;
        }
    }
    //Delayed check is used to smooth "0" values between scan states
    searchState.onChange.connect(delayedListener);
    //10 sec is used here to verify if scan is started with cooperation of CAM
    //scan 10 sec is timeout to close CAM wizard. if in 20 sec scan is not started
    //current state will be checked
    timerID = window.setTimeout(
        function() {
            var currState = searchState.getValue();
            Utilities.print("Current state: " + statesPrint[currState]);
            checkScanState(currState);
        },
        20000
    );
},

/**
 * Handle current scan by default
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {Number} is_RC
 * Flag to process scan via RC (is_RC = 1) or API (is_RC = 0)
 * @param {function} exitFunc
 * Function that should be called on scan finish.
 * @example
 * // call startTest() function after scan finish,
 * // scan should be processed via API.
 * Scan.defaultScan(0, startTest)
 * @requires Library: {@link Utilities},
*/
defaultScan: function(is_RC, exitFunc) {
    var searchState = de.loewe.sl2.tvapi.i32.channel.search.search.state;
    var dcnInteractive = de.loewe.sl2.i32.channel.search.osd.dcm.interactive;
    var end = exitFunc;
    var pressTimer = 0;
    var timerID = 0;

    if (is_RC == 1) {
        function press(button) {
            PressButton.singlePress(String(button));
            timerID = window.setTimeout(wrapper, 2000);
        }

        function UIlistener () {
            window.clearTimeout(timerID);
            window.clearTimeout(pressTimer);
            window.setTimeout(function(){
                state = searchState.getValue();

                switch (state) {
                    case 0:
                        if (dcnInteractive.getValue() == 1){
                            Utilities.print("Close DCM wizard...");
                            pressTimer = window.setTimeout(function(){press(40)},2000)
                        }
                        else {
                            searchState.onChange.disconnect(wrapper);
                            Utilities.print("DCM wizard is closed.");
                            exitFunc();
                        }
                    break;
                    case 1:
                        Utilities.print("Waiting for scanning finish...");
                    break;
                    case 2:
                        Utilities.print("Waiting for sorting finish...");
                    break;
                    default:
                        Utilities.print("Go through scan wizard...");
                        if (searchState.getValue() != 5){
//ATTENTION! KEYS ARE CHECKED ONLY FOR INTERACTIVE DCM - >>(40) HAS TO BE PRESSED
                            pressTimer = window.setTimeout(function(){press(40)},5000)
                        }
                        else{
                            pressTimer = window.setTimeout(function(){press(21)},5000)
                        }
                    break;
                }
            }, 2000)
        }

        function wrapper(){ UIlistener() }
        searchState.onChange.connect(wrapper);
        timerID = window.setTimeout(function(){wrapper()}, 2000)

    }
    else {
        var state = searchState.getValue()
        function listener(state) {
            if (state == 0) {
                Utilities.print("Current scan is finished.");
                searchState.onChange.disconnect(listener);
                exitFunc();
            }
            else {
                Scan.proceed();
            }
        }
        searchState.onChange.connect(listener);
        Scan.proceed();

    }

},

/**
 * Proceed scan via RC buttons
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @requires Library: {@link Utilities}
*/
uiProceed: function(){
    var searchState = de.loewe.sl2.tvapi.i32.channel.search.search.state;
    var dcnInteractive = de.loewe.sl2.i32.channel.search.osd.dcm.interactive;
    var state = searchState.getValue();
    var dcm = dcnInteractive.getValue();

    switch (state) {
        case 1:
            Utilities.print("Waiting scan finish...");
        break;
        case 2:
            Utilities.print("Waiting sorting finish...");
        break;
        case 3:
            Utilities.print("Accept region selection...");
            PressButton.singlePress(Key.FAST_FWD)
        break;
        case 4:
            Utilities.print("Accept manual scan result.");
            PressButton.singlePress(Key.FAST_FWD)
        break;
        case 5:
            Utilities.print("Accept conflict resolution...");
            PressButton.singlePress(Key.END)
        break;
        case 6:
            Utilities.print("Accept new found TV service list...");
            PressButton.singlePress(Key.FAST_FWD)
        break;
        case 7:
            Utilities.print("Accept unfound TV service list...");
            PressButton.singlePress(Key.FAST_FWD)
        break;
        case 8:
            Utilities.print("Accept new found Radio service list...");
            PressButton.singlePress(Key.FAST_FWD)
        break;
        case 9:
            Utilities.print("Accept unfound Radio service list...");
            PressButton.singlePress(Key.FAST_FWD)
        break;
        case 10:
            Utilities.print("Proceed verification of scan result...");
            PressButton.singlePress(Key.FAST_FWD)
        break;
        case 11:
            Utilities.print("Proceed scan error state...");
            PressButton.singlePress(Key.FAST_FWD)
        break;
        default:
            Utilities.print("Unknown scan state: " + state);
            PressButton.singlePress(Key.FAST_FWD)
            PressButton.singlePress(Key.END)
        break;
    }
},

/**
 * Proceed scan via TV APIs
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @requires Library: {@link Utilities}
*/
proceed: function(servicesToSave) {
    var servicesToSave = servicesToSave || [];
    var searchState = de.loewe.sl2.tvapi.i32.channel.search.search.state;
    var state = searchState.getValue();
    switch (state) {
        case 1:
           Utilities.print("Waiting scan finish...  \nScan results will be"
                           + " processed by default");
           var accept = function(){};
        break;
        case 2:
           Utilities.print("Waiting sorting finish... \nScan results will be"
                           + " processed by default");
            // Stop of currently running scan sometimes sets the system
            // to undefined state, so do nothing
            var accept = function(){};
        break;
        case 3:
            var accept = de.loewe.sl2.i32.channel.search.selected.index
            Utilities.print("Accept region selection.");
        break;
        case 4:
            var accept = de.loewe.sl2.action.channel.search.confirm.services;
            Utilities.print("Accept manual scan result.");
        break;
        case 5:
            var accept = de.loewe.sl2.action.channel.search.lcn.clashes.solved;
            Utilities.print("Accept conflict resolution...")
        break;
        case 6:
            var accept = de.loewe.sl2.action
            .channel.search.new.found.tv.processed;
            Utilities.print("Accept new found TV service list...")
        break;
        case 7:
            var accept = de.loewe.sl2.action
            .channel.search.not.found.tv.processed;
            Utilities.print("Accept unfound TV service list...")
        break;
        case 8:
        var accept = de.loewe.sl2.action
            .channel.search.new.found.radio.processed;
            Utilities.print("Accept new found Radio service list...")
        break;
        case 9:
            var accept = de.loewe.sl2.action
            .channel.search.not.found.radio.processed;
            Utilities.print("Accept unfound Radio service list...")
        break;
        case 10:
            var accept = de.loewe.sl2.action.channel.search.results.processed;
            Utilities.print("Proceed scan result...")
        break;
        case 11:
            //~ var accept = de.loewe.sl2.action.channel.search
                                //~ .button.pressed.back;
            var accept = de.loewe.sl2.action.channel.search.results.processed;
            Utilities.print("Proceed scan error state...")
        break;
        default:
            Utilities.print("Unknown scan state: " + state);
            var accept = de.loewe.sl2.action.channel.search.results.processed;
        break;
    }

    // Manual scan: confirmation accepts vector of zero followed by indexes
    // of services should be saved, e.g. [0, 2, 4, 12]
    if (state == 4) {
        if (servicesToSave.length == 0) {
            accept.call(["0"]);
        }
        else {
//temporary part till sw is not fixed
    //~ function onAcceptResult() {
        //~ Utilities.print("Aсtion is executed. Close wizard");
            //~ Scan.closeManualScanWizard(
        //~ function() {
            //~ Utilities.print("Wizard for manual scan "
                            //~ + "is closed.");
        //~ },
        //~ function() {
            //~ Utilities.print(
                //~ "Manual scan wizard cannot be closed.");
        //~ }
        //~ );
//~
    //~ }
//~
    //~ accept.onResult.connect(this, onAcceptResult);
//end of temporary part

           servicesToSave.unshift(0);
           accept.call(servicesToSave);
        }
    }
    else if (state == 3) {
        de.loewe.sl2.action.channel.search.selectionlist.set.call([
            de.loewe.sl2.i32.channel.search.selected.index.getValue()]);
    }
    else {
        accept.call();
    }
},

/**
 * Get number of found TV services
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {Number} expectedValue
 * Expected number of found TV services
 * @requires Library: {@link Utilities}
*/
checkNumberOfTVServices: function (expectedValue) {
    var tvServices = {
            description: "number of found TV services",
            api: de.loewe.sl2.i32.channel.search.found.services,
        };

    return Utilities.getCheckAPIValue(tvServices, expectedValue , "RSLT");
},

/**
 * Get number of found Radio services
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {Number} expectedValue
 * Expected number of found Radio services
 * @requires Library: {@link Utilities}
*/
checkNumberOfRadioServices : function (expectedValue) {
    var radioServices = {
            description: "number of found Radio services",
            api: de.loewe.sl2.i32.channel.search.found.radio.services,
    };

    return Utilities.getCheckAPIValue(radioServices, expectedValue, "RSLT")
},

/**
 * LCN conflict analysis
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {object} expectedConflict
 * Object containing conflicting services
 * @param {function} proceedFunction
 * Function will be called on the exit of the procedure
 * @requires Library: {@link Utilities}, {@link Servicelist}
*/
lcnConflictHandler: function(expectedConflict, proceedFunction){
    var proceedFunction = proceedFunction || Scan.proceed;
    //FIXME create function to create empty elements
    var expectedConflict = expectedConflict || {};
    expectedConflict.serviceList = expectedConflict.serviceList || [];
    expectedConflict.executeSwap = expectedConflict.executeSwap || [];
    /*FIXME ugly implementation of differnts types of verifications
      if number of elements in expected resutl is 8, then channel number
      of conflicted services is checked, else services will be checked
      without channel numbers
    */
    if (expectedConflict.serviceList.length > 0){
		if (expectedConflict.serviceList[0].length == 8 ) {
			var chNumCheck = 1;
		}
		else {
			var chNumCheck = 0;
		}
	}
    // global as far as required for several steps
    var listUID;
    function lcnManager(args) {

        var steps = {
            "GetListUID" : function() {
                ServiceList.getUIDofNewListWithConflict(function(serviceListUID){
                    lcnManager(["GetConflictedLCNs", serviceListUID]);
                    });
            },
            "GetConflictedLCNs" : function(serviceListUID) {
                if (Utilities.numberOfElements(serviceListUID[0]) != 1) {
                    Utilities.print(
                        "#VERIFICATION FAILED: "
                            + Utilities.numberOfElements(serviceListUID[0])
                            + " servicelists with conflicts are found."
                            + " TV should not transfer to this state "
                            + "if there is no conflict."
                            + " Scan will be finished with no verification.");
                    lcnManager(["EndFunction"]);
                }
                else {
                    listUID = serviceListUID[0].toString();
                    ServiceList.getConflictedLCNs(
                    function(conflictedLCNs){
                        lcnManager(["GetConflictedServices", conflictedLCNs]);
                    }, listUID);
                }
            },
            "GetConflictedServices" : function(conflictedLCNs) {
                if (Utilities.numberOfElements(conflictedLCNs[0]) < 1) {
                    Utilities.print("#VERIFICATION FAILED: "
                                    + "no conflicting LCNs are found."
                                    + " TV should not transfer to this state "
                                    + "if there is no conflict. Scan will be "
                                    + "finished with no verification.");
                    lcnManager(["EndFunction"])
                }
                else {
                    if (chNumCheck == 1) {
                        ServiceList.getConflictedServices(function(services){
                            lcnManager(["CheckConflict", services]);
                        }, listUID, conflictedLCNs[0]);
                    }
                    else {
                        ServiceList.getConflictedServices(function(services){
                                lcnManager(["CheckConflict", services]);
                            }, listUID, conflictedLCNs[0], [0,8,9,10,21,24,25]);
                    }
                }
            },
            "CheckConflict" : function(conflictedServices) {
                Utilities.print("Compare conflicted services with expected result..")

                var expectedNumberServices = Utilities.numberOfElements(
                    expectedConflict.serviceList
                );
                var existingNumberServices = Utilities.numberOfElements(
                    conflictedServices[0]
                );

                if ( expectedNumberServices != existingNumberServices){
                    Utilities.print("#VERIFICATION FAILED: Number of conflicted"
                                    + " services is " + existingNumberServices
                                    + " instead of expected "
                                    + expectedNumberServices + ".");
                }
                function hash (arrayRow) {
                                    return [arrayRow[2], arrayRow[3], arrayRow[4]].join("-");
                                };

                  var resultDict = Compare.makeDictionary(
                                expectedConflict.serviceList,
                                conflictedServices[0],
                                hash
                             );
                    var logLabels = ["\tName", "ChNum", "SID",
                                         "TSID", "ONID", "Type",
                                         "Visible", "Selectable"];

                    if (Compare.compareDictionaries(resultDict,
                                                    logLabels)) {
                        lcnManager(["SwapServices"])
                    }
                    else {
                        Utilities.print("Scan will be finished without swap.")
                        lcnManager(["EndFunction"])
                    }
            },
            "SwapServices" : function() {
                ServiceList.swapServices(function(){
                    lcnManager(["EndFunction"])
                },
                expectedConflict.executeSwap, listUID)
            },
            "EndFunction" : function() {
                //close all displayed messages
                var messageid = de.loewe.sl2.messages.messageid;
                if (messageid.getValue() != 0){
                    Utilities.print("INFO: Message with id "
                                    + messageid.getValue()
                                    + " is displayed.");
                    Utilities.print("Close message ...");
                    PressButton.singlePress(Key.END);
                    window.setTimeout(function(){
                        lcnManager(["EndFunction"]);
                    }, 5000);
                }
                else{
                    Utilities.print("Proceed LCN conflict...");
                    window.setTimeout(proceedFunction, 2000);
                }
            },
        }
        steps[args[0]](args.splice(1, 1));
    }

    lcnManager(["GetListUID"]);
},

/**
 * Analysis of updated services during scan.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {object} expectedResult
 * Object containing list of services
 * See Scan.createExpResForUpdatedServices for details
 * @param {Number} state
 * Current scan state, e.g. "New TV services found"
 * @param {function} proceedFunction
 * Function will be called at the exit of the procedure
 * @requires Library: {@link Utilities}, {@link Compare}
*/
updatedServicesAnalysis: function ( expectedResult, state, proceedFunction ) {
    var proceedFunction = proceedFunction || Scan.proceed;

    function compareServices(args) {

        var steps = {
            "GetUpdatedServices" : function() {
                Utilities.print("Get updated services...");
                var serviceList = de.loewe.sl2.table.servicelist.list;
                var query = {
                    selections: [
                        { field: 3, conditionType: 1, condition: updateType },
                        { field: 21, conditionType: 1, condition: mediaType }
                    ],
                    fields: [0, 6, 8, 9, 10, 21, 24, 25, 7],
                    orders: [
                        { field: 6, direction: 1 }
                    ]
                };
                Utilities.getTableValues(
                    function(services){
                        compareServices(["CheckUpdatedServices", services]);
                    },
                    serviceList,
                    query);
            },
            "CheckUpdatedServices" : function(updatedServices) {
                Utilities.print("Check updated services...");
                function createIndex(line) {
                    return [line[2], line[3], line[4]].join("-");
                }
                // Headers for result pretty printing
                var logLabels = ["\tName", "ChNum", "SID",
                                 "TSID", "ONID", "Type",
                                 "Visible", "Selectable"];
                var numberOfServices = {
                  "4": de.loewe.sl2.i32.channel.search.found.services,
                  "8": de.loewe.sl2.i32.channel.search.found.radio.services
                };
                // Make dictionary from expected,
                // query results and identificator
                var resultDict = Compare.makeDictionary(
                    expectedResult[mediaType][updateType].all,
                    updatedServices[0],
                    createIndex);
                var compareResult = Compare.compareDictionaries(resultDict, logLabels);
                if (!compareResult) {
                    Utilities.print("");
                    Utilities.print("Actual list:");
                    updatedServices[0].forEach(
                            function(item) {
//cut UUID from the end of actual result for updated services
                                if (item.length == 9) {
                                    item = item.slice(0,8);
                                }
                                Utilities.print(Utilities.prettyPrint(item));
                            }
                        )
                }
                if (compareResult && (expectedResult[mediaType][updateType].removed.length
                        != 0)) {
                    var removeUUIDs = expectedResult[mediaType][updateType]
                        .removed.map(
                        function(item) {
                            var hash = createIndex(item);
                            var index = null;
                            if (resultDict[hash].some(
                                function(subitem, id) {
                                    if (Compare.compareServices(
                                    subitem["value"], item)) {
                                        index = id;
                                        return true;
                                    }
                                }
                            )) {
                                return resultDict[hash][index]["uuid"];
                            }
                        }
                    );
                    // Send selected UUIDs to delete function
                    ServiceList.removeServices(proceedFunction, removeUUIDs);
                }
                else {
                    if (expectedResult[mediaType][updateType].removed.length
                        != 0) {
                        Utilities.print("");
                        Utilities.print("WARN: Services don't match to "
                                        + "expected. Service removal will be "
                                        + "skipped.");
                    }
                    //If no services should be removed -> just exit
                    proceedFunction();
                }
            }
        }
            steps[args[0]](args.splice(1, 1));
        }

    Utilities.print("Analysis of updated services will be executed...");
    var stateToTypes = {
            6: [4, 128],
            7: [4, 256],
            8: [8, 128],
            9: [8, 256]
    };
    var updateType = stateToTypes[state][1];
    var mediaType = stateToTypes[state][0];
    compareServices(["GetUpdatedServices"]);
},

/**
 * Create ExpectedResult for verification of list of updated services.
 * @author @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {array} newServices
 * 2D array specified by tester, every row of that
 * is a list of properties of a single service. This is an expected result
 * for newly found services.
 * Radio and TV services are listed in the same array.
 * e.g. [[<ChannelName1>, <LCN1>, <Type1>],
 *       [<ChannelName2>, <LCN2>, <Type1>],
 *                      ...
 *       [<ChannelName#N>, <LCN#N>, <Type2>]]
 *
 * @param {array} unfoundServices
 * 2D array of the same format as newServices;
 * Note 1: Orders of rows in arrays don't matter.
 * Note 2: Radio and TV services are listed in the same array.
 * Note 3: Any of parameters above can have empty ('[]') value.
 * @param {array} newServicesToRemove
 * Vector of indexes pointed to rows
 * <br/>of newServices array describing services should be removed.
 * e.g. [0, N]
 * this means services [<ChannelName1>, <LCN1>, <Type1>] and
 * [<ChannelName#N>, <LCN#N>, <Type2>] from example newServices array
 * should be removed.
 * The parameter can have nonempty value, iff newServices is not empty.
 * @param {array} unfoundServicesToRemove
 * Vector similar to newServicesToRemove
 * but listing not found services to be removed
 * The parameter can have nonempty value, iff unfoundServices is not empty.
 * @param {number} mediaID
 * Numeric value pointed to number of column in
 * newServices and unfoundServices arrays containing service media type
 * e.g. for example arrays it will be "2" (the number of column with <Type>)
 * @return {array}
 * An object having two keys of first level corresponding to media type.
 * Each of these keys has two keys for service attributes (newly found and not found).
 * Attribute keys have two keys "all" and "removed".
 * Value of "all" key is rows of input arrays selected by media type and
 * attribute specified in parent keys.
 * Value of "removed" key is rows of input arrays selected by media type and
 * attribute specified in parent keys describing services should be removed.
 * Keys for media types and service attributes are created only if
 * corresponding services are expected.
 * Additional first level key "workflow" contains vector of expected search states.
 * Value for this key is generated automatically based on input data.
 * @example
 * {
 * "4": {
 *       "128": {
 *                all: [
 *                      [<ChannelName1>, <LCN1>, 4],
 *                      [<ChannelName2>, <LCN2>, 4],
 *                       ...
 *                      [<ChannelName#K>, <LCN#K>, 4]
 *                     ]
 *                removed: [
 *                      [<ChannelName1>, <LCN1>, 4],
 *                       ...
 *                      [<ChannelName#L>, <LCN#L>, 4]
 *              }
 *       "256": {
 *                all: [
 *                      [<ChannelName#P>, <LCN#P>, 4],
 *                       ...
 *                      [<ChannelName#Q>, <LCN#Q>, 4]
 *                     ]
 *                removed: []
 *              }
 *      },
 * "8": {
 *       "128": {
 *                all: [
 *                      [<ChannelName#T>, <LCN#T>, 8],
 *                       ...
 *                      [<ChannelName#S>, <LCN#S>, 8]
 *                     ]
 *                removed: []
 *              }
 *      },
 * workflow: [6, 7, 8]
 * }
 *
 * In example, some of new found services (key "128") of media type "4" (TV)
 * expected to be removed; no services of media type "8" (Radio) should be
 * not found (absent "256" key).
 * As far as it's expected that some TV services are newly found and not found
 * and radio services are only newly found, "workflow" key contains
 * search states: ["newly found TV services", "not found TV services", "newly found radio services"]
 **/
createExpResForUpdatedServices: function (newServices,
                                unfoundServices,
                                newServicesToRemove,
                                unfoundServicesToRemove,
                                mediaID) {
    // FIXME: Replace this approach with hash
    // (media type + result type) table
    var expected = {};
    var workflowTypes = [];
    var workflowState = [];
    var states = [6, 7, 8, 9];
    var typeTuples = [
        [4, 128],
        [4, 256],
        [8, 128],
        [8, 256]
    ];
    if (unfoundServicesToRemove == 'all') {
        var unfoundID = 0;
        var unfoundServicesToRemove = []
        while (unfoundID < unfoundServices.length) {
            unfoundServicesToRemove.push(unfoundID++);
        }
    }
    if (newServicesToRemove == 'all') {
        var foundID = 0
        var newServicesToRemove = []
        while (foundID < newServices.length) {
            newServicesToRemove.push(foundID++);
        }
    }
    newServices.forEach(
        function (line) {
            if (!expected.hasOwnProperty(line[mediaID])) {
                /** mediaID - column number containing media types
                 * 128 - flag in service list marking newly found services
                **/
                expected[line[mediaID]] = {};
                expected[line[mediaID]][128] = {};
                expected[line[mediaID]][128].all = [];
                expected[line[mediaID]][128].removed = [];
            }
            expected[line[mediaID]][128].all.push(line);
        }
    );
    unfoundServices.forEach(
        function (line) {
            if (!expected.hasOwnProperty(line[mediaID])) {
                expected[line[mediaID]] = {};
            }
            if (!expected[line[mediaID]].hasOwnProperty("256")){
                expected[line[mediaID]][256] = {};
                expected[line[mediaID]][256].all = [];
                expected[line[mediaID]][256].removed = [];
            }
            expected[line[mediaID]][256].all.push(line);
        }
    );
    // workflow encodes expected search states (not ordered)
    // TODO: generalize structure to support LCN conflicts
    newServicesToRemove.forEach(
        function(line) {
            var mediaType = newServices[line][mediaID];
            if ((!expected.hasOwnProperty(mediaType))
            || (!expected[mediaType].hasOwnProperty(128))) {
                Utilities.print("#ERROR: Incorrect input data. "
                                + "Services are not expected to be found, "
                                + "but expected to be removed. "
                                + "Script will proceed, "
                                + "but removal operation will be skipped.");
                  }
            else {
                expected[mediaType][128].removed.push(newServices[line]);
            }
        }
    );
    unfoundServicesToRemove.forEach(
        function(line) {
            var mediaType = unfoundServices[line][mediaID];
            if ((!expected.hasOwnProperty(mediaType))
            || (!expected[mediaType].hasOwnProperty(256))) {
                Utilities.print("#ERROR: Incorrect input data. "
                                + "Services are not expected to be not found, "
                                + "but expected to be removed. "
                                + "Script will proceed, "
                                + "but removal operation will be skipped.");
            }
            else {
                expected[mediaType][256].removed.push(unfoundServices[line]);
            }
        }
    );
    for (media in expected) {
        for (type in expected[media]) {
            workflowTypes.push([media, type]);
        }
    }

    for (var i = 0; i < workflowTypes.length; i ++) {
        for (var k = 0; k < typeTuples.length; k++){
            if ((workflowTypes[i][0] == typeTuples[k][0])
                && (workflowTypes[i][1] == typeTuples[k][1])) {
                workflowState.push(states[k]);
            }
        }
    }
    expected.workflow = workflowState.sort();
    return expected;
},
/**
 * Analysis of unfound services for DVB-T networks.
 * ATTENTION! All unfound services will be removed from list.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @requires Library: {@link Utilities}, {@link Compare}
*/
dvbtUnfoundServicesAnalysis: function (exitFunc, unfoundServices) {
    var notreceivable = de.loewe.sl2.i32.tvservice.notreceivable;
    var unfoundServices = unfoundServices || {};
    unfoundServices.serviceList = unfoundServices.serviceList || [];

    function unfoundServicesHandler(unfoundServices) {

        function compareServices(args) {

            var steps = {
                "GetUpdatedServices" : function() {
                    Utilities.print("Get updated services...");
                    var serviceList = de.loewe.sl2.table.servicelist.list;
                    var query = {
                        selections: [
                            { field: 3, conditionType: 1, condition: 256 }],
                        fields: [0, 6, 8, 9, 10, 21, 24, 25, 7],
                        orders: [
                            { field: 6, direction: 1 }
                        ]
                    };
                    Utilities.getTableValues(function(services){
                        compareServices(["CheckUpdatedServices", services]);},
                                        serviceList,
                                        query);
                },
                "CheckUpdatedServices" : function(updatedServices) {
                    Utilities.print("Check updated services...");
                    function createIndex(line) {
                        return [line[2], line[3], line[4]].join("-");
                    }
// Headers for result pretty printing
                    var logLabels = ["\tName", "ChNum", "SID", "TSID",
                                "ONID", "Type", "Visible", "Selectable"];
// Make dictionary from expected, query results and identificator
                    var resultDict = Compare.makeDictionary(
                        unfoundServices.serviceList,
                        updatedServices[0],
                        createIndex);
                    Compare.compareDictionaries(resultDict, logLabels);
                    Utilities.print(
                        "Confirm deletion of all unfound services..."
                    );
                    PressButton.singlePress(Key.FAST_FWD);
                    window.setTimeout(
                        function(){
                            Scan.dvbtUnfoundServicesAnalysis(exitFunc);
                        }, 3000);
                }
            }
            steps[args[0]](args.splice(1, 1));
        }

        Utilities.print("Analysis of unfound services will be executed...");
        compareServices(["GetUpdatedServices"]);
    };


    if (Utilities.numberOfElements(unfoundServices.serviceList) != 0) {
        if (notreceivable.getValue() == 1) {
            Utilities.print("#VERIFICATION PASSED: Window with no longer "
                            + "found services is displayed.");
            unfoundServicesHandler(unfoundServices);
        }
        else {
            Utilities.print("#VERIFICATION FAILED: Window with no longer "
                            + "found TV services is NOT displayed.");
            exitFunc();
        }
    }
    else{
        if (notreceivable.getValue() == 1) {
            Utilities.print("#VERIFICATION FAILED: Window with no longer "
                            + "found services is displayed.");
            Utilities.print("Window will be closed by pressing '>>' button.");
            PressButton.singlePress(Key.FAST_FWD);
            window.setTimeout(exitFunc, 4000);
        }
        else {
            Utilities.print("#VERIFICATION PASSED: Window with no longer "
                            + "found TV services is NOT displayed.");
            exitFunc();
        }

    }

},

/**
 * Get available networks IDs.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @requires Library: {@link Utilities}
*/
getNIDs: function (exitFunc, frontend, satelliteID) {
    var satelliteID = satelliteID || "-1";
    var networksQuery  =  {
        selections: [
            { field: 2, conditionType: 1, condition: frontend},
            { field: 3, conditionType: 1, condition: satelliteID}
        ],
        fields: [0], //Get a NIDs
    };
    var availableNID = de.loewe.sl2.channel.search.table.dvbnetworks;

    Utilities.getTableValues(exitFunc, availableNID, networksQuery);
},

/**
 * Create expected result for verification of manual scan
 * @author @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {array} servicesAll
 * 2D array specified by tester, every row of that
 * is a list of properties of a single service.
 * Note 1: Orders of rows in arrays don't matter.
 * Note 2: Radio and TV services are listed in the same array.
 * @param {array} servicesToSave
 * Vector of indexes pointed to rows
 * <br/>of newServices array describing services should be saved,
 * e.g. [0, N]
 * The parameter can have nonempty value, iff servicesAll is not empty.
 * @return {object}
 * Returned object has three keys: "all", "saved", "workflow".
 * Value of "all" key is all rows from servicesAll.
 * Value of "saved" key is rows of servicesAll
 * describing services should be saved.
 * "workflow" is array of expected search states generated based on
 * expected result
 * @example
 * {
 *                all: [
 *                      [<ChannelName1>, <Type1>, <is_New1>],
 *                      [<ChannelName2>, <Type2>, <is_New2>],
 *                       ...
 *                      [<ChannelName#K>, <Type#K>, <is_New#K>]
 *                     ],
 *                saved: [
 *                      [<ChannelName1>, <Type1>, <is_New1>],
 *                       ...
 *                      [<ChannelName#L>, <Type#L>, <is_New#L>]
 *                     ],
 *                workflow: [4]
 * }
 *
 **/
createExpResForManualScan: function (servicesAll, servicesToSave) {
    var expected = {};
    expected.workflow = [];
    servicesAll.forEach(
        function (line) {
            if (!expected.hasOwnProperty("all")) {
                expected.all = [];
                expected.saved = [];
                // Add manual scan state to workflow
                expected.workflow.push(4);
            }
            expected.all.push(line);
        }
    );
    servicesToSave.forEach(
        function(line) {
            if (!expected.hasOwnProperty("all")) {
                Utilities.print("#ERROR: Incorrect input data. "
                                + "Services are not expected to be found, "
                                + "but expected to be saved. "
                                + "Script will proceed,"
                                + " but saving operation will be skipped.");
            }
            else {
                expected.saved.push(servicesAll[line]);
            }
        }
    );
    return expected;
},
/**
 * Analysis of manual scan results.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Scan
 * @param {object} expectedResult
 * Object including found services and services to be saved
 * (returned value of createExpResForManualScan() )
 * @param {function} proceedFunction
 * Function will be called at the exit of the procedure
 * @requires Library: {@link Utilities}, {@link Compare}
*/
manualScanResultsAnalysis: function ( expectedResult, proceedFunction ) {
    var proceedFunction = proceedFunction || Scan.proceed;
    function compareServices(args) {
        var steps = {
            "GetFoundServices" : function(version) {
                var query = {
                    selections: [
                        // Select all services
                        { field: 0, conditionType: 2, condition: "" }
                    ],
                    /* Get channel name, service type,
                     * is service newly found, TSID, ONID,
                     * SID, index in UI list
                     */
                    fields: [1, 2, 3, 5, 6, 7, 4],
                    orders: [
                        { field: 4, direction: 1 }
                    ]
                };
                Utilities.print("Get found services...");
                var serviceTable = de.loewe.sl2.table.found.channels;
                Utilities.getTableValues(
                    function(services){
                        compareServices(["CheckFoundServices", services]);
                    },
                    serviceTable,
                    query,
                    proceedFunction
                );
            },
            "CheckFoundServices" : function(updatedServices) {
                Utilities.print("Check updated services...");
                // Check if smth is returned
                if (updatedServices.length == 0) {
                    Utilities.print("#ERROR: System inconvenience "
                                    + "or bug in the test script: "
                                    + "scan state indicates found services, "
                                    + "but corresponding table is empty."
                                    + "\nNo services will be saved."
                    );
                    proceedFunction();
                }
                else {
                    var updatedExpectedResult = [];
                    var createIndex = function (line) {
                        //Hash is "TSID-ONID-SID"
                        return [line[3], line[4], line[5]].join("-");
                    }
                    // Headers for result pretty printing
                    var logLabels = ["\tName", "Type", "is New",
                                     "TSID", "ONID", "SID"];
                    updatedExpectedResult = expectedResult.all;

                    // Make dictionary from expected,
                    // query results and hash function
                    var resultDict = Compare.makeDictionary(
                        updatedExpectedResult,
                        updatedServices[0],
                        createIndex);
                    var compareResult = Compare.compareDictionaries(resultDict, logLabels);
                    if (!compareResult) {
                        Utilities.print("Actual list:");
                        updatedServices[0].forEach(
                                function(item) {
//cut service number from the end of actual result for updated services
                                    if (item.length == 7) {
                                        item = item.slice(0,6);
                                    }
                                    Utilities.print(Utilities.prettyPrint(item));
                                }
                            )
                        Utilities.print("");
                    }

                    if (compareResult && expectedResult.saved.length != 0) {
                        Utilities.print(
                            "Defining list of services to be saved...");
                        // Notify if already existed service is found
                        // and expected to be saved
                        expectedResult.saved.forEach(
                            function(item) {
                                if (item[2] == 0) {
                                    Utilities.print(
                                        "WARN: Service " + item[0]
                                        + " is already saved."
                                    );
                                }
                            }
                        );
                        var saveUUIDs = expectedResult.saved.map(
                            function(item) {
                                var hash = createIndex(item);
                                var index = null;
                                if (resultDict[hash].some(
                                    function(subitem, id) {
                                        if (Compare.compareServices(
                                        subitem["value"], item)) {
                                            index = id;
                                            return true;
                                        }
                                    }
                                )) {
                                    return resultDict[hash][index]["uuid"];
                                }
                            }
                        );
                        // Send selected UUIDs to delete function
                        proceedFunction(saveUUIDs);
                    }
                    else {
                        //If no services should be removed -> just exit
                        proceedFunction();
                    }
                }
            }
        }
        steps[args[0]](args.splice(1, 1));
    }

    Utilities.print("Analysis of found services will be executed...");
    compareServices(["GetFoundServices"]);
}

}
}
