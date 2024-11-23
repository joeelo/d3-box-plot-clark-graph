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

let height = 500 - Margin.Top - Margin.Bottom

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

// create a tooltip
const circleTooltip = d3
  .select("#dot-plot")
  .append("div")
  .style("opacity", 0)
  .attr("background-color", "blue")
  .attr("class", "tooltip")
  .style("font-size", "16px")

// Three function that change the tooltip when user hover / move / leave a cell
// Tooltip code from d3 example - https://d3-graph-gallery.com/graph/boxplot_horizontal.html
const circleMouseover = function (x: number, y: number, data: number = 0) {
  circleTooltip.transition().duration(200).style("opacity", 1)
  circleTooltip
    .html(`<span style='color:green'>outlier value: ${data} </span>`)
    .style("left", x + 30 + "px")
    .style("top", y + 30 + "px")
}
const circleMouseleave = function () {
  circleTooltip.transition().duration(200).style("opacity", 0)
}
const circleMousemove = function (x: number, y: number) {
  circleTooltip.style("left", x + 30 + "px").style("top", y + 30 + "px")
}

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
  // get the current width of the div where the chart appear, and attribute it to Svg
  const currentWidth = parseInt(d3.select("#dot-plot").style("width"), 10)
  Svg.attr("width", currentWidth)

  // Update the X scale and Axis (here the 20 is just to have a bit of margin)
  x.range([20, currentWidth - 20])
  x.domain([0, values[values.length - 1].val + 2])
  xAxis.call(d3.axisBottom(x))

  console.log(values)

  // Initialize circles. Note that the X scale is not available yet, so we cannot draw them
  Svg.selectAll("circle")
    .data(values)
    .join(
      function (enter) {
        return enter
          .append("circle")
          .style("fill", "#9663C4")
          .attr("r", 15)
          .attr("cy", function (d) {
            return height - 60 * d.instanceOfValue
          })
          .attr("cx", function (d) {
            return x(d.val)
          })
      },
      function (update) {
        return update
          .attr("cy", function (d) {
            return height - 60 * d.instanceOfValue
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
          .attr("cx", 1000)
          .on("end", function () {
            d3.select(this).remove()
          })
      }
    )
    .transition()
    .duration(3000)
}

// Initialize the chart
drawChart(updatedValues)

function removeCircles() {
  Svg.selectAll("circle").remove()
}

// Add an event listener that run the function when dimension change
window.addEventListener("resize", () => {
  removeCircles()

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
