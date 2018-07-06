import sys
import os
libs = os.getenv('PYTHON_LIB_PATH_CIPLUS')
sys.path.append(libs)

import ci_actions as ci

if __name__ == '__main__':
    """ Executes connection to CAM module, sends "cit_factory_reset"
    script to it, analyzes response to the sent script and disconnects
    from CAM after this
    """
    try:
        cam = ci.ci_connect()
    except Exception as e:
        print('WARN: Connection to cam is failed.')
        try:
            cam = ci.ci_connect()
        except Exception as e:
            print('#ERROR: Connection to cam is failed.')
            print('Test result: TEST_FAILED')
            sys.exit(1)

    if ci.ci_cmd_exec(cam, 'cit_factory_reset', ['Factory RESET'], ['[Err]']):
        print('Test result: TEST_PASSED')
    else:
        if ci.ci_cmd_exec(cam, 'cit_factory_reset', ['Factory RESET'], ['[Err]']):
            print('Test result: TEST_PASSED')
        else:
            print('Test result: TEST_FAILED')

    ci.ci_disconnect(cam)
