include('Utilities.js');
include('Scan.js');
include('Structures.js');

init = function() {
    /** @namespace
     * Antenna
     */
    Antenna = {
        setSatScheme: function(v_scheme, exitFunc, failFunc) {
            if (v_scheme === "") {
                v_scheme = "DNC"
            }
            var scheme = {
                description: "Satellite configuration",
                api: de.loewe.sl2.i32.antenna.dvbs.enum.installation,
                operatingValue: v_scheme,
            };
            Scan.getSetCheck(exitFunc, scheme, failFunc);
        },
        /**
         * Get satellites settings, set their values to expected ones
         * if differ, check changes were applied.
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Antenna
         * @param {function} exitFunc
         * Function that should be called on success
         * @param {object} inputSettings
         * List of satellite settings that should be set:
         * </br> - satellites,
         * </br> - band mode for single satellite configuration,
         * </br> - low band frequencies,
         * </br> - high band frequencies
         * Settings are optional.
         * @param {function} [failFunc = exitFunc]
         * Function that should be called on failure
         * @example
         * var satelliteSettings = {
         *      satellite1: {
         *          operatingValue: "ASTRA1",
         *          initialValue: "ASTRA3",
         *      },
         *      bandMode: {
         *          operatingValue: satBand.DUAL,
         *          initialValue: "DNC",
         *      }
         * };
         * Scan.setSatelliteSettings(
         * function() {
         * Utilities.endTest();
         *},
         * satelliteSettings)
         * @requires Library: {@link Scan}
         */
        setSatelliteSettings: function(exitFunc, inputSettings, failFunc) {
            Utilities.print("Set/Check satellite settings: "
                            + "satellites, bands...");
            Scan.settingsHandler(exitFunc,
                                 inputSettings,
                                 Scan.getSetCheck,
                                 failFunc);
        },
        /**
         * Check if all band frequencies have acceptable values
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Antenna
         * @param {function} exitFunc
         * Function will be called on success
         * @param {object} input
         * Satellite settings (see example for Antenna.setSatelliteSettings())
         * @param {function} [failFunc=exitFunc]
         * Function will be called on fail
         * @example
         * Antenna.verifyFrequency(
         * function() {
         * Utilities.endTest();
         *},
         * satelliteSettings)
         * @requires Library: {@link Utilities}
         */
        verifyFrequency: function(exitFunc, input, failFunc) {
            var failFunc = failFunc || exitFunc;
            var testRes = true;
            var LNBfrequencies = de.loewe.sl2.vint32
                .antenna.dvbs.lnb.frequencies.getValue();
            function singleCheck(bandValue){
                if (LNBfrequencies.indexOf(bandValue) == -1){
                    Utilities.print(
                        "#ERROR: Incorrect expected low band frequency."
                            + "Specified " + bandValue
                            + ", expected to be one of next: ");
                    LNBfrequencies.forEach(
                        function(item) {
                            Utilities.print("-- " + item);
                        }
                    );
                    testRes = false;
                }
            }
            for ( var key in input) {
                if (key.indexOf("lowBand") != -1
                    || key.indexOf("highBand") != -1) {
                    if (input[key].hasOwnProperty("operatingValue")
                        && typeof(input[key].operatingValue) == "number") {
                        singleCheck(input[key].operatingValue);
                    }
                    if (input[key].hasOwnProperty("initialValue")
                        && typeof(input[key].initialValue) == "number") {
                        singleCheck(input[key].initialValue);
                    }
                }
            }

            if (testRes) {
                exitFunc();
            }
            else {
                failFunc();
            }
        },
        /**
         * Save expected satellite IDs in the antenna wizard
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Antenna
         * @param {function} exitFunc
         * Function will be called on success
         * @param {object} settings
         * Satellite settings
         * @param {function} [failFunc=exitFunc]
         * Function will be called on fail
         * @requires Library: {@link Utilities},{@link Structures}
         */
        setSatelliteIndices: function(exitFunc, settings, failFunc) {
            var failFunc = failFunc || exitFunc;
            var failFn = function(){failFunc(false)};
            var settingNames = ["satelliteName1", "satelliteName2",
                               "satelliteName3", "satelliteName4"];
            var scheme = de.loewe.sl2.i32.antenna.dvbs.enum
                .installation.getValue();
            var numberOfSatellites;
            function setOneSat(obj, name, exitFn) {
                var testResult = true;
                var IDsNames = {
                    satelliteName1: [
                        de.loewe.sl2.i32.antenna.dvbs.satellite._1.index,
                        de.loewe.sl2.str.antenna.dvbs.satellite._1.name
                    ],
                    satelliteName2: [
                        de.loewe.sl2.i32.antenna.dvbs.satellite._2.index,
                        de.loewe.sl2.str.antenna.dvbs.satellite._2.name
                    ],
                    satelliteName3: [
                        de.loewe.sl2.i32.antenna.dvbs.satellite._3.index,
                        de.loewe.sl2.str.antenna.dvbs.satellite._3.name
                    ],
                    satelliteName4: [
                        de.loewe.sl2.i32.antenna.dvbs.satellite._4.index,
                        de.loewe.sl2.str.antenna.dvbs.satellite._4.name
                    ]
                };
                var currentSatName = IDsNames[name][1].getValue();
                var allSatNames = de.loewe.sl2.vstr.antenna.dvbs
                    .satellite.list.getValue();
                var allSatIDs = de.loewe.sl2.vint32.antenna.dvbs
                    .satellite.list.indices.getValue();
                var operValueDefined = (["undefined", "DNC"].indexOf(
                    String(obj.operatingValue)) == -1);
                var initValueDefined = (["undefined", "DNC"].indexOf(
                    String(obj.initialValue)) == -1);

                function setSatId(satName, IDapi) {
                    // Find the expected satellite name in the list of
                    // all available ones
                    if (satName === "") {
                        // The inner value for the "none" satellite
                        // Used only in the
                        // de.loewe.sl2.vstr.antenna.dvbs.satellite.list
                        // In all other cases the name of the "none" satellite
                        // is an empty string ("").
                        satName = "#3075";
                    }
                    Utilities.print("Set the satellite selected for the scan"
                                    + " to '" + satName + "'...");
                    var nameID = allSatNames.indexOf(satName);
                    if (nameID == -1) {
                        Utilities.print("#VERIFICATION FAILED: Expected value "
                                        + "of " + obj.description + " is not "
                                        + "available.");
                        failFn();
                    }
                    else {
                        // Set the satellite ID defined via the expected
                        // satellite name
                        var satelliteObj = {
                            description: "ID of the '" + satName + "' "
                                + "satellite in the antenna wizard",
                            api: IDapi,
                            operatingValue: allSatIDs[nameID]
                        };
                        Structures.setSmoothCheck(exitFn, satelliteObj,
                                                  satelliteObj.operatingValue,
                                                  failFn);
                    }
                }

                // All logic below is inherited from Scan.getSetCheck()

                // Logging
                if (initValueDefined) {
                    if (obj.initialValue === currentSatName) {
                        Utilities.print("#VERIFICATION PASSED: initial value"
                                        + " of the name of a satellite in the"
                                        +" antenna wizard is '"
                                        + currentSatName + "'.");
                    }
                    else {
                        Utilities.print("#VERIFICATION FAILED: initial value of"
                                        + " the name of a satellite in the"
                                        + " antenna wizard is '"
                                        + currentSatName
                                        + "' that is different from expected '"
                                        + obj.initialValue + "'.");
                        testResult = false;
                    }
                }

                //Setting
                if (operValueDefined) {
                    setSatId(obj.operatingValue, IDsNames[name][0]);
                }
                else if (initValueDefined &&
                         obj.initialValue != currentSatName) {
                    setSatId(obj.initialValue, IDsNames[name][0]);
                }
                else {
                    // Quit if no setup is expected
                    if (testResult) {
                        exitFn();
                    }
                    else {
                        failFn();
                    }
                }
            }

            function incrementSetup(namesList) {
                if (namesList.length > 0){
                    if (settings.hasOwnProperty(namesList[0])) {
                        setOneSat(settings[namesList[0]], namesList[0],
                                  function() {
                                      incrementSetup(namesList.slice(1));});
                    }
                    else {
                        incrementSetup(namesList.slice(1));
                    }
                }
                else {
                    exitFunc(true);
                }
            }

            switch(scheme) {
            // Single satellite
            case 0:
            // Other installation
            case 5:
                numberOfSatellites = 1;
                break;
            // DiSEqC multiswitch
            case 3:
                numberOfSatellites = 4;
                break;
            default:
                numberOfSatellites = 2;
            }
            // The system after scheme setup automatically set to -1
            // all satellites that cannot be set for this scheme, e.g.
            // all satellites but the first one for the single satellite scheme
            incrementSetup(settingNames.slice(0, numberOfSatellites));
        },
        /**
         * Save all antenna DVB-S related settings
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Antenna
         * @param {function} exitFunc
         * Function will be called on success
         * @param {function} [failFunc=exitFunc]
         * Function will be called on fail
         * @example
         * Antenna.saveDVBSsettings(
         * </br>function() {
         * </br>Utilities.endTest();
         *});
         * @requires Library: {@link Utilities}, {@link Structures}
         */
        saveDVBSsettings: function(exitFunc, failFunc) {
            var failFunc = failFunc || exitFunc;
            var scanSatelliteNames = de.loewe.sl2.vstr
                .channel.search.satellitenamelist;
            var saveDVBS = de.loewe.sl2.action.antenna.dvbs.set;
            var antennaSatelliteNames = [
                de.loewe.sl2.str.antenna.dvbs.satellite._1.name.getValue(),
                de.loewe.sl2.str.antenna.dvbs.satellite._2.name.getValue(),
                de.loewe.sl2.str.antenna.dvbs.satellite._3.name.getValue(),
                de.loewe.sl2.str.antenna.dvbs.satellite._4.name.getValue()
            ].map(function(item) {
                if (item == "#3075") {
                    return "";
                }
                else {
                    return item;
                }
            });

            var check = function () {
                if (String(scanSatelliteNames.getValue())
                    == String(antennaSatelliteNames)) {
                    exitFunc(true);
                }
                else {
                    failFunc(false);
                }
            }
            Structures.smoothListener(scanSatelliteNames,
                                      check,
                                      2000,
                                      5000);
            saveDVBS.call();
        },
        /**
         * Set satellite ID for automatic and manual scan
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Antenna
         * @param {function} exitFunc
         * Function will be called on success
         * @param {Object} obj
         * currentScanSatellite object
         * @param {function} [failFunc=exitFunc]
         * Function will be called on fail
         * @requires Library: {@link Utility}
         */
        setSatelliteForScan: function(exitFunc,
                                      obj,
                                      //satelliteID,
                                      failFunc) {
            var failFunc = failFunc || exitFunc;
            var eFunc = function(){exitFunc(true)};
            var fFunc = function(){failFunc(false)};
            var testResult = true;
            var currentSatName = de.loewe.sl2.str.channel.search
                .satellitename.getValue();
            var allScanSatNames = de.loewe.sl2.vstr.channel.search
                .satellitenamelist.getValue();
            var allScanSatIDs = de.loewe.sl2.vi32.channel.search
                .satellitelist.getValue();
            var operValueDefined = (["undefined", "DNC"].indexOf(
                String(obj.operatingValue)) == -1);
            var initValueDefined = (["undefined", "DNC"].indexOf(
                String(obj.initialValue)) == -1);

            function setSatId(satName) {
                // Find the expected satellite name in the list of available
                // for scan ones
                var nameID = allScanSatNames.indexOf(satName);
                if (nameID == -1) {
                    Utilities.print("#VERIFICATION FAILED: Expected value of "
                                    + obj.description + " is not available"
                                    + " for scan.\nAvailable satellites: "
                                    + allScanSatNames);
                    failFunc(false);
                }
                else {
                    // Set the satellite ID defined via the expected satellite
                    // name
                    var satelliteObj = {
                        description: "ID of the satellite selected for "
                            + "the scan",
                        api: de.loewe.sl2.tvapi.i32.channel.search
                            .satellite.id,
                        operatingValue: allScanSatIDs[nameID]
                    };
                    Structures.setSmoothCheck(eFunc, satelliteObj,
                                              satelliteObj.operatingValue,
                                              fFunc);
                }
            }
            // All logic below is inherited from Scan.getSetCheck()

            // Logging
            if (initValueDefined) {
                if (obj.initialValue === currentSatName) {
                    Utilities.print("#VERIFICATION PASSED: initial value of "
                                    + "the satellite selected for the scan"
                                    + " is '" + currentSatName + "'.");
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: initial value of "
                                    + "the satellite selected for the scan"
                                    + " is '" + currentSatName
                                    + "' that is different from expected '"
                                    + obj.initialValue + "'.");
                    testResult = false;
                }
            }

            //Setting
            if (operValueDefined) {
                Utilities.print("Set the satellite selected for the scan to '"
                                + obj.operatingValue + "'...");
                setSatId(obj.operatingValue);
            }
            else if (initValueDefined && obj.initialValue != currentSatName) {
                Utilities.print("Set the satellite selected for the scan to '"
                                + obj.initialValue + "'...");
                setSatId(obj.initialValue);
            }
            else {
                // Quit if no setup is expected
                if (testResult) {
                    exitFunc(true);
                }
                else {
                    failFunc(false);
                }
            }
        },
        /**
         * Get satellite IDs in antenna settings
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Antenna
         * @param {function} exitFunc
         * Function will be called on success
         * @param {number} scheme
         * Satellite installation scheme
         * @param {function} [failFunc=exitFunc]
         * Function will be called on fail
         */
        getSatelliteIDsList: function(exitFunc, scheme, failFunc) {
            var failFunc = failFunc || exitFunc;
            var satelliteIDs = de.loewe.sl2.vint32
                .antenna.dvbs.satellite.list.indices;
            var getSatelliteList = de.loewe.sl2.action
                .antenna.dvbs.getsatlist;
            function checkList(){
                if (satelliteIDs.getValue().length != 0) {
                    exitFunc(true);
                }
                else {
                    failFunc(false);
                }
            }
            if (["", "DNC", "undefined"].indexOf(String(scheme)) == -1) {
                // Get the current system scheme, if it's not specified
                // explicitly
                scheme = de.loewe.sl2.i32.antenna.dvbs.enum
                    .installation.getValue();
            }

            var numberOfSatellites;
            switch(scheme) {
            // Single satellite
            case 0:
            // Other installation
            case 5:
                numberOfSatellites = 1;
                break;
            // DiSEqC multiswitch
            case 3:
                numberOfSatellites = 4;
                break;
            default:
                numberOfSatellites = 2;
            }

            Structures.delayedListener(satelliteIDs, checkList, 5000);
            getSatelliteList.call(numberOfSatellites);
        },
        /**
         * Set all antenna settings
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Antenna
         * @param {function} exitFunc
         * Function will be called on success
         * @param {number} scheme
         * Satellite installation scheme
         * @param {object} settings
         * List of antenna settings
         * @param {function} [failFunc=exitFunc]
         * Function will be called on fail
         * @example
         * Antenna.setSatellites(
         * function() {
         * Utilities.endTest();
         * },
         * satScheme.Single,
         * antennaSettings);
         * @requires Library: {@link Utilities}
         */
        setSatellites: function(exitFunc,
                                scheme,
                                settings,
                                failFunc) {
            var failFunc = failFunc || exitFunc;
            var satNames = [ "satelliteName1", "satelliteName2",
                             "satelliteName3", "satelliteName4" ];
            var otherSettings = {};
            // Filter off satellite names to fix different naming convention
            // of NONE in antenna satellite names and scan ones
            Object.keys(settings).forEach(
                function(item) {
                    if (satNames.indexOf(item) == -1) {
                        otherSettings[item] = settings[item];
                    }
                }
            );

            function  manager(args) {
                var steps = {
                    "SetScheme" : function() {
                        if (["", "DNC", "undefined"].indexOf(String(scheme))
                            == -1) {
                            Antenna.setSatScheme(
                                scheme,
                                function() {
                                    Utilities.print("Satellite scheme is set "
                                                    + "successfully.");
                                    manager(["GetSatelliteIDList"]);
                                },
                                function() {
                                    Utilities.print(
                                        "#VERIFICATION FAILED: "
                                            + "Scheme is not set.");
                                    manager(["EndTest"]);
                                }
                            );
                        }
                        else {
                            manager(["GetSatelliteIDList"]);
                        }
                    },
                    "GetSatelliteIDList": function(){
                        Antenna.getSatelliteIDsList(
                            function() {
                                Utilities.print("List of satellite IDs "
                                                + "was retrieved "
                                                + "successfully.");
                                    manager(["SetSatellites"]);
                                },
                                scheme,
                                function() {
                                    Utilities.print("#ERROR: Satellite IDs are"
                                                    + " unavailable.");
                                    manager(["EndTest"]);
                                }
                        );
                    },
                    "SetSatellites" : function() {
                        Antenna.setSatelliteIndices(
                            function() {
                                Utilities.print("All satellites are set in the"
                                                + " antenna wizard.");
                                manager(["VerifyFrequencyValues"]);
                            },
                            settings,
                            function() {
                                Utilities.print("#VERIFICATION FAILED:"
                                                +" Satellites failed to set up"
                                                + " in the antenna wizard.");
                                manager(["EndTest"]);
                            }
                        );
                    },
                    "VerifyFrequencyValues" : function() {
                        Antenna.verifyFrequency(
                            function() {
                                Utilities.print(
                                    "All band frequencies have"
                                        + " acceptable values.");
                                manager(["SetSatelliteSettings"]);
                            },
                            settings,
                            function() {
                                Utilities.print(
                                    "#VERIFICATION FAILED:"
                                        +" Invalid frequency value.");
                                manager(["EndTest"]);
                            }
                        );
                    },
                    "SetSatelliteSettings" : function() {
                        Antenna.setSatelliteSettings(
                            function() {
                                Utilities.print(
                                    "All satellite settings "
                                        + "are set successfully.");
                                manager(["SaveDVBSSettings"]);
                            },
                            otherSettings,
                            function() {
                                Utilities.print(
                                    "#VERIFICATION FAILED:"
                                        +" Some satellite settings"
                                        + " were not set.");
                                manager(["EndTest"]);
                            }
                        );
                    },
                    "SaveDVBSSettings" : function() {
                        Antenna.saveDVBSsettings(
                            function() {
                                Utilities.print(
                                    "Antenna settings were "
                                        + "saved successfully.");
                                manager(["EndTest", true]);
                            },
                            function() {
                                Utilities.print(
                                    "#VERIFICATION FAILED: "
                                        + "Antenna settings were not saved"
                                        + " correctly.");
                                manager(["EndTest"]);
                            }
                        );
                    },
                    "EndTest" : function(result) {
                        var result = result[0] || false;
                        if (result) {
                            exitFunc(result);
                        }
                        else {
                            failFunc(result);
                        }
                    }
                }
                steps[args[0]](args.splice(1, 1));
            }
            manager(["SetScheme"]);
        }
    }
}
