// Blocklist of known disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com","temp-mail.org","guerrillamail.com","guerrillamail.net","guerrillamail.org",
  "mailinator.com","yopmail.com","throwaway.email","tempail.com","fakeinbox.com",
  "sharklasers.com","guerrillamailblock.com","grr.la","dispostable.com","trashmail.com",
  "trashmail.me","trashmail.net","mailnesia.com","maildrop.cc","discard.email",
  "mailcatch.com","mytemp.email","tempmailo.com","mohmal.com","burnermail.io",
  "inboxkitten.com","getnada.com","emailondeck.com","tempr.email","10minutemail.com",
  "10minutemail.net","minutemail.com","emailfake.com","crazymailing.com",
  "mailsac.com","harakirimail.com","tmail.ws","tempinbox.com","trash-mail.com",
  "binkmail.com","safemail.info","filzmail.com","devnullmail.com","spamgourmet.com",
  "mailnull.com","trashmail.org","trashmail.at","trashmail.io",
  "tempmailaddress.com","tmpmail.net","tmpmail.org","mailtemp.info",
  "10mail.org","20minutemail.com","33mail.com","anonbox.net",
  "bccto.me","bugmenot.com","clrmail.com","deadaddress.com",
  "disposeamail.com","dodgeit.com","e4ward.com","emailigo.de",
  "emailsensei.com","emailtemporario.com.br","ephemail.net",
  "etranquil.com","fakemailgenerator.com","fastacura.com",
  "getairmail.com","guerrillamail.de","guerrillamail.biz",
  "incognitomail.org","jetable.org","kasmail.com","klassmaster.com",
  "mailexpire.com","mailforspam.com","mailhazard.com","mailhazard.us",
  "mailimate.com","mailmoat.com","mailshell.com","mailsiphon.com",
  "mailslite.com","mailzilla.com","nomail.xl.cx","nospam.ze.tc",
  "owlpic.com","proxymail.eu","putthisinyouremail.com","rhyta.com",
  "spambox.us","spamfree24.org","spaml.com","tempemail.co.za",
  "tempemail.net","tempinbox.co.uk","tempmail.eu","tempomail.fr",
  "throwam.com","tittbit.in","trash2009.com","trashymail.com",
  "turual.com","twinmail.de","uggsrock.com","upliftnow.com",
  "venompen.com","veryreallyfakeemails.com","wegwerfmail.de",
  "wegwerfmail.net","yep.it","yopmail.fr","yopmail.net",
  "zehnminutenmail.de","zoemail.org",
  "3dkai.com","tempdukviet.site","sharebot.net","jabarya.shop",
  "neko2.net",
]);

// Suspicious TLD patterns commonly used by disposable email services
const SUSPICIOUS_TLDS = [".site", ".shop", ".xyz", ".top", ".click", ".buzz", ".gq", ".ml", ".cf", ".tk", ".ga"];

export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().trim().split("@")[1];
  if (!domain) return true;

  if (DISPOSABLE_DOMAINS.has(domain)) return true;

  // Check if domain is a subdomain of a known disposable domain
  for (const d of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${d}`)) return true;
  }

  return false;
}
