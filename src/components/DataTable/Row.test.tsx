import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { describe, it, expect, vi } from "vitest"
import Row from "./Row"

describe("Row Component", () => {
  const mockItem = {
    _time: 1722524153074,
    cid: "api",
    channel: "auth",
    level: "info",
    message: "Successful login",
    user: "admin",
    provider: "local",
  }

  const mockOnExpand = vi.fn()

  it("calls onExpand when the row is clicked", () => {
    // Render the Row component in collapsed state
    render(
      <table>
        <tbody>
          <Row
            item={mockItem}
            index={0}
            isExpanded={false}
            onExpand={mockOnExpand}
          />
        </tbody>
      </table>
    )
    // Simulate a click on the row
    const row = screen.getByText("2024-08-01T14:55:53.074Z")
    fireEvent.click(row)
    // Verify that onExpand is called with the correct index
    expect(mockOnExpand).toHaveBeenCalledWith(0)
  })
})
