import sys
import os


libs = os.getenv('PYTHON_LIB_PATH_FVP')
sys.path.append(libs)

"""
Set negate_msg_flag as True if string from "message" is expected to be absent in required "column"
Set negate_msg_flag as False if string from "message" is expected to be found in required "column"
By default negate_msg_flag as False
"""

from for_fvp import ControllerFreeViewPlayClient
command = dict(command='check_message_box_results', column='request_url', message='http://metadata.fvcmd.test/MDS_921/applications?nids%5B%5D=12292', negate_msg_flag=False)
test = ControllerFreeViewPlayClient()
test.execute_test(command)

