// basis for graph resize https://d3-graph-gallery.com/graph/custom_responsive.html
import "./style.css"
import * as d3 from "d3"

enum Margin {
  Top = 10,
  Right = 30,
  Bottom = 30,
  Left = 40
}

interface GraphData {
  val: number
  instanceOfValue: number
}

let height = 700 - Margin.Top - Margin.Bottom

// Initialize a SVG area. Note that the width is not specified yet, since unknown
const Svg = d3
  .select("#dot-plot")
  .append("svg")
  .attr("height", height + Margin.Top + Margin.Bottom)

// Create dummy data
const data = [
  19, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 78, 98, 120,
  138
]

// Add X axis. Note that we don't know the range yet, so we cannot draw it.
const x = d3.scaleLinear().domain([0, 250])
const xAxis = Svg.append("g").attr("transform", `translate(0,${height})`)

function formatDataForDotPlot(nums: number[]) {
  const sortedNums = nums.sort((a, b) => a - b)
  const updatedNums: GraphData[] = []

  for (let i = 0; i < sortedNums.length; i++) {
    const isTheSameAsPrevNumber = sortedNums[i] === sortedNums[i - 1]

    if (isTheSameAsPrevNumber) {
      updatedNums.push({
        val: sortedNums[i],
        instanceOfValue: updatedNums[i - 1].instanceOfValue + 1
      })
    } else {
      updatedNums.push({ val: sortedNums[i], instanceOfValue: 1 })
    }
  }

  return updatedNums
}

const updatedValues = formatDataForDotPlot(data)

// A function that finishes to draw the chart for a specific device size.
function drawChart(values: GraphData[]) {
  console.log("called function", values)

  // get the current width of the div where the chart appear, and attribute it to Svg
  const currentWidth = parseInt(d3.select("#dot-plot").style("width"), 10)
  Svg.attr("width", currentWidth)

  // Update the X scale and Axis (here the 20 is just to have a bit of margin)
  x.range([20, currentWidth - 20])
  x.domain([0, values[values.length - 1].val + 2])
  xAxis.transition().duration(3000).call(d3.axisBottom(x))

  Svg.selectAll("circle")
    .data(values)
    .join(
      function (enter) {
        return enter
          .append("circle")
          .attr("opacity", 0)
          .style("fill", "#9663C4")
          .attr("stroke-width", 1)
          .attr("stroke", "black")
          .attr("r", 7)
          .attr("cy", function (d) {
            return height - 20 * d.instanceOfValue
          })
          .attr("cx", function (d) {
            return x(d.val)
          })
      },
      function (update) {
        return update
          .attr("opacity", 0)
          .attr("cy", function (d) {
            return height - 20 * d.instanceOfValue
          })
          .attr("cx", function (d) {
            return x(d.val)
          })
      },
      function (exit) {
        return exit
          .transition()
          .duration(3000)
          .attr("r", 0)
          .style("opacity", 0)
          .on("end", function () {
            d3.select(this).remove()
          })
      }
    )
    .transition()
    .duration(3000)
    .attr("opacity", 1)
}

// Initialize the chart
drawChart(updatedValues)

// Add an event listener that run the function when dimension change
// TOOD: Add a debounce function to this
window.addEventListener("resize", () => {
  drawChart(updatedValues)
})

const generateButton = document.getElementById("generate-button")!
generateButton.addEventListener("click", () => {
  const textArea = document.getElementById("number-input") as HTMLInputElement

  const newData = textArea.value
    .split(", ")
    .filter((num) => {
      return Number(num) || Number(num) === 0
    })
    .map((num) => Number(num))

  const formattedData = formatDataForDotPlot(newData)

  drawChart(formattedData)
})
