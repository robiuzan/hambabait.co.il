"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MessageCircle, Phone, Send, TriangleAlert } from "lucide-react";
import { siteConfig, whatsappHref, telHref, services } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@ishub/site-kit/analytics";

/**
 * Primary lead/quote form (brief G1). Low-friction: name + phone required.
 *
 * Delivers via Web3Forms (https://api.web3forms.com/submit) so the lead is emailed to the
 * business inbox (contact.email) from any static host — no backend/PHP needed. The PUBLIC
 * access key comes from the manifest (siteConfig.formAccessKey), falling back to
 * NEXT_PUBLIC_WEB3FORMS_KEY for local dev. Honeypot blocks bots.
 *
 * Delivery failures are NEVER silent: the form renders an explicit error state offering a
 * call and a WhatsApp hand-off the user clicks themselves. An auto `window.open()` after an
 * `await` is outside the user-gesture window and gets eaten by popup blockers, which used to
 * lose the lead with no UI feedback at all.
 */
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
// `||` not `??`: a manifest key blanked to "" must fall through to the env var, not disable
// delivery. Nullish coalescing passes "" straight through.
const WEB3FORMS_KEY =
  siteConfig.formAccessKey || process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";

type FieldErrors = { name?: string; phone?: string };

/**
 * Israeli phone shapes, digits only after stripping separators:
 * mobile 05XXXXXXXX (10), landline 0X-XXXXXXX (9), or the +972 / 972 international form.
 */
function isValidIsraeliPhone(raw: string): boolean {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+?972/, "0");
  return /^0\d{8,9}$/.test(digits);
}

export function LeadForm({
  className,
  defaultService = "",
  ctaPlacement = "form",
}: {
  className?: string;
  /** Pre-selects the service dropdown — pass the Hebrew service name from the route. */
  defaultService?: string;
  /** Placement tag for the WhatsApp/call affordances in this instance. */
  ctaPlacement?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [whatsappFallback, setWhatsappFallback] = useState<string>("");

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  function buildWhatsapp(data: FormData): string {
    const text = [
      `שלום, אני ${(data.get("name") as string) || ""}.`.trim(),
      (data.get("service") as string) ? `מעוניין/ת ב: ${data.get("service")}.` : "",
      (data.get("message") as string) || "",
      `טלפון לחזרה: ${(data.get("phone") as string) || ""}`,
    ]
      .filter(Boolean)
      .join("\n");
    return whatsappHref(text);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if ((data.get("company") as string)?.length) return; // honeypot

    const name = (data.get("name") as string)?.trim() ?? "";
    const phone = (data.get("phone") as string)?.trim() ?? "";

    // Per-field validation, so the user is told which field is wrong and focus lands on it.
    const errors: FieldErrors = {};
    if (!name) errors.name = "נא למלא שם מלא";
    if (!phone) errors.phone = "נא למלא מספר טלפון";
    else if (!isValidIsraeliPhone(phone)) errors.phone = "מספר הטלפון אינו תקין";

    setFieldErrors(errors);
    if (errors.name) {
      nameRef.current?.focus();
      return;
    }
    if (errors.phone) {
      phoneRef.current?.focus();
      return;
    }

    setStatus("sending");

    // No access key (local dev only): simulate so `next dev` works. Production builds always
    // ship a provisioned key, so an empty key in production is a misconfig — hand off to
    // WhatsApp rather than silently pretending the lead was sent.
    if (!WEB3FORMS_KEY) {
      if (process.env.NODE_ENV !== "production") {
        await new Promise((r) => setTimeout(r, 600));
        setStatus("done");
        return;
      }
      setWhatsappFallback(buildWhatsapp(data));
      setStatus("error");
      trackEvent("lead_submit_failed", { form: "lead", reason: "no_key" });
      return;
    }

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `פנייה חדשה מהאתר — ${name}`,
          from_name: siteConfig.name,
          name,
          phone,
          service: (data.get("service") as string) || "לא צוין",
          message: (data.get("message") as string) || "—",
        }),
      });
      const result: { success?: boolean } = await res.json();
      if (!res.ok || !result.success) throw new Error("bad status");
      setStatus("done");
      // GTM conversion hook: fires only on a CONFIRMED send (the dev simulation above does not).
      // The dataLayer push is synchronous and client-side navigation does not unload the page,
      // so the event survives the redirect.
      trackEvent("lead_submit", { form: "lead" });
      // /תודה/ gives GA4/Ads a destination-URL conversion; the inline card below is the
      // fallback that shows for the instant before navigation completes.
      router.push("/תודה/");
    } catch {
      // Never silent, and never an auto-popup: render a WhatsApp hand-off the user clicks.
      setWhatsappFallback(buildWhatsapp(data));
      setStatus("error");
      trackEvent("lead_submit_failed", { form: "lead", reason: "delivery" });
    }
  }

  if (status === "done") {
    return (
      <div
        className={cn("rounded-xl bg-green-50 p-6 text-center", className)}
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-3 font-heading text-lg font-bold text-primary">
          תודה! קיבלנו את הפנייה
        </p>
        <p className="mt-1 text-sm text-gray-600">
          נחזור אליכם בהקדם. צריכים מענה מיידי?{" "}
          <a
            href={telHref}
            data-cta={`${ctaPlacement}-success-call`}
            className="font-semibold text-secondary hover:underline"
          >
            התקשרו אלינו
          </a>
          .
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className={cn("rounded-xl bg-amber-50 p-6 text-center", className)}
        role="alert"
        aria-live="assertive"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <TriangleAlert className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-3 font-heading text-lg font-bold text-primary">
          השליחה נכשלה — אבל אנחנו כאן
        </p>
        <p className="mt-1 text-sm text-gray-600">
          לא הצלחנו לשלוח את הפנייה. אפשר להתקשר או לשלוח את הפרטים בוואטסאפ בלחיצה אחת.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            href={telHref}
            variant="accent"
            size="lg"
            data-cta={`${ctaPlacement}-error-call`}
          >
            <Phone className="h-5 w-5" aria-hidden />
            <span dir="ltr">{siteConfig.phone}</span>
          </Button>
          <Button
            href={whatsappFallback || whatsappHref("היי, אני מעוניין/ת בשירות תיקון דוד")}
            variant="whatsapp"
            size="lg"
            data-cta={`${ctaPlacement}-error-whatsapp`}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            שליחה בוואטסאפ
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-secondary underline focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none"
        >
          חזרה לטופס
        </button>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40";
  const errorClass = "border-red-500 focus:border-red-500 focus:ring-red-500/40";

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)} noValidate>
      <div>
        <label htmlFor="lf-name" className="mb-1 block text-sm font-medium text-gray-700">
          שם מלא
        </label>
        <input
          ref={nameRef}
          id="lf-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={fieldErrors.name ? "lf-name-error" : undefined}
          className={cn(fieldClass, fieldErrors.name && errorClass)}
          placeholder="ישראל ישראלי"
        />
        {fieldErrors.name && (
          <p id="lf-name-error" className="mt-1 text-sm font-medium text-red-600">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="lf-phone"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          טלפון
        </label>
        <input
          ref={phoneRef}
          id="lf-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          dir="ltr"
          aria-invalid={fieldErrors.phone ? true : undefined}
          aria-describedby={fieldErrors.phone ? "lf-phone-error" : undefined}
          // text-end under dir="ltr" resolves to the right edge — logical, not physical.
          className={cn(fieldClass, "text-end", fieldErrors.phone && errorClass)}
          placeholder="050-0000000"
        />
        {fieldErrors.phone && (
          <p id="lf-phone-error" className="mt-1 text-sm font-medium text-red-600">
            {fieldErrors.phone}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="lf-service"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          השירות שמעניין אתכם (אופציונלי)
        </label>
        <select
          id="lf-service"
          name="service"
          className={fieldClass}
          defaultValue={defaultService}
        >
          <option value="">בחירת שירות…</option>
          {services.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="lf-message"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          פרטים על הבעיה (אופציונלי)
        </label>
        <textarea
          id="lf-message"
          name="message"
          rows={3}
          className={fieldClass}
          placeholder="לדוגמה: דוד חשמל שלא מחמם / נזילה מהדוד…"
        />
      </div>

      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="lf-company">אל תמלאו שדה זה</label>
        <input
          id="lf-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={status === "sending"}
      >
        <Send className="h-5 w-5" aria-hidden />
        {status === "sending" ? "שולח…" : "שליחה וקבלת הצעת מחיר"}
      </Button>

      <p className="text-center text-xs text-gray-500">
        בשליחת הטופס אתם מאשרים שניצור איתכם קשר בטלפון או בוואטסאפ בנוגע לפנייה. פרטים
        נוספים ב
        <Link href="/מדיניות-פרטיות/" className="underline hover:text-gray-700">
          מדיניות הפרטיות
        </Link>
        .
      </p>

      <p className="text-center text-xs text-gray-500">
        מעדיפים וואטסאפ?{" "}
        <a
          href={whatsappHref("היי, אני מעוניין/ת בשירות תיקון דוד")}
          data-cta={`${ctaPlacement}-whatsapp`}
          className="inline-flex items-center gap-1 font-semibold text-[#1da851] hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          שלחו לנו הודעה
        </a>
      </p>
    </form>
  );
}
