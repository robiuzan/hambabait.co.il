import { MessageCircle, Phone } from "lucide-react";
import { siteConfig, telHref, whatsappHref } from "@/lib/site-config";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function FinalCta() {
  return (
    <section className="bg-accent">
      <Container className="flex flex-col items-center gap-6 py-14 text-center">
        <div>
          <h2 className="font-heading text-2xl font-extrabold text-accent-foreground sm:text-3xl">
            הדוד לא מחמם? דברו איתנו עוד היום.
          </h2>
          {/* 🔶 confirm — dropped "עם אחריות על העבודה". The warranty is asserted across
              the site with no term, scope or document anywhere, and this component renders
              on nearly every page, so it was one of the widest carriers of the claim.
              docs/business-facts.md §3.1. */}
          {/* No /90 opacity: white at 90% over the accent band (#16833e) composites to
              #e8f3ec = 4.23:1 and fails AA. Full white on #16833e is 4.83:1 and passes. */}
          <p className="mx-auto mt-3 max-w-xl text-accent-foreground">
            אבחון והצעת מחיר שקופה — ללא התחייבות. תיקון דודים מקצועי בכל הארץ, עם תנאים
            ברורים מראש.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={telHref} data-cta="finalcta-call" variant="primary" size="lg">
            <Phone className="h-5 w-5" aria-hidden />
            חייגו עכשיו: <span dir="ltr">{siteConfig.phone}</span>
          </Button>
          <Button
            href={whatsappHref("היי, אני מעוניין/ת בשירות תיקון דוד")}
            data-cta="finalcta-whatsapp"
            variant="whatsapp"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            שלחו וואטסאפ
          </Button>
        </div>
      </Container>
    </section>
  );
}
