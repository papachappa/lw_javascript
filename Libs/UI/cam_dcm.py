import time
from scan import Scan

from aux_functions import println, send_key, send_key_with_verification,\
                          select_on_screen, wait_for, get_status, \
                          check_all_wizard_closed

from enumerators import MAIN_MENU, SYSTEM_SETTINGS_MENU, EXTRAS_MENU, \
                        INITIAL_SCAN_WIZARD, NETWORK_CONFIGURATION,\
                        START_SCAN, FRONTEND, CAM_SCAN_WIZARD, DCM_OPTIONS


class CAM_Scan(Scan):

    def _print_test_decription(self):
        println("Test description:\n"
            "1. Go to intial state (Dashboard is opened, focus is on main menu).\n"
            "Test will be terminated if one of wizards is open.\n"
            "2. Start Cam emulator and initialize connect by TV\n"
            "3. Scan request should be displayed.\n"
            "4. Select immediately to execute operator profile scan.\n"
            "3. Go through scan wizard according to test scenario.\n"
            "Test will be terminated if one of required verification is failed.\n"
            "4. Start scan and wait end of scan (10 min timout is set).\n"
            "6. Close of wizard.\n")


    def _reset_to_initial_state(self):
        println("Start cam_dcm initial state")
        return True


    def  _open_scan_wizard(self):
        println("\nWait for CAM scan request.")
        result, status = wait_for("Immediately", 2, 2)
        print(FRONTEND.SEARCH_CAM_SCREEN)
        if result:
            selected, status = select_on_screen(DCM_OPTIONS, "Immediately")
            if selected:
                send_key("OK")
                return True
        else:
            print("DEBUG: Open Scan Wizard Failed")
            return False


    def _close_scan_wizard(self):
        """ Close initial scan wizard in fastest way.
        Intial scan wizard can be closed in different way:
        1. Cancel scan
        2. Close wizard from scan result screen
        3. Close wizard from network configuration screen
        4. Close wizard from software update screen
        If current screen is not a screen where wizard can be closed, then >>
        will be pressed.
        Reset_to_initial_state() will be called if wizard is not closed from firts attempt,
        if wizard id cycled, if tV doesn't react on key pressing.

            
        Returns: True if wizard is closed/ False otherwise
        """
        forward = True
        println("\nClose cam scan wizard")
        initial_status = get_status()
        while forward:
            current_status = get_status()
            if CAM_SCAN_WIZARD.SCAN_RESULT in current_status:
                time.sleep(2)
                send_key("EXIT")
                time.sleep(2)
                send_key("EXIT")
                time.sleep(2)
                forward = False
            elif CAM_SCAN_WIZARD.STATIONS_SORTING in current_status:
                result, status = wait_for(CAM_SCAN_WIZARD.SCAN_RESULT, 30, 5)
                if result:
                    time.sleep(2)
                    send_key("EXIT")
                    time.sleep(2)
                    send_key("EXIT")
                    time.sleep(2)
                    forward = False
                else:
                    println("VERIFICATION FAILED: Scan is not finished during 30sec.")
                    return False
            else:
                if not send_key_with_verification('FWD'):
                    println("#ERROR: TV doesn't react on key >>.")
                    forward = False
                elif get_status() == initial_status:
                    println("#ERROR: UI is cycled.")
                    forward = False

        result = check_all_wizard_closed()
        println("DEBUG: RESULT IS {}".format(result))
        if not result:
            println("#VERIFICATION FAILED: wizard is not closed")
            return False
        else:
            return True

    def _start_scan(self, timeout=180):
        """ Start and execute scan
        1. Go throught initial scan wizard without verification till screen
        where "Start scan" is possible.
        2. Start scan
        3. Verifay that scan is started.
        4. Wait during timeout that scan is finnished.

        Args:
            timeout -- timeout of scan result waiting in sec
            
        Returns: True scan is executed, False is scan is not executed as expectd by
        any reason
        """
        self._go_through_wizard(CAM_SCAN_WIZARD.LNB_FREQ)
        send_key("FWD")

        println("Wait for scan result screen.")
        result, status = wait_for(CAM_SCAN_WIZARD.SCAN_RESULT, timeout, 5)
        if result:
            println("VERIFICATION PASSED: Scan is executed.")
            return result and True
        else:
            println(("VERIFICATION FAILED: Scan is not finished during {} "
                     "sec.\n \t - UI sate is {}").format(timeout, status))
            return result and False
        
        
