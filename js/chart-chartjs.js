const chartJsForm = document.getElementById("chartForm");
const chartJsType = document.getElementById("chartType");
const chartJsLabels = document.getElementById("chartLabels");
const chartJsValues = document.getElementById("chartValues");
const chartJsReset = document.getElementById("resetChart");
const chartJsCanvas = document.getElementById("chartCanvas");
const chartJsDownload = document.getElementById("downloadChart");
const chartJsStatus = document.getElementById("chartStatus");
const chartJsDataTable = document.getElementById("chartDataTable");

let currentChartJsChart = null;

function updateChartJsDownload() {
  chartJsDownload.href = chartJsCanvas.toDataURL("image/png");
  chartJsDownload.classList.remove("d-none");
}

function invalidateChartJsDownload() {
  chartJsDownload.removeAttribute("href");
  chartJsDownload.classList.add("d-none");
}

function createChartJsChart(event, announceSuccess = true) {
  if (event) event.preventDefault();

  try {
    if (typeof Chart !== "function") {
      throw new Error("Chart.js could not be loaded. Try refreshing the page.");
    }

    const { labels, values } = window.ChartUtility.readChartData(
      chartJsType.value,
      chartJsLabels.value,
      chartJsValues.value,
    );

    if (currentChartJsChart) currentChartJsChart.destroy();

    currentChartJsChart = new Chart(chartJsCanvas, {
      type: chartJsType.value,
      data: {
        labels,
        datasets: [{ label: "Values", data: values }],
      },
      options: {
        responsive: true,
        animation: false,
        plugins: { legend: { display: chartJsType.value === "pie" } },
        scales:
          chartJsType.value === "pie" ? {} : { y: { beginAtZero: true } },
      },
    });

    updateChartJsDownload();
    window.ChartUtility.renderDataTable(chartJsDataTable, labels, values);
    window.ChartUtility.setStatus(
      chartJsStatus,
      announceSuccess ? "Chart generated." : "",
      "success",
    );
  } catch (error) {
    console.error(error);
    window.ChartUtility.setStatus(chartJsStatus, error.message);
  }
}

chartJsForm.addEventListener("submit", createChartJsChart);
chartJsForm.addEventListener("input", invalidateChartJsDownload);
chartJsDownload.addEventListener("click", updateChartJsDownload);
chartJsReset.addEventListener("click", () => {
  chartJsForm.reset();
  invalidateChartJsDownload();
  createChartJsChart(null, true);
});

createChartJsChart(null, false);
