import { describe, it, expect, vi } from "vitest"
import { fetchData } from "./api"
import ndjsonStream from "can-ndjson-stream"

// Mock the `fetch` API
globalThis.fetch = vi.fn()

// Mock the `ndjsonStream` library
vi.mock("can-ndjson-stream", () => ({
  default: vi.fn(),
}))

describe("fetchData", () => {
  it("fetches data and processes batches correctly", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: new ReadableStream(), // Mock body as a readable stream
    }
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: { _time: 1724323612592, channel: "conf:policies" },
        })
        .mockResolvedValueOnce({
          done: false,
          value: { _time: 1724323576596, channel: "ShutdownMgr" },
        })
        .mockResolvedValueOnce({ done: true, value: null }),
    }
    const mockOnBatch = vi.fn()

    // Mock fetch and ndjsonStream
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)
    vi.mocked(ndjsonStream).mockReturnValue({
      getReader: () => ({
        ...mockReader,
        releaseLock: vi.fn(),
        closed: Promise.resolve(),
        cancel: vi.fn(),
      }),
    })

    await fetchData(mockOnBatch, 2)

    // Verify fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith(
      "https://s3.amazonaws.com/io.cribl.c021.takehome/cribl.log"
    )

    // Verify onBatch was called with the correct data
    expect(mockOnBatch).toHaveBeenCalledTimes(1)
    expect(mockOnBatch).toHaveBeenCalledWith([
      { _time: 1724323612592, channel: "conf:policies" },
      { _time: 1724323576596, channel: "ShutdownMgr" },
    ])
  })

  it("handles HTTP errors", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const mockOnBatch = vi.fn()

    await expect(fetchData(mockOnBatch)).rejects.toThrow(
      "HTTP error! status: 500"
    )
  })

  it("skips invalid entries", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: new ReadableStream(), // Mock body as a readable stream
    }
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: { invalid: "data" } }) // Invalid entry
        .mockResolvedValueOnce({
          done: false,
          value: { _time: 1724323612592, channel: "conf:policies" },
        })
        .mockResolvedValueOnce({ done: true, value: null }),
    }
    const mockOnBatch = vi.fn()

    // Mock fetch and ndjsonStream
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)
    vi.mocked(ndjsonStream).mockReturnValue({
      getReader: () => ({
        ...mockReader,
        releaseLock: vi.fn(),
        closed: Promise.resolve(),
        cancel: vi.fn(),
      }),
    })

    await fetchData(mockOnBatch, 1)

    // Verify onBatch was called with the valid data only
    expect(mockOnBatch).toHaveBeenCalledTimes(1)
    expect(mockOnBatch).toHaveBeenCalledWith([
      { _time: 1724323612592, channel: "conf:policies" },
    ])
  })

  it("processes remaining entries in the batch after the stream ends", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: new ReadableStream(), // Mock body as a readable stream
    }
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: { _time: 1724323612592, channel: "conf:policies" },
        })
        .mockResolvedValueOnce({ done: true, value: null }),
    }
    const mockOnBatch = vi.fn()

    // Mock fetch and ndjsonStream
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)
    vi.mocked(ndjsonStream).mockReturnValue({
      getReader: () => ({
        ...mockReader,
        releaseLock: vi.fn(),
        closed: Promise.resolve(),
        cancel: vi.fn(),
      }),
    })

    await fetchData(mockOnBatch, 2)

    // Verify onBatch was called with the remaining data
    expect(mockOnBatch).toHaveBeenCalledTimes(1)
    expect(mockOnBatch).toHaveBeenCalledWith([
      { _time: 1724323612592, channel: "conf:policies" },
    ])
  })
})
