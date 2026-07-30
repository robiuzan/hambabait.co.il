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
          <p className="mx-auto mt-3 max-w-xl text-accent-foreground/90">
            אבחון והצעת מחיר שקופה — ללא התחייבות. תיקון דודים מקצועי בכל הארץ, עם אחריות
            על העבודה.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={telHref} data-cta="finalcta-call" variant="primary" size="lg">
            <Phone className="h-5 w-5" aria-hidden />
            חייגו עכשיו: <span dir="ltr">{siteConfig.phone}</span>
          </Button>
          <Button
            href={whatsappHref("היי, אני מעוניין/ת בשירות תיקון דוד")} data-cta="finalcta-whatsapp"
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
