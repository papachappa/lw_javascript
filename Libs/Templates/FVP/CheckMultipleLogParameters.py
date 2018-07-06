import sys
import os


libs = os.getenv('PYTHON_LIB_PATH_FVP')
sys.path.append(libs)

from for_fvp import ControllerFreeViewPlayClient

# Alter only this params dictionary. You can set as many parameters as you want to check.
# Do not quote dict values: integers, booleans.
# Examples in which you MUST NOT quote the values:
# 'counter': 1, 'is_from_config': True
# BUT quote 'remote_address': '192.168.50.83', 'request_time': '2018-02-08 10:27:10.980413', "HTTP_X_AUTH_TIMESTAMP": "1518083270"

params = {'counter': 1, 'expire_time': '2018-02-10 09:47:50.303700', 'is_from_config': True}

# DO NOT change anything below this line
command = dict(command='check_decrypted_log', params=params)
test = ControllerFreeViewPlayClient()
test.execute_test(command)
