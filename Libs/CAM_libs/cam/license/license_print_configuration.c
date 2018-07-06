/* ---------------------------------------------------------------------------- */ 
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* ---------------------------------------------------------------------------- */ 
/* HTR common: Print configuration
 * Script name: license_print_configuration.c
 * Preconditions:
 * - Peristant memory should be initialised.
 * Description:
 * - This script prints configuration.
 */
#include <picoc_cit.h>

int main()
{
   unsigned int       eError = 0;

   printf("HTR common: Print configuration \n");

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
