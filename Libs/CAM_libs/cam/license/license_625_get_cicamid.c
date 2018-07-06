/* ---------------------------------------------------------------------------- */ 
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>

int main()
{
   unsigned int       eError = 0;
   char cicam_id[11];

   printf("HTR 6.2.5.: Retrieve current CICAM ID \n");

   /* Change CICAM_ID to CICAM_ID-2 */
   eError = cit_GetCicamID(cicam_id);
   if(eError != 0)
   {
      printf("Failed to change CICAM_ID, eError: %d \n", eError);
      return 0;
   }
   cicam_id[10]='\0';

   printf("CICAM_ID is %s \n", cicam_id);

    
   return 0;
}

main();