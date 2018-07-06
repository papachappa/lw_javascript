/* ---------------------------------------------------------------------------- */ 
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* ---------------------------------------------------------------------------- */ 
/* HTR common: Initialise the license default persistent settings
 * Script name: license_default_persistent_settings.c
 * Preconditions:
 * - 
 * Description:
 * - This script initialises default nvram values for license module.
 */
#include <picoc_cit.h>

int main()
{
   unsigned int       eError = 0;

   printf("HTR common: Initialise the license default persistent settings \n");

   /* Initialise the test system's persistent settings */
   eError = cit_lic_InitialiseNvram();
   if(eError != 0)
   {
      printf("Failed to initialise persistent settings, eError: %d \n", eError);
      return 0;
   }
   eError = cit_cmd_scheduler_CommandTableNew();
   if(eError != 0)
   {
      printf("Failed to initialise Command Scheduler, eError: %d \n", eError);
   }
   printf("Persistent settings are initialised \n");
   
   /* Enable logging */
   eError = cit_lic_WriteModuleConfig(0x01, 0x00);
   if(eError != 0)
   {
      printf("Failed to enable logging, eError: %d \n", eError);
      return 0;
   }
   printf("Logs are enabled \n");
   
   /* Print configuration */
   cit_lic_PrintConfiguration();

    
   return 0;
}

main();
