import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import "./BarChart.css"
import { DataItem } from "../../types"

interface BarChartProps {
  data: DataItem[]
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (data.length === 0) return

    // Group data by day
    const groupedData = d3.rollups(
      data,
      (v) => v.length,
      (d) => new Date(d._time).toISOString().slice(0, 10) // Group by day (YYYY-MM-DD)
    )

    // Sort the grouped data by time
    const sortedData = groupedData.sort((a, b) => a[0].localeCompare(b[0]))

    // Transform the grouped data into a chart-friendly format
    const chartData = sortedData.map(([time, count]) => ({ time, count }))

    // Set up chart dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 40 }
    const containerWidth = chartRef.current?.parentElement?.offsetWidth || 800
    const width = containerWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // Clear any existing chart
    d3.select(chartRef.current).selectAll("*").remove()

    // Create the SVG container
    const svg = d3
      .select(chartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Set up scales
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.time)) // Use the daily time as the domain
      .range([0, width])
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.count) || 0]) // Use the count as the domain
      .nice()
      .range([height, 0])

    // Add X axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)) // Show full date (YYYY-MM-DD)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")

    // Add Y axis
    svg.append("g").call(d3.axisLeft(y))

    // Add bars
    svg
      .selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.time) || 0)
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", "rgb(215, 236, 243)")
  }, [data]) // Re-render the chart whenever `data` changes

  return <svg ref={chartRef}></svg>
}

export default BarChart
