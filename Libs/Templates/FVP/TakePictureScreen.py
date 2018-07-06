import subprocess, datetime, sys, os
from os.path import expanduser

file_name = os.path.splitext(os.path.basename(sys.argv[0]))[0]
cur_time = datetime.datetime.now()

path_file = expanduser("~")+"/Pictures/"+"MDS_921_"+file_name+"_"+cur_time.strftime("%d_%m_%Y_%H_%M")+".jpg"

subprocess.run(["fswebcam", "-r", "1920x1080", "-S", "8", "--jpeg", "100", path_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

try:
	file = open(path_file, "r")
except:
    print("#VERIFICATION FAILED: Could not open the file, verify path to file or web cam.")
else:
    print("#VERIFICATION PASSED: The file is created successfully.")
    print("Test result: TEST_PASSED")
