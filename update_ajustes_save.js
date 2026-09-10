const fs = require('fs');
const lines = fs.readFileSync('app/ajustes/page.tsx', 'utf8').split('\n');
let startIdx = lines.findIndex(l => l.includes('updateSettings({'));
let endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes('})') && !l.includes('=>'));

if (startIdx > -1 && endIdx > -1) {
  const newLines = `      updateSettings({
        appName,
        primaryColor,
        secondaryColor,
        borderColor,
        isGlass,
        fontFamily: fontFamily as any,
        logoUrl,
        logoSettings,
        storeCurrency,
        storeCurrencySecondary,
        storeExchangeRate,
        storeTaxRate,
        storeReceiptMessage,
        storeNextInvoice: settings.storeNextInvoice || 1,
        storeRif,
        storeAddress,
        storeUseThermalPrinter,
        storePaymentInstructions,
        storePaymentQRs,
        storeTicketWidth: storeTicketWidth as any,
        coachCustomPricing,
        gymCommissionPercentage,
        biometricFields,
        footerMission,
        footerVision,
        footerSocialLinks,
        footerPartners
      })`;
  
  lines.splice(startIdx, endIdx - startIdx + 1, newLines);
  fs.writeFileSync('app/ajustes/page.tsx', lines.join('\n'), 'utf8');
  console.log("updateSettings replaced successfully.");
} else {
  console.log("Could not find updateSettings block");
}
