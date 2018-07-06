/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


uint8 op_tune_1005_S2[18] = {
0xF0,0x10,
0x43,0x0b,0x01,0x14,0x50,0x00,0x01,0x92,0x86,0x02,0x20,0x00,0x02,
0x79,0x01,0x1f /* Func_main DVB-S2 */
};

int main(void)
{   
   uint32 eError;
   printf("[BOLD]OP op-prof_op-tune_805_signal_S2 Start \n");

   /* set delivery system descriptor loop - op_tune_1005_S2 */

   cit_op_SetDeliveryDscrLoop(op_tune_1005_S2);
 
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


