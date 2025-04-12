import { render } from "@testing-library/react"
import "@testing-library/jest-dom"
import { describe, it, expect, beforeEach } from "vitest"
import BarChart from "./BarChart"

describe("BarChart", () => {
  const testData = [
    { _time: "2025-04-01T12:00:00Z", channel: "telemetry" },
    { _time: "2025-04-01T13:00:00Z", channel: "telemetry" },
    { _time: "2025-04-02T12:00:00Z", channel: "other" },
    { _time: "2025-04-02T14:00:00Z", channel: "telemetry" },
  ] as any

  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("renders bars for each unique date", () => {
    render(<BarChart data={testData} />)
    const bars = document.querySelectorAll(".bar")
    expect(bars).toHaveLength(2)
  })

  it("displays correct date labels", () => {
    render(<BarChart data={testData} />)
    const labels = document.querySelectorAll(".x-axis text")

    expect(labels[0]).toHaveTextContent("2025-04-01")
    expect(labels[1]).toHaveTextContent("2025-04-02")
  })

  it("creates bars with height attributes", () => {
    render(<BarChart data={testData} />)
    const bars = document.querySelectorAll(".bar")

    bars.forEach((bar) => {
      expect(bar).toHaveAttribute("height")
      expect(Number(bar.getAttribute("height"))).toBeGreaterThan(0)
    })
  })
})
