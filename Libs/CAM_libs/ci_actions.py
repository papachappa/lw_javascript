from os import path as os_path
from os import walk as os_walk
import inspect
from socket import timeout as socket_timeout
from cipluscam import CiPlusCam

def ci_connect(uri=None, timeout=5):
    if uri == None:
        cam = CiPlusCam()
    else:
        cam = CiPlusCam(uri)
    print ('Connecting to CAM...')
    try:
        cam.connect(timeout)
        return cam
    except socket_timeout as e:
        print("WARN: Connecting is timed out")
        raise

def ci_disconnect(cam):
    print ('Disconnecting...')
    try:
        cam.disconnect()
        print ('CAM is disconnected successfully.')
        return True
    except IOError as e:
        print("WARN:", e)
        return False


def ci_cmd_exec(cam, baseName, expectedStrings, unexpectedStrings=None):
    print('Executing %s script...' %baseName)
    scriptRoot = os_path.realpath(os_path.dirname(
        inspect.getfile(inspect.currentframe())))
    scriptPath = [os_path.join(dp, f) for dp, dn, filenames in
                  os_walk(scriptRoot) for f in filenames
                  if os_path.splitext(f)[0] == baseName][0]
    try:
        result = cam.launchScript(scriptPath).replace('\0', '')
    except Exception as e:
        print('#ERROR: Script was not executed. Reason: ', e)
        return False
    print('CAM response:')
    print('---------------')
    print(result)
    print('---------------')
    testResult = cam.checkResponse(result, expectedStrings, unexpectedStrings)
    return testResult
