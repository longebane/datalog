import { render, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { describe, it, expect, vi } from "vitest"
import { Row } from "./App"

describe("Row Component", () => {
  const mockItem = {
    _time: 1722524153074,
    channel: "conf:policies",
    message: "loading policy",
    policy: {
      title: "Read Only",
      description: "Members with this policy can view and use the macro",
    },
  } as any

  const setup = (isExpanded = false) => {
    const handleExpand = vi.fn()

    render(
      <Row
        item={mockItem}
        index={0}
        isExpanded={isExpanded}
        onExpand={handleExpand}
      />
    )
    return { handleExpand }
  }

  it("displays formatted date", () => {
    setup()
    expect(screen.getByText("2024-08-01T14:55:53.074Z")).toBeInTheDocument()
  })

  it("handles expand/collapse", () => {
    const { handleExpand } = setup()

    fireEvent.click(screen.getByText("2024-08-01T14:55:53.074Z"))
    expect(handleExpand).toHaveBeenCalledWith(0)
  })

  it("shows/hides expanded content", () => {
    // Test collapsed state
    setup(false)
    expect(screen.queryByText(/"title": "Read Only"/)).not.toBeInTheDocument()

    // Test expanded state
    setup(true)
    expect(screen.getByText(/"title": "Read Only"/)).toBeInTheDocument()
  })
})
