import { render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { describe, it, expect } from "vitest"
import BarChart from "./BarChart"

describe("BarChart Component", () => {
  const mockData = [
    { _time: "2025-04-01T12:00:00Z", channel: "telemetry" },
    { _time: "2025-04-01T13:00:00Z", channel: "telemetry" },
    { _time: "2025-04-02T12:00:00Z", channel: "other" },
    { _time: "2025-04-02T14:00:00Z", channel: "telemetry" },
  ] as any

  it("renders the correct number of bars", () => {
    render(<BarChart data={mockData} />)

    // Count the number of bars rendered
    const barElements = document.querySelectorAll(".bar")
    expect(barElements.length).toBe(2)
  })

  it("ensures bars correlate with the x-axis (time)", async () => {
    render(<BarChart data={mockData} />)

    // Wait for the x-axis labels to appear
    const xAxisLabels = await waitFor(() =>
      Array.from(document.querySelectorAll(".x-axis text")).map(
        (label) => label.textContent
      )
    )

    expect(xAxisLabels).toEqual(["2025-04-01", "2025-04-02"])
  })

  it("ensures bars correlate with the y-axis (occurrences)", () => {
    render(<BarChart data={mockData} />)

    // Check the heights of the bars
    const barElements = document.querySelectorAll(".bar")
    expect(barElements[0]).toHaveAttribute("height") // Ensure the first bar has a height
    expect(barElements[1]).toHaveAttribute("height") // Ensure the second bar has a height
  })
})
