import React, { useEffect, useState, useRef } from "react"
import "./App.css"
import ndjsonStream from "can-ndjson-stream"
import { DataItem } from "./types" // Import DataItem type

const Row = React.memo(
  ({
    item,
    index,
    isExpanded,
    onExpand,
  }: {
    item: DataItem
    index: number
    isExpanded: boolean
    onExpand: (index: number) => void
  }) => {
    return (
      <tr
        style={{
          backgroundColor: isExpanded ? "#444" : "#000",
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={() => onExpand(index)}
      >
        {/* Collapsed Content */}
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
  }
)

function App() {
  const [list, setList] = useState<DataItem[]>([])
  const [visibleList, setVisibleList] = useState<DataItem[]>([]) // Rendering data (for performance)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const BATCH_SIZE = 100 // Number of rows to load at a time
  const containerRef = useRef<HTMLDivElement | null>(null)

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
        let batch: DataItem[] = []

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              break
            }

            batch.push(value) // Add the item to the batch

            // Update state in batches
            if (batch.length >= 100) {
              fetchedData.push(...batch)
              setList([...fetchedData]) // Update the full list
              setVisibleList((prev) => [...prev, ...batch]) // Update the visible list
              batch = [] // Clear the batch
            }
          }

          // Add any remaining items in the batch
          if (batch.length > 0) {
            fetchedData.push(...batch)
            setList([...fetchedData])
            setVisibleList((prev) => [...prev, ...batch])
          }
        }

        processStream()
      } catch (error) {
        console.error("Error fetching NDJSON data:", error)
      }
    }

    fetchData()
  }, [])

  const handleScroll = () => {
    if (!containerRef.current) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current

    // Check if the user has scrolled near the bottom
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      // Load the next batch of rows
      const nextBatch = list.slice(
        visibleList.length,
        visibleList.length + BATCH_SIZE
      )
      setVisibleList((prev) => [...prev, ...nextBatch])
    }
  }

  const handleRowExpand = (index: number): void => {
    setExpandedRow((prev) => (prev === index ? null : index))
  }

  return (
    <div>
      <div>Count: {list.length}</div>
      <div
        ref={containerRef}
        style={{
          height: "500px",
          overflowY: "auto",
          border: "1px solid #ccc",
          width: "100%",
        }}
        onScroll={handleScroll}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {/* Table Header */}
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #ccc",
              }}
            >
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>Time</th>
              <th style={{ padding: "8px", border: "1px solid #ccc" }}>
                Event
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {visibleList.map((item, index) => (
              <Row
                key={index}
                item={item}
                index={index}
                isExpanded={expandedRow === index}
                onExpand={handleRowExpand}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
