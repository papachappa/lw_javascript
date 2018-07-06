include('Utilities.js');
include('Structures.js');

init = function() {
    /** @namespace
     * Language
     */
    Languages = {
        /**
         * Set language preferences
         * @author Anna Klimovskaya aklimovskaya@luxoft.com
         * @memberof Language
         * @param {function} exitFunc
         * Function will be called on success
         * @param {object} settings
         * Language settings
         * @param {function} [failFunc=exitFunc]
         * Function will be called on fail
         * @requires Library: {@link Utilities},{@link Structures}
         */
        setDVBlangs: function(exitFunc, settings, failFunc) {
            var failFunc = failFunc || exitFunc;
            var testResult = true;
            var settingNames = [ "languageSubtitleFavoured",
                                 "languageSubtitleAlternative",
                                 "languageAudioFavoured",
                                 "languageAudioAlternative" ];
            var settingDescs = {
                languageSubtitleFavoured: "favoured language of subtitles",
                languageSubtitleAlternative: "alternative language of "
                    + "subtitles",
                languageAudioFavoured: "favoured language of audio",
                languageAudioAlternative: "alternative language of audio"
            };
            var APIs = {
                languageSubtitleFavoured: [
                    de.loewe.sl2.i32.language.subtitle.favoured.index,
                    de.loewe.sl2.i32.language.subtitle.favoured,
                    de.loewe.sl2.vint32.language.subtitle.favoured
                ],
                languageSubtitleAlternative: [
                    de.loewe.sl2.i32.language.subtitle.alternative.index,
                    de.loewe.sl2.i32.language.subtitle.alternative,
                    de.loewe.sl2.vint32.language.subtitle.alternative
                ],
                languageAudioFavoured: [
                    de.loewe.sl2.i32.language.audio.favoured.index,
                    de.loewe.sl2.i32.language.audio.favoured,
                    de.loewe.sl2.vint32.language.audio.favoured
                ],
                languageAudioAlternative: [
                    de.loewe.sl2.i32.language.audio.alternative.index,
                    de.loewe.sl2.i32.language.audio.alternative,
                    de.loewe.sl2.vint32.language.audio.alternative
                ]
            };

            function setOneSetting(obj, name, exitFn) {
                var currentLang = APIs[name][1].getValue();
                var allLangs = APIs[name][2].getValue();
                var operValueDefined = (["undefined", "DNC"].indexOf(
                    String(obj.operatingValue)) == -1);
                var initValueDefined = (["undefined", "DNC"].indexOf(
                    String(obj.initialValue)) == -1);

                function setLangId(lang) {
                    // Find the expected language in the list of
                    // all available ones
                    var nameID = allLangs.indexOf(lang);
                    if (nameID == -1) {
                        Utilities.print(
                            "#VERIFICATION FAILED: Expected value of "
                                + settingDescs[name] + " is not available.");
                        testResult = false;
                    }
                    else {
                        // Set the language ID defined
                        var languageObj = {
                            description: "ID of the '"
                                + Utilities.getKey(Language, lang)
                                + "' language in the list",
                            api: APIs[name][0],
                            operatingValue: nameID
                        };
                        Structures.setSmoothCheck(
                            function() {
                                Utilities.print("#VERIFICATION PASSED: "
                                                + "Language index was set "
                                                + "successfully.");
                                exitFn();
                            },
                            languageObj, languageObj.operatingValue,
                            function() {
                                Utilities.print("#VERIFICATION FAILED: "
                                                + "Language index was not "
                                                + "set correctly.");
                                testResult = false;
                                exitFn();
                            });
                    }
                }

                // All logic below is inherited from Scan.getSetCheck()

                // Logging
                if (initValueDefined) {
                    if (obj.initialValue === currentLang) {
                        Utilities.print(
                            "#VERIFICATION PASSED: initial value of "
                                + settingDescs[name]
                                + " is equal to expected '"
                                + Utilities.getKey(Language, currentLang)
                                + "'.");
                    }
                    else {
                        Utilities.print(
                            "#VERIFICATION FAILED: initial value of "
                                + settingDescs[name] + " is '"
                                + Utilities.getKey(Language, currentLang)
                                + "' that is different from expected '"
                                + Utilities.getKey(Language, obj.initialValue)
                                + "'.");
                        testResult = false;
                    }
                }

                //Setting
                if (operValueDefined) {
                    Utilities.print("Set " + settingDescs[name] + " to '"
                                    + Utilities.getKey(Language, 
                                                        obj.operatingValue)
                                    + "'...");

                    setLangId(obj.operatingValue);
                }
                else if (initValueDefined &&
                         obj.initialValue != currentLang) {
                    Utilities.print("Set " + settingDescs[name]
                                    + " to the expected initial value '"
                                    + Utilities.getKey(Language, 
                                                        obj.initialValue)
                                    + "'...");
                    setLangId(obj.initialValue);
                }
                else {
                    // Quit if no setup is expected
                    exitFn();
                }
            }

            function incrementSetup(namesList) {
                if (namesList.length > 0) {
                    if (settings.hasOwnProperty(namesList[0])) {
                        setOneSetting(settings[namesList[0]], namesList[0],
                                  function() {
                                      incrementSetup(namesList.slice(1));});
                    }
                    else {
                        incrementSetup(namesList.slice(1));
                    }
                }
                else if (testResult) {
                    exitFunc(true);
                }
                else {
                    failFunc(false);
                }
            }
            incrementSetup(settingNames);
        }
    }
}
