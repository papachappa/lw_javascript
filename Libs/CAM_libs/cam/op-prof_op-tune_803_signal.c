/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


uint8 op_tune_1003[17] = {
0xF0,0x0F,
0x7F,0x0D,0x7F,0x01,0x00,0x01,0x00,0x08,0x00,0x00,0x02,0xD3,0x44,0x40,0x00 /* Unknow descriptor */
};

int main(void)
{
   uint32 eError;
   printf("[BOLD]OP op-prof_op-tune_803_signal Start \n");

   /* set delivery system descriptor loop - op_tune_1003 */

   cit_op_SetDeliveryDscrLoop(op_tune_1003);
     
   /* send unsolicited operator_status APDU */
   eError = cit_op_SendOperatorStatus();
   if(0 != eError)
   {
      printf("[BOLD]Send Operator Status eError: %d \n", eError); 
   }   

   printf("[BOLD]OP script done\n");
   return 0;
}

main();


