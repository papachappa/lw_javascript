/* ---------------------------------------------------------------------------- */ 
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* ---------------------------------------------------------------------------- */ 
/* HTR 6.2.1.2: Watch and Buffer Recording,
 *              Invalid Recording (0x04)
 * Script name: license_6212_h_0x04.c
 * Preconditions:
 * - Check if a scheduled recording can be made on an encrypted service
 *   while the host is in standby. If not then the tests are not applicable.
 * - Successfully finished script: license_6212_f_init.c
 * - Successfully finished script: license_6212_f_check_ccv2.c
 * Description:
 * - This script sets record_start_status to 0x04 (CICAM Busy)
 *   to support tests HTR 6.2.1.2. (Invalid Recording)
 */
#include <picoc_cit.h>

int main()
{
   unsigned int       eError = 0;

   printf("HTR 6.2.1.2.: Watch and Buffer Recording, Invalid Recording (0x04) \n");

   /* Configure the Record Start Status to CICAM Busy (0x04) */
   eError = cit_lic_WriteRecordConfig(0x04,
                                      0x00,
                                      0x00);
   if(eError != 0)
   {
      printf("Failed to write Record Start Status [0x04], eError: %d \n", eError);
      return 0;
   }

   /* Print configuration */
   cit_lic_PrintConfiguration();

    
   return 0;
}

main();
