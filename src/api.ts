import ndjsonStream from "can-ndjson-stream"
import { DataItem } from "./types"

export const fetchData = async (): Promise<DataItem[]> => {
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

  return fetchedData
}
