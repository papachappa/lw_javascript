/* ---------------------------------------------------------------------------- */ 
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* ---------------------------------------------------------------------------- */ 
/* HTR common: Remove Scheduler Commands
 * Script name: license_clear_scheduler.c
 * Preconditions:
 * - Command Scheduler should be initialised.
 * Description:
 * - This script removes all commands (events) from the Command
 *   Scheduler's persistent storage.
 */
#include <picoc_cit.h>

int main()
{
   unsigned int       eError = 0;

   printf("HTR common: Remove Scheduler Commands \n");

   /* Remove all scheduler commands */
   eError = cit_cmd_scheduler_CommandTableNew();
   if(eError != 0)
   {
      printf("Failed to remove commands from Command Scheduler, eError: %d \n", eError);
      return 0;
   }
   printf("Commands are removed from Command Scheduler \n");

    
   return 0;
}

main();
