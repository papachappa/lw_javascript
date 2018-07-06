import sys
import os
libs = os.getenv('PYTHON_LIB_PATH')
sys.path.append(libs)
from enumerators import *
from auto_scan import Auto_Scan
test = Auto_Scan()
#TEST DATA ------------



#scan settings
scan_settings = [
    {INITIAL_SCAN_WIZARD.LOCATION : [
        { 'select': (INITIAL_SCAN_WIZARD_LOCATIONS, '(D) Germany')},
        { 'press': ["OK"]},
    ]},
    {INITIAL_SCAN_WIZARD.DVBC_NETWORKS : [
        { 'select': (NETWORKS_GERMANY_DVBC, 'Unitymedia')},
        { 'press': ["OK"]},
        { 'check': INITIAL_SCAN_WIZARD.START_SCAN},
    ]}
]

#max duration of scan
scan_timout = 180

#post scan settings
scan_result = [
    {INITIAL_SCAN_WIZARD.AGE_LOCK : [
        { 'select': (AGE_LOCK, 'No age-related lock')},
        { 'press': ["OK"]}
    ]}
]




#TEST SCENARIO ----------
test.execute_scan(scan_settings, scan_timout, scan_result) 
