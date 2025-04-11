import { useEffect, useState, useRef } from "react"
import "./App.css"
import { fetchData } from "./api"
import { DataItem } from "./types"
import { Row, SpacerRow } from "./components"

function App() {
  const [list, setList] = useState<DataItem[]>([])
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const rowHeight = 50
  const viewportHeight = 500

  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(
    Math.ceil(viewportHeight / rowHeight)
  )

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchData()
        setList(data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    loadData()
  }, [])

  const handleScroll = () => {
    if (!containerRef.current) return

    const { scrollTop } = containerRef.current
    const newStartIndex = Math.floor(scrollTop / rowHeight)
    const newEndIndex = newStartIndex + Math.ceil(viewportHeight / rowHeight)

    setStartIndex(newStartIndex)
    setEndIndex(newEndIndex)
  }

  const handleRowExpand = (index: number): void => {
    setExpandedRow((prev) => (prev === index ? null : index))
  }

  const visibleRows = list.slice(startIndex, endIndex)

  return (
    <div>
      <div>Count: {list.length}</div>
      <div
        ref={containerRef}
        className="table-container"
        onScroll={handleScroll}
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
              <Row
                key={startIndex + index}
                item={item}
                index={startIndex + index}
                isExpanded={expandedRow === startIndex + index}
                onExpand={handleRowExpand}
              />
            ))}
            <SpacerRow height={(list.length - endIndex) * rowHeight} />
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
