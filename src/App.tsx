import { useEffect, useState, useRef } from "react"
import "./App.css"
import ndjsonStream from "can-ndjson-stream"
import { DataItem } from "./types" // Import DataItem type
import Row from "./components/Row" // Import the Row component

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
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://s3.amazonaws.com/io.cribl.c021.takehome/cribl.log"
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = ndjsonStream(response.body).getReader()
        const fetchedData: DataItem[] = []

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fetchedData.push(value)
        }

        setList(fetchedData)
      } catch (error) {
        console.error("Error fetching NDJSON data:", error)
      }
    }

    fetchData()
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
            <tr
              className="spacer-row"
              style={{ height: `${startIndex * rowHeight}px` }}
            ></tr>
            {visibleRows.map((item, index) => (
              <Row
                key={startIndex + index}
                item={item}
                index={startIndex + index}
                isExpanded={expandedRow === startIndex + index}
                onExpand={handleRowExpand}
              />
            ))}
            <tr
              className="spacer-row"
              style={{ height: `${(list.length - endIndex) * rowHeight}px` }}
            ></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
