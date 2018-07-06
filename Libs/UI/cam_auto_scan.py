def start_cam_auto_scan():
    statys, result = wait_for('Immediately', 10, 1)

    if result:
        println('VERIFICATION PASSED: CAM scan is requested.')
    else:
        println('TEST_FAILED')
        raise Exception('CAM scan is not requested')

    send_key('TI-KEY-EVENT-OK')
        

    path_to_wizard = ["DVB-S", "LNB frequencies"]
    for item in path_to_wizard:
        result = False
        for i in range(10):
            statys, result = wait_for(item, 1, 1)
            if result:
                println("Expected screen is displayed.")
                break
            else:
                send_key('FWD')
        if not result:
            raise Exception('Expected screen is not found')
        
    send_key('FWD')
    
    
