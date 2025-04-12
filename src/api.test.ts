import { describe, it, expect, vi, beforeEach } from "vitest"
import { fetchData } from "./api"
import ndjsonStream from "can-ndjson-stream"

// Mock dependencies
globalThis.fetch = vi.fn()
vi.mock("can-ndjson-stream", () => ({ default: vi.fn() }))

describe("fetchData", () => {
  const createMockResponse = (status = 200) => ({
    ok: status === 200,
    status,
    body: new ReadableStream(),
  })

  const createMockReader = (entries: any[]) => ({
    read: vi.fn().mockImplementation(() => {
      const entry = entries.shift()
      return Promise.resolve(
        entry ? { done: false, value: entry } : { done: true, value: null }
      )
    }),
    releaseLock: vi.fn(),
    closed: Promise.resolve(),
    cancel: vi.fn(),
  })

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("processes batches correctly", async () => {
    const entries = [
      { _time: 1724323612592, channel: "conf:policies" },
      { _time: 1724323576596, channel: "ShutdownMgr" },
    ]
    const mockOnBatch = vi.fn()

    vi.mocked(fetch).mockResolvedValue(createMockResponse() as Response)
    vi.mocked(ndjsonStream).mockReturnValue({
      getReader: () => createMockReader(entries),
    })

    await fetchData(mockOnBatch, 2)

    expect(fetch).toHaveBeenCalledWith(
      "https://s3.amazonaws.com/io.cribl.c021.takehome/cribl.log"
    )

    // Verify onBatch was called with the correct data
    expect(mockOnBatch).toHaveBeenCalledTimes(1)
  })

  it("handles HTTP errors", async () => {
    vi.mocked(fetch).mockResolvedValue(createMockResponse(500) as Response)
    await expect(fetchData(vi.fn())).rejects.toThrow("HTTP error! status: 500")
  })

  it("skips invalid entries", async () => {
    const entries = [
      { invalid: "data" },
      { _time: 1724323612592, channel: "conf:policies" },
    ]
    const mockOnBatch = vi.fn()

    vi.mocked(fetch).mockResolvedValue(createMockResponse() as Response)
    vi.mocked(ndjsonStream).mockReturnValue({
      getReader: () => createMockReader(entries),
    })

    await fetchData(mockOnBatch, 1)

    // Verify onBatch was called with the valid data only
    expect(mockOnBatch).toHaveBeenCalledTimes(1)
  })

  it("processes remaining entries when stream ends", async () => {
    const entries = [{ _time: 1724323612592, channel: "conf:policies" }]
    const mockOnBatch = vi.fn()

    vi.mocked(fetch).mockResolvedValue(createMockResponse() as Response)
    vi.mocked(ndjsonStream).mockReturnValue({
      getReader: () => createMockReader(entries),
    })

    await fetchData(mockOnBatch, 2)

    // Verify onBatch was called with the remaining data
    expect(mockOnBatch).toHaveBeenCalledTimes(1)
  })
})
