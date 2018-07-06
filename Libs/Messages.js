include('Utilities.js');
include('Structures.js');

init = function() {
/** @namespace
* Messages
*/
Messages = {
/**
 * Check if a message is active.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Messages
 * @param {number} message ID
 * @returns {boolean} flag
 */
isActive: function (messageID) {
    var activeMessage = de.loewe.sl2.messages.messageid;
    return activeMessage.getValue() == messageID;
},
/**
 * Confirm messages with parameter specified and
 * call exit function with returned value
 * of a called action as an argument,
 * or "null" value if call was not performed
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Messages
 * @param {function} exitFunc
 * Function will be called on success
 * @param {Array} input
 * input[0] is ID of the message to be handle,
 * input[1] is ID of buton will be pressed
 * input[2] is text will be inserted in first text field,
 * input[3] is text will be inserted in second text field.
 * Two last elements are optional
 * @param {function} [failFunc=exitFunc]
 * Function will be called on failure
 * @param {function} [errorFunc=Utilities.endTest]
 * Function will be called if confirmMessage() cannot
 * be executed
 * @example
 * // Enter user "Horst" and password "12345"
 * and confirm message with ID 234848 by "OK" button
 * Messages.confirmMessage(onExit, [234848, 0, "Horst", "12345"])
 * // Confirm live DCM message by "Later" button
 * Messages.confirmMessage(onExit,
 * [Message.DCM_LIVE, Button.DCM_LATER])
 * @requires Library: {@link Utilities}
 * @requires Library: {@link Structures}
 */
confirmMessage: function (exitFunc, input, failFunc, errorFunc) {
    // Create object for action
    var confirmMsg = Structures.createSimpleSetting(
        ["Message confirmation"],
        [de.loewe.sl2.messages.action.confirm],
        [null]
    )[0];
    var failFunc = failFunc || exitFunc;
    var errorFunc = errorFunc || Utilities.endTest;
    // List of available controls for the current message
    var selectors = de.loewe.sl2.messages.selectors;
    // If expected selector is available
    if (selectors.getValue().indexOf(input[1]) != -1) {
        // Connect to action call result
        Structures.watchValue( confirmMsg,
                               function(newValue, obj) {
                                   Structures.unwatchValue(obj);
            // First action ID is "1"
            // "-1" is error returned by API (possibly)
                                   if (newValue < 1) {
                                       failFunc(newValue);
                                   }
                                   else {
                                       exitFunc(newValue);
                                   }
                               }
                             );
        // Call action and save returned call id
        Utilities.print('Confirm message (id = ' + input[0] + ") by"
                        + ' selector id = ' + input[1] + ".");
        confirmMsg.operatingValue = confirmMsg.api.call(input).id;
    }
    else {
        Utilities.print("#ERROR: This selector "
                        + input[1] + " is not available for"
                        + " message #" + input[0]);
        errorFunc();
    }
},

/**
 * Close all active messages until specified one
 * is active
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof Messages
 * @param {function} exitFunc
 * Function will be called on success
 * @param {Number} messageID
 * Message expected to be active
 * If all messages should be closed
 * specify Message.NO_MESSAGE
 * @param {function} [failFunc=exitFunc]
 * Function will be called on failure
 * @param {function} [errorFunc=Utilities.endTest]
 * Function will be called if closeMessages() cannot be
 * executed
 * @example
 * // Close all messages but live DCM one
 * Messages.closeMessages(onExit, Message.DCM_LIVE)
 * // Close all messages
 * Messages.closeMessages(onExit, Message.NO_MESSAGE)
 * @requires Library: {@link Utilities}
 * @requires Library: {@link Structures}
 */
closeMessages: function (exitFunc, messageIDs, failFunc, errorFunc) {
    // For compatibility with former use
    if (typeof(messageIDs) == 'number') {
        var messageIDs = [messageIDs];
    }
    var activeMessage = de.loewe.sl2.messages.messageid;
    // Selectors closing OSD: [ Escape, Close, Cancel ]
    // sorted by priority
    var closingSelectors = [6, 13, 1];
    var timerID = 0;
    var failFunc = failFunc || exitFunc;
    var errorFunc = errorFunc || failFunc;
    var verboseErrorFunc = function() {
        var messageID = activeMessage.getValue();
        Utilities.print("#ERROR: Current OSD '"
                        + Utilities.getKey(Message, messageID)
                        + "' cannot be closed.");
        errorFunc();
    }

    function listener(exitFunc, messageIDs, errorFunc) {
        // If expected message is active
        if ( messageIDs.indexOf(activeMessage.getValue()) != -1 ) {
            activeMessage.onChange.disconnect(smoothListener);
            exitFunc(true);
        }
        // If all messages are closed, but some was expected
        else if (Messages.isActive(0)) {
            activeMessage.onChange.disconnect(smoothListener);
            failFunc(false);
        }
        else {
            var availableSelectors = de.loewe.sl2
                .messages.selectors.getValue();
            var availableClosingSelectors =
                closingSelectors.filter(
                    function (item) {
                        return availableSelectors
                            .indexOf(item) != -1;
                    }
                );
            if (availableClosingSelectors.length == 0) {
                activeMessage.onChange.disconnect(smoothListener);
                errorFunc();
            }
            else {
                Utilities.print("Message #" + activeMessage.getValue() + " is displayed.");
                Messages.confirmMessage(
                    function() {},
                    // Close current message by selector
                    // with highest priority
                    [ activeMessage.getValue(),
                      availableClosingSelectors[0]
                    ],
                    errorFunc,
                    errorFunc
                );
            }
        }
    }

    function smoothListener() {
        if (timerID) {
            window.clearTimeout(timerID);
        }
        timerID = window.setTimeout(
            function () {
                listener(exitFunc, messageIDs, verboseErrorFunc);
                timerID = 0;
            },
            5000);
    }
    activeMessage.onChange.connect(smoothListener);
    timerID = window.setTimeout(listener,
                                5000,
                                exitFunc,
                                messageIDs,
                                verboseErrorFunc);
}
}
}
