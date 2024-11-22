// import { StatsResponse } from "./StatsResponse"
import "./style.css"
import * as d3 from "d3"

enum Margin {
  Top = 10,
  Right = 30,
  Bottom = 30,
  Left = 40
}

let height = 500 - Margin.Top - Margin.Bottom

// Initialize a SVG area. Note that the width is not specified yet, since unknown
const Svg = d3
  .select("#dot-plot")
  .append("svg")
  .attr("height", height + Margin.Top + Margin.Bottom)

// Create dummy data
const data = [19, 52, 52, 52, 52, 78, 98, 120, 138]

function formatDataForDotPlot(nums: number[]) {
  const updatedNums: { val: number; instanceOfValue: number }[] = []

  for (let i = 0; i < nums.length; i++) {
    const isTheSameAsPrevNumber = nums[i] === nums[i - 1]

    if (isTheSameAsPrevNumber) {
      updatedNums.push({
        val: nums[i],
        instanceOfValue: updatedNums[i - 1].instanceOfValue + 1
      })
    } else {
      updatedNums.push({ val: nums[i], instanceOfValue: 1 })
    }
  }

  return updatedNums
}

const updatedValues = formatDataForDotPlot(data)

console.log(updatedValues)

// Add X axis. Note that we don't know the range yet, so we cannot draw it.
const x = d3.scaleLinear().domain([0, 150])
const xAxis = Svg.append("g").attr("transform", `translate(0,${height})`)

// Initialize circles. Note that the X scale is not available yet, so we cannot draw them
const myCircles = Svg.selectAll("circles")
  .data(updatedValues)
  .enter()
  .append("circle")
  .style("fill", "#69b2b3")
  .attr("r", 20)
  .attr("cy", function (d) {
    return height - 60 * d.instanceOfValue
  })

// A function that finishes to draw the chart for a specific device size.
function drawChart() {
  // get the current width of the div where the chart appear, and attribute it to Svg
  const currentWidth = parseInt(d3.select("#dot-plot").style("width"), 10)
  Svg.attr("width", currentWidth)

  // Update the X scale and Axis (here the 20 is just to have a bit of margin)
  x.range([20, currentWidth - 20])
  xAxis.call(d3.axisBottom(x))

  // Add the last information needed for the circles: their X position
  myCircles.attr("cx", function (d) {
    return x(d.val)
  })
}

// Initialize the chart
drawChart()

// Add an event listener that run the function when dimension change
window.addEventListener("resize", drawChart)
