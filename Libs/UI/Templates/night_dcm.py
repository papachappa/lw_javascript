import sys
import os

libs = os.getenv('PYTHON_LIB_PATH')
sys.path.append(libs)
from enumerators import *
from night_dcm import Night_DCM
test = Night_DCM()


#TEST DATA

# scan settings - decription of action and verifications that has to be done 
# scan will be started. Scan with default settings will be executed, if nothing is defined.


scan_settings = []

#max duration of scan
scan_timout = 0


scan_result = [

    {NIGHT_DCM_SCAN_WIZARD.SCAN : [
        { 'check': 'Title:Station Search (DVB-T)'},
    ]},

    {NIGHT_DCM_SCAN_WIZARD.NEW_TV_SERVICES : [
        { 'check': 'itemsCount:9'},
    ]},

    {NIGHT_DCM_SCAN_WIZARD.NEW_RADIO_SERVICES : [
        { 'check': 'itemsCount:1'},
    ]},


]

#END OF TEST DATA

test.execute_scan(scan_settings, scan_timout, scan_result) 
