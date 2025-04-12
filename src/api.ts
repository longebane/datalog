import ndjsonStream from "can-ndjson-stream"
import { DataItem } from "./types"

export const fetchData = async (
  onBatch: (batch: DataItem[]) => void,
  batchSize: number = 100 // Optimize writing to the DOM by batching
): Promise<void> => {
  const response = await fetch(
    "https://s3.amazonaws.com/io.cribl.c021.takehome/cribl.log"
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  if (!response.body) {
    throw new Error("Response body is null")
  }

  const reader = ndjsonStream(response.body).getReader()
  const batch: DataItem[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break // Exit the loop when the stream is fully consumed
      }

      if (value) {
        try {
          // Validate the entry before processing
          if (typeof value !== "object" || !value._time) {
            console.warn("Skipping invalid entry:", value)
            continue
          }

          // Add the entry to the batch
          batch.push(value)

          // If the batch reaches the specified size, process it
          if (batch.length === batchSize) {
            onBatch([...batch]) // Pass a copy of the batch to the callback
            batch.length = 0 // Clear the batch
          }
        } catch (entryError) {
          console.error("Error processing entry:", value, entryError)
        }
      }
    }

    // Process any remaining entries in the batch
    if (batch.length > 0) {
      onBatch([...batch])
    }
  } catch (error) {
    console.error("Error reading NDJSON stream:", error)
    throw error
  }
}
