import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { describe, it, expect, vi } from "vitest"
import App from "./App"

// Mock the fetchData function
vi.mock("./api", () => ({
  fetchData: vi.fn().mockResolvedValue([
    {
      _time: 1722524153074,
      cid: "api",
      channel: "auth",
      level: "info",
      message: "Successful login",
      user: "admin",
      provider: "local",
    },
  ]),
}))

describe("App Component", () => {
  const mockItem = {
    _time: 1722524153074,
    cid: "api",
    channel: "auth",
    level: "info",
    message: "Successful login",
    user: "admin",
    provider: "local",
  }

  // Temp stringified version of mockItem. The test doesn't pass if I use JSON.stringify(mockItem)
  const mockItemStringified =
    /"_time":\s*1722524153074,\s*"cid":\s*"api",\s*"channel":\s*"auth",\s*"level":\s*"info",\s*"message":\s*"Successful login",\s*"user":\s*"admin",\s*"provider":\s*"local"/

  it("displays the date in ISO 8601 format in the time column", async () => {
    // Render the App component
    render(<App />)

    // Wait for the rows to load
    const dateCell = await screen.findByText("2024-08-01T14:55:53.074Z")

    // Check that the dates are displayed in ISO 8601 format
    expect(dateCell).toBeInTheDocument()
  })

  it("expands and collapses a row correctly", async () => {
    // Render the App component
    render(<App />)

    // Wait for the rows to load
    const row = await screen.findByText("2024-08-01T14:55:53.074Z")
    expect(row).toBeInTheDocument()

    // Click the row to expand it
    fireEvent.click(row)

    // Check that the expanded content is displayed
    const expandedContent = screen.getByText(mockItemStringified)
    expect(expandedContent).toBeInTheDocument()

    // Click the row again to collapse it
    fireEvent.click(row)

    // Check that the expanded content is no longer displayed
    expect(screen.queryByText(mockItemStringified)).not.toBeInTheDocument()
  })

  it("renders truncated JSON when collapsed", async () => {
    // Render the App component
    render(<App />)

    // Wait for the rows to load
    const truncatedContent = await screen.findByText(
      JSON.stringify(mockItem).slice(0, 50) + "..."
    )

    // Check that the truncated content is displayed
    expect(truncatedContent).toBeInTheDocument()
  })
})
