import React, { useEffect, useState, useRef, useCallback } from "react"
import { fetchData } from "./api"
import { DataItem } from "./types"
import { Virtuoso } from "react-virtuoso"
import BarChart from "./components/BarChart/BarChart"

import "./App.css"

interface RowProps {
  item: DataItem
  index: number
  isExpanded: boolean
  onExpand: (index: number) => void
}

export const Row = React.memo(
  ({ item, index, isExpanded, onExpand }: RowProps) => {
    const handleClick = () => onExpand(index)

    return (
      <div
        className={`table-row ${isExpanded ? "expanded" : "collapsed"} ${
          index % 2 === 0 ? "even" : "odd"
        }`}
        onClick={handleClick}
      >
        {isExpanded ? (
          <div className="table-expanded-row">
            <div className="table-cell">
              {new Date(item._time).toISOString()}
            </div>
            <div className="table-cell" onClick={(e) => e.stopPropagation()}>
              <pre className="expanded-content">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <>
            <div className="table-cell">
              {new Date(item._time).toISOString()}
            </div>
            <div className="table-cell">{JSON.stringify(item)}</div>
          </>
        )}
      </div>
    )
  }
)

function App() {
  const [list, setList] = useState<DataItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasFetchedData = useRef(false)

  const handleRowExpand = useCallback((index: number): void => {
    setExpandedRow((prev) => (prev === index ? null : index))
  }, [])

  useEffect(() => {
    // Prevent multiple fetches
    if (!hasFetchedData.current) {
      hasFetchedData.current = true
      const loadData = async () => {
        try {
          await fetchData((batch) => {
            setList((prev) => [...prev, ...batch])
          })
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
          setIsLoading(false)
        }
      }
      loadData()
    }
  }, [])

  const renderVirtualizedList = useCallback(
    () => (
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
        itemContent={(index) => (
          <Row
            item={list[index]}
            index={index}
            isExpanded={expandedRow === index}
            onExpand={handleRowExpand}
          />
        )}
        computeItemKey={(index) => index}
        defaultItemHeight={50}
      />
    ),
    [list, expandedRow, handleRowExpand]
  )

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div>
      <div>Count: {list.length}</div>
      <BarChart data={list} />
      {isLoading && <div className="loader">Loading...</div>}
      <div className="table-container">{renderVirtualizedList()}</div>
    </div>
  )
}

export default App
