/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


uint8 op_tune_1005_T1[15] = {
0xF0,0x0D,
0x5A,0x0B,0x02,0xD3,0x44,0x40,0x1F,0x84,0x82,0xFF,0xFF,0xFF,0xFF /* Func_main DVB-T */
};

int main(void)
{   
   uint32 eError;
   printf("[BOLD]OP op-prof_op-tune_805_signal_T1 Start \n");

   /* set delivery system descriptor loop - op_tune_1005_T1 */

   cit_op_SetDeliveryDscrLoop(op_tune_1005_T1);

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


