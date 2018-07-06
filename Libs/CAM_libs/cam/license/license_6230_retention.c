/* ---------------------------------------------------------------------------- */ 
/* Copyright Digital TV Labs 2012 - 2013 */ 
/* ---------------------------------------------------------------------------- */ 
/* HTR 6.2.2.2: Retention Limit,
 *              Watch and Buffer Recording
 * Script name: license_6230_retention.c
 * Preconditions:
 * 
 */
#include <picoc_cit.h>

int main()
{
   unsigned int       eError = 0;
   uint32             eUriVersion;
   uint8              u8UriRL = 0;
   uint8              u8EventId = 0;
   uint8              *pu8LicenseLabel1 = "LicenseD4";
   uint8              *pu8LicenseLabel2 = "LicenseD5";
   cit_license_Object stLicenseEvt;

   printf("Application Of The Playback Retention Limit \n");

   /* Determine default URI version */
   eError = cit_uri_GetDefaultUriVersion(&eUriVersion);
   if(eError != 0)
   {
      printf("Failed to determine default URI version URIv%d, eError: %d \n", eUriVersion, eError);
      return 0;
   }
   printf("Default URI version is URIv%d \n", eUriVersion);

   /* Initialise the test system's persistent settings */
   eError = cit_lic_InitialiseNvram();
   if(eError != 0)
   {
      printf("Failed to initialise persistent settings, eError: %d \n", eError);
      return 0;
   }
   printf("Persistent settings are initialised \n");
   
   /* Set the default URI to Default_URI_004 */
   eError = cit_uri_SetURIMessage(eUriVersion);
   u8UriRL = 0xFF;
   cit_uri_SetRL(&u8UriRL);
   if(eError != 0)
   {
      printf("Failed to initialise URI message, eError: %d \n", eError);
      return 0;
   }
   eError = cit_uri_SaveDefaultURI();
   if(eError != 0)
   {
      printf("Failed to save default URI message in NVRAM, eError: %d \n", eError);
      return 0;
   }
   printf("Default URI is saved to NVRAM \n");

   /* Configure the record_start triggered URI/License event (Region#1)*/
   memset(&stLicenseEvt, 0x00, sizeof(cit_license_Object));
   stLicenseEvt.u16ProgramNumber = 0x0002;
   stLicenseEvt.u8LicenseStatus  = 0x00;
   cit_uri_SetURIMessage(eUriVersion);
   if(eUriVersion > 1)
      cit_uri_SetDOT(0x00);
   u8UriRL = 0x09;
   cit_uri_SetRL(&u8UriRL);
   cit_uri_Read(stLicenseEvt.pu8URI);
   stLicenseEvt.u16LicenseSize     = 0x100;
   stLicenseEvt.u8LicensePlayCount = 0x14;
   memcpy(stLicenseEvt.pu8LicenseLabel, pu8LicenseLabel1, 16);
   u8UriRL = 0x03;
   cit_uri_SetRL(&u8UriRL);
   cit_uri_Read(stLicenseEvt.pu8PlaybackURI);
   stLicenseEvt.u8PlaybackDelay = 0;
   eError = cit_lic_WriteImmediateEventConfig(&stLicenseEvt);
   if(eError != 0)
   {
      printf("Failed to write URI-License event [%d], eError: %d \n", u8EventId, eError);
      return 0;
   }
   u8EventId++;

   /* Configure the URI/License event (Region#2)*/
   memset(&stLicenseEvt, 0x00, sizeof(cit_license_Object));
   stLicenseEvt.tdtTime.u8Hour   = 12;
   stLicenseEvt.tdtTime.u8Min    = 18;
   stLicenseEvt.tdtTime.u8Sec    = 0;
   stLicenseEvt.u16ProgramNumber = 0x0002;
   stLicenseEvt.u8LicenseStatus  = 0x00;
   cit_uri_SetURIMessage(eUriVersion);
   if(eUriVersion > 1)
      cit_uri_SetDOT(0x00);
   u8UriRL = 0xFF;
   cit_uri_SetRL(&u8UriRL);
   cit_uri_Read(stLicenseEvt.pu8URI);
   stLicenseEvt.u16LicenseSize     = 0x100;
   stLicenseEvt.u8LicensePlayCount = 0x14;
   memcpy(stLicenseEvt.pu8LicenseLabel, pu8LicenseLabel2, 16);
   u8UriRL = 0x04;
   cit_uri_SetRL(&u8UriRL);
   cit_uri_Read(stLicenseEvt.pu8PlaybackURI);
   stLicenseEvt.u8PlaybackDelay = 0;
   eError = cit_lic_WriteEventConfig(u8EventId, &stLicenseEvt);
   if(eError != 0)
   {
      printf("Failed to write URI-License event [%d], eError: %d \n", u8EventId, eError);
      return 0;
   }
   u8EventId++; 
   
   /* Configure the URI event (Region#3) */
   memset(&stLicenseEvt, 0x00, sizeof(cit_license_Object));
   stLicenseEvt.tdtTime.u8Hour   = 12;
   stLicenseEvt.tdtTime.u8Min    = 20;
   stLicenseEvt.tdtTime.u8Sec    = 0;
   stLicenseEvt.u16ProgramNumber = 0x0002;
   stLicenseEvt.u8LicenseStatus  = 0xFF;  /*use 0xFF here to trigger stream_uri type */
   memset(stLicenseEvt.pu8URI, 0x00, 8);
   memcpy(stLicenseEvt.pu8URI, &eUriVersion, 1);
   cit_uri_SetEMI(0x03);
   u8UriRL = 0x00;
   cit_uri_SetRL(&u8UriRL);
   cit_uri_Read(stLicenseEvt.pu8URI);
   eError = cit_lic_WriteEventConfig(u8EventId, &stLicenseEvt);
   if(eError != 0)
   {
      printf("Failed to write URI event [%d], eError: %d \n", u8EventId, eError);
      return 0;
   }
   u8EventId++;
   
   /* Configure the URI event (Region#4) */
   memset(&stLicenseEvt, 0x00, sizeof(cit_license_Object));
   stLicenseEvt.tdtTime.u8Hour   = 12;
   stLicenseEvt.tdtTime.u8Min    = 22;
   stLicenseEvt.tdtTime.u8Sec    = 0;
   stLicenseEvt.u16ProgramNumber = 0x0002;
   stLicenseEvt.u8LicenseStatus  = 0xFF;  /*use 0xFF here to trigger stream_uri type */
   memset(stLicenseEvt.pu8URI, 0x00, 8);
   memcpy(stLicenseEvt.pu8URI, &eUriVersion, 1);
   cit_uri_SetEMI(0x03);
   u8UriRL = 0x08;
   cit_uri_SetRL(&u8UriRL);
   cit_uri_Read(stLicenseEvt.pu8URI);
   eError = cit_lic_WriteEventConfig(u8EventId, &stLicenseEvt);
   if(eError != 0)
   {
      printf("Failed to write URI event [%d], eError: %d \n", u8EventId, eError);
      return 0;
   }
   u8EventId++;

   eError = cit_lic_ConfigureScheduler();
   if(eError != 0)
   {
      printf("Failed to configure URI/License events, eError: %d \n", eError);
      return 0;
   }
   printf("Configured %d URI-License events \n", u8EventId);

   /* Enable logging */
   eError = cit_lic_WriteModuleConfig(0x01, 0x00);
   if(eError != 0)
   {
      printf("Failed to enable logging, eError: %d \n", eError);
      return 0;
   }
   printf("Logs are enabled \n");

   /* Print configuration */
   cit_lic_PrintConfiguration();

    
   return 0;
}

main();
