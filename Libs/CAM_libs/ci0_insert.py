import sys, errno
from loshell import loshell
#import argparse
from aux_functions import checkConnect
import os
tv_ip = os.getenv('TV_IP')

if __name__ == '__main__':
    #input_parser = argparse.ArgumentParser()
    #input_parser.add_argument("TV_IP",
    #                          help="TV set IP")
    #args = input_parser.parse_args()

    try:
        cmdResult = loshell(tv_ip, 'ciinsert 0')
    except Exception as e:
        print ("#ERROR:", e)
        print ('Test result: TEST_FAILED')
        sys.exit(errno.ECONNREFUSED)

    if cmdResult:
        print('#VERIFICATION PASSED: Command to insert CAM is sent successfully.')
    else:
        print('#VERIFICATION FAILED: There is no successful response'
              ' from TV.')
              
    CAMstart = checkConnect(180)
    if CAMstart:
        print('#VERIFICATION PASSED: CI module available.')
        print('Test result: TEST_PASSED')
    else:
        print('#VERIFICATION FAILED: CI module was not started during 3 min.')
        print('Test result: TEST_FAILED')
        
