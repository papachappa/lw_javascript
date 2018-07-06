/* ---------------------------------------------------------------------------- 
 * Copyright Digital TV Labs 2012 - 2013 
 * ---------------------------------------------------------------------------- 
 * HTR 6.2.5: Change of CICAM_ID
 * Script name: license_625_cicamid_2.c
 * Preconditions:
 * 
 * Description:
 * - This script change CICAM_ID to CICAM_ID-2
 */
#include <picoc_cit.h>

int main()
{
   unsigned int       eError = 0;

   printf("HTR 6.2.5.: Change of CICAM_ID \n");

   /* Change CICAM_ID to CICAM_ID-2 */
   eError = cit_SetCicamID(2);
   if(eError != 0)
   {
      printf("Failed to change CICAM_ID, eError: %d \n", eError);
      return 0;
   }

   printf("CICAM_ID is changed to CICAM_ID-2 \n");
   
   eError = cit_SetHProfileFspValid(0x0);
   if (eError != 0)
   {
   		printf("Fail to erase Host Profile Valid byte in MFS \n");
   }

   printf("Please reboot CAM for changes to take effect.\n");
   return 0;
}

main();
