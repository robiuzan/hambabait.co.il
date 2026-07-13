import { BadgeCheck, Flame, MapPin, ShieldCheck, Wallet, Zap } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { differentiators } from "@/lib/content";

const icons = [Zap, Flame, ShieldCheck, BadgeCheck, Wallet, MapPin];

export function WhyUs() {
  return (
    <Section id="why-us" tone="white">
      <SectionHeading eyebrow="למה חם בבית" title="דוד שעובד — בלי כאב ראש" />

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {differentiators.map((item, i) => {
          const Icon = icons[i] ?? ShieldCheck;
          return (
            <Reveal key={item.title} delay={(i % 3) * 0.07}>
              <div className="flex h-full flex-col rounded-2xl bg-gray-50 p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
