import { MessageCircle, Phone } from "lucide-react";
import { siteConfig, telHref, whatsappHref } from "@/lib/site-config";

/**
 * Sticky click-to-call + WhatsApp bar, mobile only (brief E4 conversion element).
 * A spacer is added in the layout so it never covers footer content.
 */
export function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] lg:hidden">
      <a
        href={telHref}
        data-cta="sticky-call"
        className="flex items-center justify-center gap-2 bg-accent py-3.5 font-semibold text-accent-foreground"
      >
        <Phone className="h-5 w-5" aria-hidden />
        חייגו עכשיו
      </a>
      {/* Dark label on the WhatsApp brand fill: white on #25D366 is 1.98:1 and fails AA;
          primary (#344256) on it is 5.14:1. Matches the Button `whatsapp` variant. */}
      <a
        href={whatsappHref("היי, אני מעוניין/ת בשירות תיקון דוד")}
        data-cta="sticky-whatsapp"
        className="flex items-center justify-center gap-2 bg-[#25D366] py-3.5 font-semibold text-primary"
        aria-label={`וואטסאפ ${siteConfig.name}`}
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        וואטסאפ
      </a>
    </div>
  );
}
