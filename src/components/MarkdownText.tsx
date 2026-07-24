interface MarkdownTextProps {
  text: string;
  className?: string;
}

const TABLE_SEPARATOR = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;

function parseTableRow(line: string): string[] {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|")) row = row.slice(0, -1);
  return row.split("|").map((cell) => cell.trim());
}

function isTableBlock(lines: string[]): boolean {
  return lines.length >= 2 && lines[0].trim().startsWith("|") && TABLE_SEPARATOR.test(lines[1]);
}

/** Renders plain text with support for blank-line paragraphs and GitHub-style markdown tables. */
export function MarkdownText({ text, className }: MarkdownTextProps) {
  const blocks = text.split(/\n{2,}/);

  return (
    <div className={className}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").filter((line) => line.trim() !== "");

        if (isTableBlock(lines)) {
          const header = parseTableRow(lines[0]);
          const rows = lines.slice(2).map(parseTableRow);

          return (
            <div
              key={blockIndex}
              className={`overflow-x-auto ${blockIndex > 0 ? "mt-3" : ""}`}
            >
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {header.map((cell, i) => (
                      <th
                        key={i}
                        className="border border-slate-300 bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIndex) => (
                    <tr key={rIndex}>
                      {row.map((cell, cIndex) => (
                        <td
                          key={cIndex}
                          className="border border-slate-300 px-3 py-1.5 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={blockIndex} className={blockIndex > 0 ? "mt-3" : ""}>
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
