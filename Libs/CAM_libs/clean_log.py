import sys
import os
libs = os.getenv('PYTHON_LIB_PATH_CIPLUS')
sys.path.append(libs)
import telnetClient as tC
if __name__ == '__main__':
    tC.parseCamLog()
    print ('Test result: TEST_PASSED')
