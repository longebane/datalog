import React, { useRef } from "react"
import { DataItem } from "../../types"
import { SpacerRow } from "../"

interface DataLogProps {
  list: DataItem[]
  expandedRow: number | null
  rowHeight: number
  viewportHeight: number
  startIndex: number
  endIndex: number
  onScroll: () => void
  onRowExpand: (index: number) => void
}

const DataLog: React.FC<DataLogProps> = ({
  list,
  expandedRow,
  rowHeight,
  viewportHeight,
  startIndex,
  endIndex,
  onScroll,
  onRowExpand,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const visibleRows = list.slice(startIndex, endIndex)

  return (
    <div
      ref={containerRef}
      className="table-container"
      onScroll={onScroll}
      style={{ height: `${viewportHeight}px`, overflowY: "auto" }}
    >
      <table className="table">
        <thead>
          <tr className="table-header-row">
            <th className="table-header-cell">Time</th>
            <th className="table-header-cell">Event</th>
          </tr>
        </thead>
        <tbody>
          <SpacerRow height={startIndex * rowHeight} />
          {visibleRows.map((item, index) => (
            <tr
              key={startIndex + index}
              style={{
                backgroundColor:
                  expandedRow === startIndex + index ? "#444" : "#000",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => onRowExpand(startIndex + index)}
            >
              {expandedRow === startIndex + index ? (
                <td colSpan={2}>
                  {new Date(item._time).toISOString()}
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </td>
              ) : (
                <>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    {new Date(item._time).toISOString()}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                    {JSON.stringify(item).slice(0, 50)}...
                  </td>
                </>
              )}
            </tr>
          ))}
          <SpacerRow height={(list.length - endIndex) * rowHeight} />
        </tbody>
      </table>
    </div>
  )
}

export default DataLog
