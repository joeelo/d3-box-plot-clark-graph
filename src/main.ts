import { StatsResponse } from "./StatsResponse"
import "./style.css"

import * as d3 from "d3"
const initialStaticData = [0.5, 24, 25, 25, 27, 28, 29, 30, 31, 32, 90, 99]

enum Margin {
  Top = 10,
  Right = 30,
  Bottom = 30,
  Left = 40
}

// https://d3-graph-gallery.com/graph/boxplot_basic.html
// dimension and margin for graph
let height = 500 - Margin.Top - Margin.Bottom
let width = 500 - Margin.Left + Margin.Right
const center = 200

// https://stackoverflow.com/questions/54820096/detect-fetch-api-request-on-web-page-in-javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // @ts-expect-error initiator type is not on performanceObserver
    if (entry.initiatorType === "fetch") {
      console.log("Fetch request detected to", entry.name)
    }
  }
})

observer.observe({
  entryTypes: ["resource"]
})

const button = document.getElementById("generate-button")!

const svg = d3
  .select("#data-set")
  .append("svg")
  .attr("width", width + Margin.Left + Margin.Right)
  .attr("height", height + Margin.Top + Margin.Bottom)
  .append("g")
  .attr("transform", `translate(${Margin.Left}, ${Margin.Top})`)

// create a tooltip
const graphTooltip = d3
  .select("#data-set")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("font-size", "16px")

// create a tooltip
const circleTooltip = d3
  .select("#data-set")
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

// Three function that change the tooltip when user hover / move / leave a cell
// Tooltip code from d3 example - https://d3-graph-gallery.com/graph/boxplot_horizontal.html
const graphMouseover = function (x: number, y: number, data: StatsResponse) {
  const { max, q3, median, q1, min, iqr, range, mean, mode } = data

  graphTooltip.transition().duration(200).style("opacity", 1)
  graphTooltip
    .html(
      `
        <div style='color:green; margin-bottom: 5px;'>MAX: ${max} </div>
        <div style='color:green; margin-bottom: 5px;'>Q3: ${q3} </div>
        <div style='color:green; margin-bottom: 5px;'>MEDIAN: ${median} </div>
        <div style='color:green; margin-bottom: 5px;'>Q1: ${q1} </div>
        <div style='color:green; margin-bottom: 5px;'>MIN: ${min} </div>
        <div style='color:green; margin-bottom: 5px;'>INTERQUARTILE RANGE: ${iqr} </div>
        <div style='color:green; margin-bottom: 5px;'>RANGE: ${range} </div>
        <div style='color:green; margin-bottom: 5px;'>MEAN: ${mean} </div>
        <div style='color:green; margin-bottom: 5px;'>MODE: ${mode} </div>
      `
    ) // + d.Prior_disorder + "<br>" + "HR: " +  d.HR)
    .style("left", x + 30 + "px")
    .style("top", y + 30 + "px")

  const rect = d3.selectAll("rect")
  const lines = d3.selectAll(".min-max-lines,#vertical-line")

  rect.attr("stroke-width", 3)
  lines.attr("stroke-width", 4)
}

const graphMouseleave = function () {
  graphTooltip.transition().duration(200).style("opacity", 0)

  const rect = d3.selectAll("rect")
  const lines = d3.selectAll(".min-max-lines,#vertical-line")

  rect.attr("stroke-width", 1)
  lines.attr("stroke-width", 1)
}

const graphMousemove = function (x: number, y: number) {
  graphTooltip.style("left", x + 60 + "px").style("top", y + 60 + "px")
}

function update({
  apiData,
  data,
  newOutliers
}: {
  apiData: StatsResponse
  data: number[]
  newOutliers: number[]
}) {
  const sortedData = data.sort((a, b) => a - b)

  console.log({ apiData })

  const { q1, q3, median, max, min, mean, mode, range, iqr, outliers } = apiData

  const meanNode = document.getElementById("mean-label")!
  const medianNode = document.getElementById("median-label")!
  const modeNode = document.getElementById("mode-label")!
  const rangeNode = document.getElementById("range-label")!
  const iqrNode = document.getElementById("iqr-label")!
  const summaryNode = document.getElementById("summary-values")!
  const outliersNode = document.getElementById("outliers-values")!

  meanNode.innerHTML = `MEAN = <span style="color:green;">${mean.toFixed(
    2
  )}<span>`
  medianNode.innerHTML = `MEDIAN = <span style="color:green;">${median.toFixed(
    2
  )}</span>`
  modeNode.innerHTML = `MODE = <span style="color:green;">${mode.join(
    ", "
  )}</span>`
  rangeNode.innerHTML = `RANGE = <span style="color:green;">${range.toFixed(
    2
  )}</span>`
  iqrNode.innerHTML = `IQR = <span style="color:green;">${iqr.toFixed(
    2
  )}</span>`
  summaryNode.innerHTML = `<span style="color:green;">${min}, ${q1}, ${median}, ${q3}, ${max}</span>`
  outliersNode.innerHTML = `<span style="color:green;">${outliers.join(
    ", "
  )}</span>`

  const newYScale = d3
    .scaleLinear()
    .domain([0, max + 10])
    .range([height, 0])

  // Transition docs - https://www.d3indepth.com/transitions/
  d3.select("svg")
    .selectAll("rect")
    .on("mouseenter", function (evt) {
      // https://stackoverflow.com/questions/20002625/darken-rect-circle-on-mouseover-in-d3
      // @ts-ignore
      d3.select(this).style("fill", function () {
        return d3.rgb(d3.select(this).style("fill")).darker(0.2)
      })

      const [mx, my] = d3.pointer(evt)

      graphMouseover(mx, my, apiData)
    })
    .on("mousemove", function (evt) {
      const [mx, my] = d3.pointer(evt)

      graphMousemove(mx, my)
    })
    .on("mouseleave", function () {
      // @ts-ignore
      d3.select(this).style("fill", function () {
        return d3.rgb(d3.select(this).style("fill")).brighter(0.2)
      })
      graphMouseleave()
    })
    .data(sortedData)
    .join("rect")
    .transition()
    .duration(2000)
    .attr("y", newYScale(q3))
    .attr("height", newYScale(q1) - newYScale(q3))

  const newYAxis = d3.axisLeft(newYScale)

  svg
    .select("#y-axis")
    .transition()
    .duration(2000)
    .call(newYAxis as any)

  d3.select("svg")
    .selectAll(".min-max-lines")
    .data([min, median, max])
    .join(".min-max-lines")
    .transition()
    .duration(3000)
    .attr("y1", function (d) {
      return newYScale(d)
    })
    .attr("y2", function (d) {
      return newYScale(d)
    })

  d3.select("svg")
    .select("#vertical-line")
    .transition()
    .duration(3000)
    .attr("y1", newYScale(min))
    .attr("y2", newYScale(max))

  const inferno = d3
    .scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([0, max + 20])

  // Inserting new values https://www.createwithdata.com/enter-exit-with-d3-join/
  svg
    .selectAll("circle")
    .data(newOutliers)
    .join(
      function (enter) {
        return enter
          .append("circle")
          .style("opacity", 0)
          .attr("cx", center)
          .attr("cy", function () {
            return max
          })
          .attr("fill", "white")
          .on("mouseenter", function (evt, d) {
            // https://stackoverflow.com/questions/20002625/darken-rect-circle-on-mouseover-in-d3
            // @ts-ignore
            d3.select(this).style("fill", function (evt) {
              return d3.rgb(d3.select(this).style("fill")).darker(0.4)
            })

            console.log(evt)

            const [mx, my] = d3.pointer(evt)
            circleMouseover(mx, my, d)
          })
          .on("mouseleave", function () {
            // @ts-ignore
            d3.select(this).style("fill", function () {
              return d3.rgb(d3.select(this).style("fill")).brighter(0.4)
            })
            circleMouseleave()
          })
          .on("mousemove", function (evt) {
            circleMousemove(evt.clientX, evt.clientY)
          })
      },
      function (update) {
        return update
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
    .attr("cx", function () {
      return center
    })
    .transition()
    .duration(3000)
    .attr("r", function () {
      return 5
    })
    .attr("cy", function (d) {
      return newYScale(d)
    })
    .style("stroke", "black")
    .style("fill", function (d) {
      return inferno(d)
    })
    .style("opacity", 1)
}

button.addEventListener("click", async () => {
  const textArea = document.getElementById("number-input") as HTMLInputElement

  const newData = textArea.value
    .split(", ")
    .filter((num) => {
      return Number(num) || Number(num) === 0
    })
    .map((num) => Number(num))

  const newValues = (await getData(newData)) as any

  console.log("new outliers ", newValues.data.outliers)

  await update({
    apiData: newValues.data,
    data: newValues.dataSet,
    newOutliers: newValues.data.outliers
  })
})

async function getData(nums = [] as number[]) {
  const response = await fetch("http://localhost:8000/calculate-stats", {
    method: "POST",
    body: JSON.stringify({
      data_input: nums
    }),
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    }
  })
  const data = (await response.json()) as StatsResponse
  return {
    dataSet: nums,
    data
  }
}

async function generateGraph(data: any) {
  // append svg object to the page
  const dataSorted = data.sort(d3.ascending)

  const q1 = d3.quantile(dataSorted, 0.25) || 0
  const median = d3.quantile(dataSorted, 0.5)
  const q3 = d3.quantile(dataSorted, 0.75) || 0
  // const interQuantileRange = q3 - q1
  const min = dataSorted[0]
  const max = dataSorted[dataSorted.length - 1]

  // show y scale
  const yScale = d3
    .scaleLinear()
    .domain([0, max + 5])
    .range([height, 0])

  const yAxis = d3.axisLeft(yScale)

  svg.append("g").attr("id", "y-axis").call(yAxis)

  // some box features
  width = 100

  // show the main vertical line
  svg
    .append("line")
    .attr("id", "vertical-line")
    .attr("class", "main-vert-line")
    .attr("x1", center)
    .attr("x2", center)
    .attr("y1", yScale(min))
    .attr("y2", yScale(max))
    .attr("stroke", "black")

  // show the box
  svg
    .append("rect")
    .attr("x", center - width / 2)
    .attr("y", yScale(q3))
    .attr("height", yScale(q1) - yScale(q3))
    .attr("width", width)
    .attr("stroke", "black")
    .attr("fill", "#9663C4")

  svg
    .selectAll("d")
    .data([min, median, max])
    .enter()
    // append a line for each data point on enter()
    .append("line")
    .attr("class", "min-max-lines")
    .attr("x1", center - width / 2) // start of line
    .attr("x2", center + width / 2) // end of line
    .attr("y1", function (d) {
      return yScale(d)
    })
    .attr("y2", function (d) {
      return yScale(d)
    })
    .attr("stroke", "black")
    .attr("pointer-events", "none")

  const inferno = d3
    .scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([0, max + 5])

  svg
    .selectAll("circle")
    .data([])
    .enter()
    .append("circle")
    .attr("class", "outlier-circles")
    .attr("z-index", "5")
    .attr("cx", function () {
      return center
    })
    .attr("cy", function (d) {
      return yScale(d)
    })
    .attr("r", 5)
    .style("fill", function (d) {
      return inferno(d)
    })
    .attr("stroke", "black")
}

generateGraph(initialStaticData)
