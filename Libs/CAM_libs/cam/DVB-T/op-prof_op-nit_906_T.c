/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>


/* op_nit_2000_T */
uint8 op_nit_2000_T[45] = {
0x40,0xF0,0x2E,0x00,0x86,0xC1,0x00,0x00,0xF0,0x06,0x40,0x04,0x44,0x54,0x56,0x4C,0xF0,0x1B,0x00,0x01,
0x00,0x85,0xF0,0x15,0x5A,0x0B,0x02,0xD3,0x44,0x40,0x1F,0x80,0x0A,0xFF,0xFF,0xFF,0xFF,0x41,0x06,0x00,
0x01,0x01,0x00,0x02,0x01
};

/* op_nit_9006_T */
uint8 op_nit_9006_T[111] = {
0x40,0xF0,0x70,0x00,0x86,0xC1,0x00,0x00,0xF0,0x06,0x40,0x04,0x44,0x54,0x56,0x4C,0xF0,0x5D,0x00,0x01,
0x00,0x85,0xF0,0x57,0x5A,0x0B,0x02,0xD3,0x44,0x40,0x1F,0x80,0x0A,0xFF,0xFF,0xFF,0xFF,0x5F,0x04,0x00,
0x00,0x00,0x40,0xCC,0x1F,0x00,0x01,0x01,0xC0,0x00,0x0E,0x44,0x54,0x56,0x4C,0x5F,0x50,0x72,0x6F,0x66,
0x69,0x6C,0x65,0x5F,0x30,0x0A,0x43,0x41,0x4D,0x5F,0x30,0x31,0x5F,0x46,0x54,0x41,0xCC,0x21,0x00,0x02,
0x01,0xE7,0x0F,0x0E,0x44,0x54,0x56,0x4C,0x5F,0x50,0x72,0x6F,0x66,0x69,0x6C,0x65,0x5F,0x30,0x0C,0x43,
0x41,0x4D,0x5F,0x30,0x32,0x5F,0x53,0x63,0x72,0x61,0x6D
};



int main(void)
{
   uint32 eError;
   uint8 u8NitVersion;
   cit_op_NitBuffer stNitBuffer;

   printf("[BOLD]OP op-prof_op-nit_906_T Start \n");   
   
   /* op_nit_2000_T */
   u8NitVersion = cit_op_GetNitVersion();
   memcpy(stNitBuffer.au8NitBuffer, op_nit_2000_T, sizeof(op_nit_2000_T));
   stNitBuffer.au8NitBuffer[5] |= ((u8NitVersion << 1) & 0x3E); /* update correct Nit Version */
   strncpy(stNitBuffer.au8NitLabel, "op_nit_2000_T", 16); /* set nit_label */
   stNitBuffer.au8NitLabel[16] = '\0';
   stNitBuffer.u16NitSize = sizeof(op_nit_2000_T);   
   /* set nit_buffer_now */
   cit_op_SetNitBufferNow(&stNitBuffer);
   
   /* op_nit_9006_T */
   u8NitVersion = (((cit_op_GetNitVersion() + 1) % 32) == 0) ? 1 : (cit_op_GetNitVersion() + 1); 
   memcpy(stNitBuffer.au8NitBuffer, op_nit_9006_T, sizeof(op_nit_9006_T));
   stNitBuffer.au8NitBuffer[5] |= ((u8NitVersion << 1) & 0x3E); /* update correct Nit Version */
   strncpy(stNitBuffer.au8NitLabel, "op_nit_9006_T", 16); /* set nit_label */
   stNitBuffer.au8NitLabel[16] = '\0';
   stNitBuffer.u16NitSize = sizeof(op_nit_9006_T);  
   /* set status_buffer_after_search */
   cit_op_SetNitBufferAfterSearch(&stNitBuffer);
   
   printf("[BOLD]OP script done\n"); 
   return 0;
}

main(); 


 
