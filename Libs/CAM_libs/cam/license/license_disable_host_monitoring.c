/* ---------------------------------------------------------------------------- */ 
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* ---------------------------------------------------------------------------- */ 
/* HTR common: Sets the persistent setting to disable monitoring of the host activity
 * Script name: license_enable_host_monitoring.c
 * Preconditions:
 * - 
 * Description:
 * - This script writes in the NVRAM that monitoring of the host activity is disabled. 
 * - Note that CAM needs to be reinitialised to settings take effect.
 */
#include <picoc_cit.h>

int main()
{
   unsigned int   eError = 0;
   uint8          u8Module = CIT_HR_REGISTER_NONE;

   printf("Disabling License Activity Monitoring \n");

   /* Initialise the host monitoring persistent settings */
   eError = cit_nvram_Write(&u8Module, CIT_NVRAM_OFFSET_HR_REGISTER, sizeof(uint8));
   if(eError != 0)
   {
      printf("Failed to initialise the host monitoring persistent settings, eError: %d \n", eError);
      return 0;
   }
   printf("License Activity Monitoring Disabled \n");
   printf(" Please reset the CAM now \n");

    
   return 0;
}

main();
