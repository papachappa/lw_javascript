/* ----------------------------------------------------------------------------    
 * Copyright Digital TV Labs 2012 - 2013    
 * ---------------------------------------------------------------------------- */ 
#include <picoc_cit.h>



int main(void)
{
		uint8 log;
	
		cit_op_GetLogConfig(&log);
		
		printf("OP Log config is %d \n", log);
		
		return 0;
}
main();