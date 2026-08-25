import type { GuideBlock } from "@/lib/guides";

/**
 * Renders a guide's typed block list. Server component — guides are static data and
 * nothing here needs state, so this must not pull the hub into the client bundle.
 *
 * Tables are real <table> markup with a <caption> and scoped headers: answer engines lift
 * tabular comparisons far more reliably than prose, and screen readers announce the
 * caption. They scroll inside their own container so a wide table never makes the page
 * scroll horizontally.
 */
export function GuideBody({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <h2 key={i} className="mt-10 font-heading text-xl font-bold text-primary">
                {block.text}
              </h2>
            );

          case "paragraph":
            return (
              <p key={i} className="mt-4 leading-relaxed text-gray-700">
                {block.text}
              </p>
            );

          case "list":
            return block.ordered ? (
              <ol key={i} className="mt-4 space-y-3">
                {block.items.map((item, n) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {n + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="mt-4 space-y-2">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-gray-700 before:mt-2.5 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-accent"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            );

          case "table":
            return (
              <div key={i} className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[30rem] border-collapse text-start text-sm">
                  <caption className="pb-3 text-start text-sm font-bold text-primary">
                    {block.caption}
                  </caption>
                  <thead>
                    <tr className="border-b border-gray-200">
                      {block.head.map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="py-3 text-start font-bold text-primary first:pe-4 last:ps-4"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map(([a, b]) => (
                      <tr key={a} className="border-b border-gray-100 align-top">
                        <td className="py-3 pe-4 font-medium text-gray-800">{a}</td>
                        <td className="py-3 ps-4 text-gray-600">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "callout":
            return (
              <aside
                key={i}
                className={
                  block.tone === "warning"
                    ? "mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-gray-800"
                    : "mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-gray-800"
                }
              >
                <p className="leading-relaxed">
                  <strong className="font-bold text-primary">
                    {block.tone === "warning" ? "שימו לב: " : "כדאי לדעת: "}
                  </strong>
                  {block.text}
                </p>
              </aside>
            );
        }
      })}
    </>
  );
}
