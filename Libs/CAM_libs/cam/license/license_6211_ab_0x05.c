/* ---------------------------------------------------------------------------- */ 
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* ---------------------------------------------------------------------------- */ 
/* HTR 6.2.1.1: Unattended Recording,
 *              Invalid Recording (0x05)
 * Script name: license_6211_ab_0x05.c
 * Preconditions:
 * - Check if a scheduled recording can be made on an encrypted service
 *   while the host is in standby. If not then the tests are not applicable.
 * - Successfully finished script: license_6211_ab_init.c
 * - Successfully finished script: license_6211_ab_check_ccv2.c
 * Description:
 * - This script sets record_start_status to 0x05 (Recording Mode error)
 *   to support tests HTR 6.2.1.1. a and b.
 */
#include <picoc_cit.h>

int main()
{
   unsigned int       eError = 0;

   printf("HTR 6.2.1.1.(a,b): Unattended Recording, Invalid Recording (0x05) \n");

   /* Configure the Record Start Status to Recording Mode error (0x05) */
   eError = cit_lic_WriteRecordConfig(0x05,
                                      0x00,
                                      0x00);
   if(eError != 0)
   {
      printf("Failed to write Record Start Status [0x05], eError: %d \n", eError);
      return 0;
   }

   /* Print configuration */
   cit_lic_PrintConfiguration();

    
   return 0;
}

main();
