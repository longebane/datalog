const SpacerRow = ({ height = 0 }: { height?: number }) => {
  return <tr className="spacer-row" style={{ height: `${height}px` }} />
}

export default SpacerRow
