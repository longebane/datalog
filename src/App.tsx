import { useEffect, useState } from "react"
import "./App.css"
import { fetchData } from "./api"
import { DataItem } from "./types"
import DataTable from "./components/DataTable"

function App() {
  const [list, setList] = useState<DataItem[]>([])
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

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
    const container = document.querySelector(".table-container")
    if (!container) return

    const { scrollTop } = container
    const newStartIndex = Math.floor(scrollTop / rowHeight)
    const newEndIndex = newStartIndex + Math.ceil(viewportHeight / rowHeight)

    setStartIndex(newStartIndex)
    setEndIndex(newEndIndex)
  }

  const handleRowExpand = (index: number): void => {
    setExpandedRow((prev) => (prev === index ? null : index))
  }

  return (
    <div>
      <div>Count: {list.length}</div>
      <DataTable
        list={list}
        expandedRow={expandedRow}
        rowHeight={rowHeight}
        viewportHeight={viewportHeight}
        startIndex={startIndex}
        endIndex={endIndex}
        onScroll={handleScroll}
        onRowExpand={handleRowExpand}
      />
    </div>
  )
}

export default App
