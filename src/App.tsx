import React, { useEffect, useState, useRef } from "react"
import "./App.css"
import { fetchData } from "./api"
import { DataItem } from "./types"
import { Virtuoso } from "react-virtuoso"

interface RowProps {
  item: DataItem
  index: number
  isExpanded: boolean
  onExpand: (index: number) => void
}

const Row = React.memo(({ item, index, isExpanded, onExpand }: RowProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      className={`table-row ${isExpanded ? "expanded" : "collapsed"} ${
        index % 2 === 0 ? "even" : "odd"
      }`}
      onClick={() => onExpand(index)}
    >
      {!isExpanded ? (
        <>
          <div className="table-cell">{new Date(item._time).toISOString()}</div>
          <div className="table-cell">{JSON.stringify(item)}</div>
        </>
      ) : (
        <div ref={contentRef} className="table-expanded-row">
          <div className="table-cell">{new Date(item._time).toISOString()}</div>
          <div
            className="table-cell"
            onClick={(event) => event.stopPropagation()} // Prevent collapsing when interacting with the expanded content
          >
            <pre className="expanded-content">
              {JSON.stringify(item, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
})

function App() {
  const [list, setList] = useState<DataItem[]>([])
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingComplete, setIsLoadingComplete] = useState(false) // Track if loading is complete
  const hasFetchedData = useRef(false) // Prevent multiple fetch calls

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData((batch) => {
          setList((prev) => [...prev, ...batch]) // Append the batch to the list
        })
        setIsLoadingComplete(true) // Mark loading as complete
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again later.")
      }
    }

    // Prevent multiple calls to loadData
    if (!hasFetchedData.current) {
      hasFetchedData.current = true
      loadData()
    }
  }, []) // Empty dependency array ensures this runs only once

  const handleRowExpand = (index: number): void => {
    setExpandedRow((prev) => (prev === index ? null : index))
  }

  return (
    <div>
      {!isLoadingComplete && <div className="loader">Loading...</div>}
      <div>Count: {list.length}</div>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-container">
          <Virtuoso
            data={list}
            role="list"
            components={{
              Header: () => (
                <div className="table-header-row">
                  <div className="table-header-cell">Time</div>
                  <div className="table-header-cell">Event</div>
                </div>
              ),
            }}
            className="table-row-item"
            itemContent={(index) => {
              const item = list[index]
              const isExpanded = expandedRow === index

              return (
                <Row
                  item={item}
                  index={index}
                  isExpanded={isExpanded}
                  onExpand={handleRowExpand}
                />
              )
            }}
            computeItemKey={(index) => index}
            defaultItemHeight={50}
          />
        </div>
      )}
    </div>
  )
}

export default App
