import sys
import os
libs = os.getenv('PYTHON_LIB_PATH')
sys.path.append(libs)
from enumerators import *
from initial_scan import execute_initial_scan





#TEST DATA

# scan settings - decription of action and verifications that has to be done 
# scan will be started. Scan with default settings will be executed, if nothing is defined.

scan_settings = [
    {INITIAL_SCAN_WIZARD.LOCATION : [
        { 'check': "Germany"}, 
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

#END OF TEST DATA




#Test scenario
execute_initial_scan(scan_settings, scan_timout, scan_result) 
