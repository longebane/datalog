import ndjsonStream from "can-ndjson-stream"
import { DataItem } from "./types"

const API_URL = "https://s3.amazonaws.com/io.cribl.c021.takehome/cribl.log"

export const fetchData = async (
  onBatch: (batch: DataItem[]) => void,
  batchSize: number = 100 // Optimize writing to the DOM by batching
): Promise<void> => {
  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error("Response body is null")
    }

    const reader = ndjsonStream(response.body).getReader()
    const batch: DataItem[] = []

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        if (batch.length > 0) {
          onBatch([...batch])
        }
        break
      }

      if (value && typeof value === "object" && "_time" in value) {
        batch.push(value)

        if (batch.length === batchSize) {
          onBatch([...batch])
          batch.length = 0
        }
      } else if (value) {
        console.warn("Skipping invalid entry:", value)
      }
    }
  } catch (error) {
    console.error("Error fetching or processing data:", error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}
