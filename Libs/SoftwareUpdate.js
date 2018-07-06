include('Utilities.js');
include('Structures.js');
include('Timer.js');
include('ServiceMode.js');

init = function() {
    /** @namespace
     * SoftwareUpdate
     */
    SoftwareUpdate = {
        /**
         * Check vailability of the update source
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof SoftwareUpdate
         * @param {Integer} source
         * Update source to be verified
         */
        isUpdateSourceReady: function(source) {
            var usbExist = de.loewe.sl2.i32.software.update
                .usb.exist.getValue();
            var internetExist = de.loewe.sl2.i32.software.update
                .internet.exist.getValue();
            var internetActive = de.loewe.sl2.i32.software.update
                .internet.active.getValue();
            var dvbtExist = de.loewe.sl2.i32.software.update
                .dvbt.exist.getValue();
            switch(source) {
            case 0:
                // NONE
                return false;
                break;
            case 1:
                // USB
                return usbExist;
                break;
            case 2:
                // INTERNET
                return internetExist && internetActive;
                break;
            case 3:
                // DVBT
                return dvbtExist;
                break;
            case 4:
                // DVBS
                Utilities.print("#ERROR: DVB-S source is not supported.");
                return false;
            }
        },
        /**
         * Get ID of the defined packet
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof SoftwareUpdate
         * @param {string} version
         * Version to be found
         */
        getPacketID: function(version) {
            var pckList = de.loewe.sl2.vstr.software.update
                .new.packet.list.getValue();
            var pcks = pckList.reduce(function(acc, item, idx) {
                if (item.indexOf(version) != -1) {
                    acc.push(idx);
                }
                return acc;
            }, []);

            switch(pcks.length) {
            case 0:
                Utilities.print("#VERIFICATION FAILED: Packet with '"
                                + version + "' version is not found.");
                return -1;
                break;
            case 1:
                Utilities.print("#VERIFICATION PASSED: Packet with '"
                                + version + "' version is found.");
                return pcks[0];
                break;
            default:
                Utilities.print("#VERIFICATION FAILED: Several packets"
                                + " satisfying to '" + version
                                + "' version are found.");
                return -1;
            }
        },
        /**
         * Check the packet selected for update
         * Returns true if the current packet matches the expected version
         * returns false otherwise
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof SoftwareUpdate
         * @param {string} version
         * Version to be found
         */
        checkPacket: function(version) {
            var newPacket = de.loewe.sl2.str.software.update.new.packet;
            return (newPacket.getValue().indexOf(version) != -1);
        },
        /**
         * Set the packet for update
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof SoftwareUpdate
         * @param {integer} packetID
         * ID of the packet for update
         * @param {string} version
         * Version to be found
         */
        setPacketID: function(packetID, version) {
            var selectPacket = de.loewe.sl2.action.software.update
                .select.packet;
            var newPacket = de.loewe.sl2.str.software.update.new.packet;
            var check = function () {
                if (SoftwareUpdate.checkPacket(version)) {
                    Utilities.print("#VERIFICATION PASSED: The packet satisfied"
                                    + " to version '" + version
                                    + "' is set successfully.");
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: The packet satisfied"
                                    + " to version '" + version
                                    + "' was not set.\n Currently selected "
                                    + "packet: " + newPacket.getValue());
                }
            }

            Structures.smoothListener(newPacket,
                                      check,
                                      1000,
                                      2000);
            selectPacket.call(packetID);
        },
        /**
         * Get IDs of images to be updated
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof SoftwareUpdate
         * @param {array} images
         * Images to be updated
         */
        getImageIDs: function(images) {
            var imgLists = de.loewe.sl2.vstr.software.update
                .software.images.list.getValue();
            var defaultSelectedImgs = de.loewe.sl2.vi32.software.update
                .software.selected.images.list.getValue();
            var numberOfImgs = de.loewe.sl2.i32.software.update
                .max.images.getValue();
            var IDs = [];
            // If only the newest SW version was searched,
            // only selected by default images should be updated
            if (ServiceMode.checkChassisOption("OldSwVersions", 0)) {
                Utilities.print("WARN: Only images selected by default will "
                                + "be updated.");
                images = "DNC";
            }
            if (images == "all") {
                // Return IDs for all images in the found packet
                var ID = 0;
                while (ID < numberOfImgs) {
                    IDs.push(ID++);
                }
            }
            else if (images == "DNC") {
                // Return IDs for images in the found packet selected
                // by default, usually images having a version newer than
                // the current one
                IDs = defaultSelectedImgs.reduce(function(acc, item, idx) {
                    if (item == 1) {
                        acc.push(idx);
                    }
                    return acc;
                }, []);
            }
            else {
                // Return IDs for images listed in the argument
                IDs = images.reduce(function(accOut, comp) {
                    var temp = imgLists.reduce(function(accIn, item, idx) {
                        if (item.indexOf(comp) != -1) {
                            accIn.push(idx);
                        }
                        return accIn;
                    }, []);
                    if (temp.length == 1) {
                        accOut.push(temp[0]);
                    }
                    else {
                        Utilities.print("#VERIFICATION FAILED: the '" + comp
                                        + "' image cannot be selected.\n"
                                        + "Available images: '"
                                        + String(imgLists) + "'.");
                    }
                    return accOut;
                }, []);
                if (IDs.length != images.length) {
                    IDs = [];
                }
            }
            Utilities.print("Next images will be installed:");
            IDs.forEach(function(ID) {
                Utilities.print("\t - " + imgLists[ID]);
            });
            return IDs;
        },
        /**
         * Perform search of the defined packet version
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof SoftwareUpdate
         * @param {function} exitFunc
         * Function will be called on success with true as its argument
         * @param {integer} source
         * Update source
         * @param {string} version
         * Version of the packet
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as its argument
         */
        packetSearch: function(exitFunc, source, version, failFunc) {
            var failFunc = failFunc || exitFunc;
            var timerID = 0;
            var searchState = de.loewe.sl2.i32.software.update.search.state;
            var startSearch = de.loewe.sl2.action.software.update.start.search;
            var is_searchOldVersion = ServiceMode.checkChassisOption(
                "OldSwVersions", 1);
            var newPacket = de.loewe.sl2.str.software.update.new.packet;
            // The API below should contain the progress of update search but
            // has never seen being changed.
            //
            // var searchProgress = de.loewe.sl2.i32.software.update
            //     .search.progress;

            // Pretty printing
            var statesPrint = [
                "Search started",
                "The packet images found",
                "No packet images found",
                "New packet found",
                "No new packet found",
                "Image searching",
                "Not enough storage space",
                "Search error"
            ];

            statesPrint[0xFFFF] = "Search cancelled";

            function printVersion() {
                if (version == "DNC") {
                    Utilities.print("The packet selected for update is '"
                                    + newPacket.getValue() + "'.");
                }
                else if (SoftwareUpdate.checkPacket(version)) {
                    Utilities.print("#VERIFICATION PASSED: The packet "
                                    + "selected for update satisfied to"
                                    + " the version '" + version + "'.");
                }
                else {
                    Utilities.print("#VERIFICATION FAILED: The packet "
                                    + "selected for update doesn't satisfy"
                                    + " to the version '" + version
                                    + "'.\n Currently selected "
                                    + "packet: " + newPacket.getValue());
                }
            }

            function proceed(state) {
                switch (state) {
                case 0: // Search started
                case 5: // Searching for the packet images
                    Utilities.print("Current state: " + statesPrint[state]);
                    break;
                case 1: // The packet images found
                    Utilities.print("#VERIFICATION PASSED: Current state: "
                                    + statesPrint[state]);
                    searchState.onChange.disconnect(delayedListener);
                    // Verify version of the currently selected packet for
                    // correct exit here as it's impossible to pass the
                    // correponding result from SoftwareUpdate.setPacketID()
                    if (version == "DNC" ||
                        SoftwareUpdate.checkPacket(version)) {
                        exitFunc(true);
                    }
                    else {
                        failFunc(false);
                    }
                    break;
                case 2: // The packet images not found
                case 4: // No new packet found
                    Utilities.print("#VERIFICATION FAILED: Current state: "
                                    + statesPrint[state]);
                    searchState.onChange.disconnect(delayedListener);
                    failFunc(false);
                    break;
                case 3: // The packet found
                    Utilities.print("#VERIFICATION PASSED: Current state: "
                                    + statesPrint[state]);
                    if (is_searchOldVersion) {
                        var packetID = SoftwareUpdate.getPacketID(version);
                        if (packetID == -1) {
                            searchState.onChange.disconnect(delayedListener);
                            failFunc(false);
                        }
                        else {
                            // Packet version will be verified by listener
                            // after the packet setup
                            SoftwareUpdate.setPacketID(packetID, version);
                        }
                    }
                    else {
                        printVersion();
                    }
                    break;
                case 6: // Not enough storage
                case 7: // Search error
                case 0xFFFF: // Search cancelled
                    Utilities.print("#ERROR: Current state: "
                                    + statesPrint[state]);
                    searchState.onChange.disconnect(delayedListener);
                    failFunc(false);
                    break;
                }
            }

            // Do not use Structures.delayedListener because of
            // self disconnection
            function delayedListener(state) {
                if (timerID) {
                    window.clearTimeout(timerID);
                }
                proceed(state);
            }

            searchState.onChange.connect(delayedListener);
            timerID = window.setTimeout(
                function() {
                    Utilities.print("#ERROR: The search state was not changed"
                                    + " during 5 minutes from the search "
                                    + "start.\nWARN: This time-out is not "
                                    + "verifified as sufficient. You can try"
                                    + " to increase it and restart the script."
                                   );
                    searchState.onChange.disconnect(delayedListener);
                    failFunc(false);
                },
                300000
            );

            Utilities.print("Start search...");
            startSearch.call(source);
        },
        /**
         * Perform software update
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof SoftwareUpdate
         * @param {function} exitFunc
         * Function will be called on success with true as its argument
         * @param {array} images
         * Images to be updated, could be a list of names,
         * e.g. ["BootD", "FEA"], or keywords "all" and "DNC" (alias for
         * Enumertors.DO_NOT_CHANGE)
         * @param {function} [failFunc=exitFunc]
         * Function will be called on failure with false as its argument
         */
        updateMonitor: function(exitFunc, images, failFunc) {
            var failFunc = failFunc || exitFunc;
            var updateState = de.loewe.sl2.i32.software.update.state;
            var startUpdate = de.loewe.sl2.action.software.update.start.update;
            var updateProgress = de.loewe.sl2.i32.software.update.progress;
            var updateRunning = de.loewe.sl2.i32.software.update.running;

            var testRes = true;
            var timerID = 0;

            // Pretty printing
            var statesPrint = [
                "Loading",
                "Programming",
                "Update finished"
            ];
            statesPrint[0xFFFF] = "Update error";

            function proceed(state) {
                switch (state) {
                case 0: // Update started (loading software)
                case 1: // Programming
                    Utilities.print("Current state: " + statesPrint[state]);
                    break;
                case 2: // Update finished
                    Utilities.print("#VERIFICATION PASSED: Current state: "
                                    + statesPrint[state]);
                    updateState.onChange.disconnect(proceed);
                    updateProgress.onChange.disconnect(printProgress);
                    exitFunc(true);
                    break;
                case 0xFFFF: // Update error
                    Utilities.print("#ERROR: Current state: "
                                    + statesPrint[state]);
                    updateState.onChange.disconnect(proceed);
                    updateProgress.onChange.disconnect(printProgress);
                    failFunc(false);
                    break;
                }
            }

            function printProgress(state) {
                Utilities.print("Update progress: " + state + "%");
                if (state == 100){
                    updateState.onChange.disconnect(proceed);
                    updateProgress.onChange.disconnect(printProgress);
                    exitFunc(true)
                }
            }
            function printImage(img) {
                Utilities.print("Updating '" + img + "'");
            }

            function waitForStart() {
                if (timerID) {
                    window.clearTimeout(timerID);
                }
                updateRunning.onChange.disconnect(waitForStart);
                Utilities.print("Current state: "
                                + statesPrint[updateState.getValue()]);
                updateState.onChange.connect(proceed);
                updateProgress.onChange.connect(printProgress);
            }

            var imgIDs = SoftwareUpdate.getImageIDs(images);
            if (imgIDs.length == 0) {
                Utilities.print("#VERIFICATION FAILED: Expected images cannot "
                                + "be selected for update.");
                failFunc(false);
            }
            else {
                updateRunning.onChange.connect(waitForStart);
                timerID = window.setTimeout(
                    function() {
                        var currentState = updateState.getValue();
                        Utilities.print("#ERROR: The update state was not "
                                        + "changed during a minute from its"
                                        + " start.");
                        updateRunning.onChange.disconnect(waitForStart);
                        failFunc(false);
                    },
                    3000
                );

                Utilities.print("Start update...");
                startUpdate.call(imgIDs);
            }
        }
    }
}
