/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


uint8 op_tune_1005_T2[17] = {
0xF0,0x0F,
0x7F,0x0D,0x04,0x01,0x00,0x01,0x03,0x64,0x00,0x00,0x02,0xd3,0x44,0x40,0x00 /* Func_main DVB-T2 */
};

int main(void)
{
   uint32 eError;
   
   printf("[BOLD]OP op-prof_op-tune_805_signal_T2 Start \n");

   /* set delivery system descriptor loop - op_tune_1005_T2 */

   cit_op_SetDeliveryDscrLoop(op_tune_1005_T2);

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


