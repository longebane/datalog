import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { describe, it, expect, vi } from "vitest"
import { Row } from "./App"
import { DataItem } from "./types"

// Test Row component to bypass react-virtuoso
describe("Row Component", () => {
  const mockItem: DataItem = {
    _time: 1722524153074,
    cid: "api",
    channel: "conf:policies",
    level: "info",
    message: "loading policy",
    context: "cribl",
    policy: {
      args: ["groupName", "macroId"],
      template: [
        "GET /m/${groupName}/search/macros/${macroId}",
        "GET /m/${groupName}/search/macros/${macroId}/*",
      ],
      description: "Members with this policy can view and use the macro",
      title: "Read Only",
    },
  }

  it("displays the date in ISO 8601 format in the Time column", async () => {
    render(
      <Row item={mockItem} index={0} isExpanded={false} onExpand={() => {}} />
    )

    // Check that the date is displayed in ISO 8601 format
    const dateCell = await screen.findByText("2024-08-01T14:55:53.074Z")
    expect(dateCell).toBeInTheDocument()
  })

  it("expands and collapses a row correctly", () => {
    const handleExpand = vi.fn()

    render(
      <Row
        item={mockItem}
        index={0}
        isExpanded={false}
        onExpand={handleExpand}
      />
    )

    // Click the row to expand it
    const row = screen.getByText("2024-08-01T14:55:53.074Z")
    fireEvent.click(row)

    // Ensure the onExpand callback is called
    expect(handleExpand).toHaveBeenCalledWith(0)
  })

  it("renders expanded content when expanded", async () => {
    render(
      <Row item={mockItem} index={0} isExpanded={true} onExpand={() => {}} />
    )

    // Check that the expanded content is displayed
    const expandedContent = await screen.findByText(`"title": "Read Only"`, {
      exact: false,
    })
    expect(expandedContent).toBeInTheDocument()
  })

  it("does not render expanded content when collapsed", () => {
    render(
      <Row item={mockItem} index={0} isExpanded={false} onExpand={() => {}} />
    )

    // Check that the expanded content is not displayed
    const expandedContent = screen.queryByText(`"title": "Read Only"`, {
      exact: false,
    })
    expect(expandedContent).not.toBeInTheDocument()
  })
})
