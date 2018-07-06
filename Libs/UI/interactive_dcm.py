from scan import Scan
from aux_functions import println, send_key, select_on_screen, wait_for
from enumerators import INTERACTIVE_DCM_SCAN_WIZARD, DCM_OPTIONS


class Interactive_DCM(Scan):

    def _print_test_decription(self):
        println("Test description:\n"
            "1. Go to intial state (Dashboard is opened, focus is on main menu).\n"
            "Test will be terminated if one of wizards is open.\n"
            "2. Wait for Interactive DCM request\n"
            "3. DCM request should be displayed.\n"
            "4. Select immediately to execute scan.\n"
            "3. Go through scan wizard according to test scenario.\n"
            "Test will be terminated if one of required verification is failed.\n"
            "4. Start scan and wait end of scan (5 min timout is set).\n"
            "6. Close of wizard.\n")


    def _reset_to_initial_state(self):
        println("Start interactive_dcm initial state")
        return True


    def  _open_scan_wizard(self):
        println("\nWait for Interactive DCM request.")
        result, status = wait_for("Immediately", 2, 2)
        if result:
            selected, status = select_on_screen(DCM_OPTIONS, "Immediately")
            if selected:
                send_key("OK")
                return True
        else:
            print("DEBUG: Open Scan Wizard Failed")
            return False



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
        result, status = wait_for(INTERACTIVE_DCM_SCAN_WIZARD.SCAN, 5, 1)
        if result:
            println("VERIFICATION PASSED: Scan is in progress.")

        else:
            println("VERIFICATION FAILED: Scan is not started in 5 seconds.")
            return False

        println("Wait for scan result screen.")

        result, status = wait_for(INTERACTIVE_DCM_SCAN_WIZARD.SCAN_RESULT, timeout, 5)
        if result:
            println("VERIFICATION PASSED: Scan is executed.")
            return result and True
        else:
            println(("VERIFICATION FAILED: Scan is not finished during {} "
                     "sec.\n \t - UI sate is {}").format(timeout, status))
            return result and False
        
        
