// https://www.youtube.com/watch?v=5SHlN934wSA&list=PL5e68lK9hEzd81JLjU2ey6WqODkKB2xFF&index=142
// all credit goes to online tutorials

const generateButton = document.getElementById("generate-button")!
const container = document.getElementById("generate-container")!

generateButton.addEventListener("click", () => {
  for (let i = 0; i < 75; i++) {
    let spark = document.createElement("i")
    spark.classList.add("spark")

    // randomly position the spark elements
    const randomX = ((Math.random() - 0.5) * window.innerWidth) / 1.5
    const randomY = ((Math.random() - 0.5) * window.innerHeight) / 1.5
    spark.style.setProperty("--x", randomX + "px")
    spark.style.setProperty("--y", randomY + "px")

    // random size for the spark element
    const randomSize = Math.random() * 8 + 2
    spark.style.width = randomSize + "px"
    spark.style.height = randomSize + "px"

    container.appendChild(spark)

    // remove spark elements after 2 seconds
    setTimeout(function () {
      spark.remove()
    }, 2000)
  }
})
