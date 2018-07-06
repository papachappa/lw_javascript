include('Utilities.js');
init = function() {

/** @namespace 
 * Press button
*/
PressButton = {

/**
 * Single press RC button.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof PressButton
 * @param {number} press ID
*/
singlePress: function (keyID){                
    //~ Utilities.print("WORKAROUND: Press Mute to wake up UI is it gone...");
    //~ PressButton.press("11");
    //~ setTimeout(function(){
		//~ Utilities.print("Wait for 1 second...");		
		Utilities.print("Press button with id " + keyID +"...");
		PressButton.press(keyID)		
	//~ }, 1000);
   
},

/**
 * Single press RC button with timeout before exit function.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof PressButton
 * @param {number} keyID
 * Button to be pressed
 * @param {number} delay
 * Delay after button press in seconds
 * @param {function} exitFunc
 * Function to be called after delay
*/
pressWithDelay: function (keyID, delay, exitFunc){   
	//~ Utilities.print("WORKAROUND: Press Mute to wake up UI is it gone...");
    //~ PressButton.press("11");
    //~ setTimeout(function(){
		//~ Utilities.print("Wait for 1 second...");		
		Utilities.print("Press button with id " + keyID +"...");
		PressButton.press(keyID)
		Utilities.print("Wait for " + delay +"sec...")
		setTimeout(exitFunc, delay*1000);		
	//~ }, 1000);
    
},

/**
 * press RC button.
 * @author Artem Rogudeev arogudeev@luxoft.com
 * @press with delay (wait function) but without exitFunction.
 * @Means that can not be used in EPG verification
*/
pressWithWait: function (keyID, ms){
		PressButton.singlePress(keyID)  
        PressButton.wait(ms)
},

wait: function (ms){
        var start = new Date().getTime();
        var end = start;
        while(end < start + ms) {
			end = new Date().getTime();
        }
},

/**
 * press RC button.
 * @author Anna Klimovskaya aklimovskaya@luxoft.com
 * @memberof PressButton
 * @param {number} press ID
*/
press: function (keyID){   

    var pressKey=de.loewe.sl2.system.action.key; 
                
    pressKey.call([keyID,0,0x00000003,0,1]);
    pressKey.call([keyID,0,0x00000000,1,1]);
    pressKey.call([keyID,0,0x00000008,2,1]);         
},

}
}
