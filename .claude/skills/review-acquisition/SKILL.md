---
name: review-acquisition
description: Building a genuine review stream for חם בבית, which has zero reviews anywhere — the WhatsApp-native ask on the number the business already runs on, timing it to the moment the hot water works again, responding to every review, and the hard gate that Review/AggregateRating markup must never ship until real attributable reviews exist, now enforced automatically by npm run qa:gate. Covers what is prohibited: incentives, gating, filtering, drafting or seeding. Use when planning how to earn reviews or when someone proposes review schema. Triggers: "get reviews", "review markup", "AggregateRating", "testimonials", "star rating", "can we add reviews to the site".
---

# Review acquisition — חם בבית

## Current state

**Zero reviews. Anywhere.** No Google Business Profile, no testimonials on the site, no rating in the
schema, and `sameAs` is `[]` so the site claims no profile to hold them. `docs/business-facts.md` §2
records this as one of the things the site correctly does _not_ claim.

That clean state is deliberate and it is worth protecting. It is also the single largest gap in the
site's off-site position — see `gbp-local-listings`, and note that a profile cannot be published at
all until the six roster assumptions in `docs/manifest-assumptions.md` are settled. This skill is
about earning reviews, not manufacturing them.

## ⛔ The hard gate — read before anything else

> **`Review`, `AggregateRating`, `ratingValue` and `reviewCount` must not appear in the built output.**

This is no longer a manual check. **`npm run qa:gate` fails the build** if `aggregateRating`,
`reviewCount` or `ratingValue` appears anywhere in `out/` — string-scanned over every `.html`, not
just the `ld+json` blocks, because Next also serialises the JSON-LD into the React Flight payload and
a banned property must not survive there either. The current build passes it clean.

```bash
npm run build && npm run qa:gate

# the same check by hand
grep -rEo '"(aggregateRating|review|ratingValue|reviewCount)"' out | sort -u
# must return nothing
```

`docs/schema-graph.md` §6 states the rule; the gate enforces it. Removing the assertion to "unblock"
a change is the same violation as shipping the markup.

Fabricated review markup is a **Google policy violation with manual-action risk** — not a style
problem, not a grey area, and not something to "try and see". Losing the domain's rankings to a manual
action would cost more than every other item in the backlog combined.

**When someone asks to add review schema, the answer is: not until real, attributable reviews exist on
a real profile.** Today that means never. Say it plainly.

Even once reviews _do_ exist, the safe default is to **let the Business Profile carry them** rather
than mirror them into site JSON-LD. Self-serving review markup on your own domain is the pattern
Google discounts hardest.

## Prohibited, without exception

| Practice                                      | Why                                      |
| --------------------------------------------- | ---------------------------------------- |
| Incentivised reviews (discount, gift, entry)  | against Google policy                    |
| **Gating** — asking happy customers only      | against policy; also distorts the signal |
| Filtering or suppressing negatives            | against policy                           |
| Writing or drafting a review for a customer   | fabrication                              |
| Seeding reviews from staff, friends or family | fabrication                              |
| Buying reviews                                | fabrication, and traceable               |
| Review markup for reviews that do not exist   | policy violation, manual-action risk     |

An agent must **never** draft review text "as an example a customer could use". That is writing the
review with extra steps.

## What actually works here

The business runs on WhatsApp — the same number is the phone line, the WhatsApp line and the lead-form
fallback. So the ask should be **WhatsApp-native**. Do not invent an email flow for a business whose
customers are already in a chat thread.

### Timing

Ask **right after the hot water works again.** That is the moment of maximum goodwill and it never
comes back. A week later the job is forgotten.

### The ask

One message, to every completed customer — not a filtered subset. Plain, short, no pressure, and a
direct link so it is one tap.

Principles for whoever writes it (the owner, in their own voice):

- Thank them, name what was fixed
- Ask directly, once
- Give the direct GBP review link
- No incentive, no "if you were happy" precondition, no follow-up nagging

**Ask everyone.** Gating is both against policy and self-defeating: a profile with only five-star
reviews reads as manufactured, and a handful of honest four-star reviews makes the rest credible.

### Responding

Respond to every review, including — especially — the bad ones. A calm, specific, non-defensive reply
to a complaint is read by every future customer and often converts better than the complaint costs.

Never dispute facts publicly, never reveal customer details, never argue.

## Volume and pace

Steady beats spiky. Twenty reviews arriving in one week reads as a campaign; two a week for six months
reads as a business.

There is no target number that unlocks rankings — anyone who quotes one is guessing. What matters is
that reviews are real, recent and responded to.

## The site side

Until real reviews exist:

- No testimonials section
- No star graphics
- No "customers love us" copy — that is a review claim without the reviews
- No `Review`/`AggregateRating` JSON-LD

Once real reviews exist on the profile, the honest on-site move is a **link to the profile**, not a
mirror of its contents.

## Reporting

When asked about reviews, report: how many exist (today: zero), where, whether they are attributable,
and whether anything on the site currently implies a rating that does not exist.

If someone proposes review schema, restate the gate and the manual-action risk. That is the useful
answer even when it is not the requested one.
