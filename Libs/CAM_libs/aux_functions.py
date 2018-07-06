from math import floor
import time

from cipluscam import CiPlusCam


def checkConnect(timeout, quota_for_attempts=3):
    # Give some time for system stabilization
    sleep_time = min(5, timeout)
    time.sleep(sleep_time)

    print('Attempt to connect to CAM...')
    cam = CiPlusCam()

    connected = False
    start_time = time.time()
    def should_we_try():
        time_cond = floor(time.time() - start_time) <= timeout
        attempts_cond = quota_for_attempts > 0
        return (not connected) and time_cond and attempts_cond

    while should_we_try():
        try:
            cam.connect(timeout)
        except Exception as e:
            print('WARN: Connection was not established. Reason: ', e)
            quota_for_attempts -= 1
            cam.reset()
            print('Waiting {}s before give another try'.format(sleep_time))
            time.sleep(sleep_time)
        else:
            connected = True

    if connected:
        print('#Connection is established.')
        print('Disconnecting from CAM...')
        cam.disconnect()
    else:
        print('#Connection is not established')

    return connected
