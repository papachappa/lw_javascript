from scan import Scan
from aux_functions import println 


class Night_DCM(Scan):

    def _print_test_decription(self):
        println("Test description:\n"
            "1. Set TV into stand-by mode.\n"
            "2. Wait for automatic channel update in stand-by mode.\n"
            "3. Wait for TV waking up"
            "4. Verify new found TV and Radio services according to test scenario.\n"
            "6. Close of wizard.\n")


    def _reset_to_initial_state(self):
        return True


    def  _open_scan_wizard(self):
        return True


    def _start_scan(self, timeout=180):
        return True
