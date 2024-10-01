export default function Grid({
  headers,
  rows,
}: {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
}) {
  return (
    <div>
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${headers.length},1fr)` }}
      >
        {headers.map((h, i) => (
          <div key={i} className="py-2 px-4 uppercase text-xs foreground2">
            {h}
          </div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid bg-white border items-center"
          style={{ gridTemplateColumns: `repeat(${headers.length},1fr)` }}
        >
          {r.map((c, i) => (
            <div key={i} className="py-2 px-4">
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
