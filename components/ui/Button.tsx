import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "accent" | "primary" | "whatsapp" | "outline";
type Size = "md" | "lg";

// Focus ring is secondary (steel blue), not accent: on the accent-green FinalCta band an
// accent ring is green-on-green and invisible. The white ring-offset gap carries the
// indicator on dark/green surfaces; the blue ring carries it on white.
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  accent: "bg-accent text-accent-foreground hover:bg-accent-600",
  primary: "bg-primary text-primary-foreground hover:bg-primary-500",
  // WhatsApp keeps its brand fill; the LABEL is what changed. White on #25D366 is 1.98:1
  // and fails AA — #344256 (primary) on it is 5.14:1. That inverts the hover direction too:
  // the old darker #1da851 dropped the dark label to 3.29:1, so hover now moves LIGHTER.
  // #4add80 is a 15% white tint of the brand green and holds the label at 5.80:1.
  // The lucide icons inherit currentColor, so they clear the 3:1 non-text floor with it.
  whatsapp: "bg-[#25D366] text-primary hover:bg-[#4add80]",
  outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type AnchorProps = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

/** Polymorphic button: renders a Next `<Link>` (internal), `<a>` (external/tel/wa) or `<button>`. */
export function Button(props: AnchorProps | ButtonProps) {
  const { variant = "accent", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, children: _ch, href, ...rest } = props;
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link href={href} className={classes} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
