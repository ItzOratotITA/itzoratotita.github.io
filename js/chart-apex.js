const apexForm = document.getElementById("chartForm");
const apexType = document.getElementById("chartType");
const apexLabels = document.getElementById("chartLabels");
const apexValues = document.getElementById("chartValues");
const apexReset = document.getElementById("resetChart");
const apexContainer = document.getElementById("chartContainer");
const apexStatus = document.getElementById("chartStatus");
const apexDataTable = document.getElementById("chartDataTable");

let currentApexChart = null;

async function createApexChart(event, announceSuccess = true) {
  if (event) event.preventDefault();

  try {
    if (typeof ApexCharts !== "function") {
      throw new Error("ApexCharts could not be loaded. Try refreshing the page.");
    }

    const { labels, values } = window.ChartUtility.readChartData(
      apexType.value,
      apexLabels.value,
      apexValues.value,
    );
    const isPie = apexType.value === "pie";

    if (currentApexChart) currentApexChart.destroy();

    currentApexChart = new ApexCharts(apexContainer, {
      chart: {
        type: apexType.value,
        height: 400,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
          export: {
            svg: { filename: "chart" },
            png: { filename: "chart" },
            csv: { filename: "chart" },
          },
        },
      },
      series: isPie ? values : [{ name: "Values", data: values }],
      labels: isPie ? labels : [],
      xaxis: { categories: isPie ? [] : labels },
      legend: { show: isPie },
      dataLabels: { enabled: isPie },
      stroke: { curve: "straight" },
    });

    await currentApexChart.render();
    window.ChartUtility.renderDataTable(apexDataTable, labels, values);
    window.ChartUtility.setStatus(
      apexStatus,
      announceSuccess ? "Chart generated." : "",
      "success",
    );
  } catch (error) {
    console.error(error);
    window.ChartUtility.setStatus(apexStatus, error.message);
  }
}

apexForm.addEventListener("submit", createApexChart);
apexReset.addEventListener("click", () => {
  apexForm.reset();
  createApexChart(null, true);
});

createApexChart(null, false);
