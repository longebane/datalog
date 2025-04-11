import React from "react"
import { DataItem } from "../../types"

interface RowProps {
  item: DataItem
  index: number
  isExpanded: boolean
  onExpand: (index: number) => void
}

const Row = React.memo(({ item, index, isExpanded, onExpand }: RowProps) => {
  return (
    <tr
      style={{
        backgroundColor: isExpanded ? "#444" : "#000",
        color: "#fff",
        cursor: "pointer",
      }}
      onClick={() => onExpand(index)}
    >
      {!isExpanded ? (
        <>
          <td style={{ padding: "8px", border: "1px solid #ccc" }}>
            {new Date(item._time).toISOString()}
          </td>
          <td style={{ padding: "8px", border: "1px solid #ccc" }}>
            {JSON.stringify(item).slice(0, 50)}...
          </td>
        </>
      ) : (
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
      )}
    </tr>
  )
})

export default Row
