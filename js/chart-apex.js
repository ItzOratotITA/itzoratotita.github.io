const apexForm = document.getElementById("chartForm");
const apexType = document.getElementById("chartType");
const apexLabels = document.getElementById("chartLabels");
const apexValues = document.getElementById("chartValues");
const apexReset = document.getElementById("resetChart");
const apexContainer = document.getElementById("chartContainer");
const apexStatus = document.getElementById("chartStatus");
const apexDataTable = document.getElementById("chartDataTable");
const apexT = window.ChartUtility.t;

let currentApexChart = null;

async function createApexChart(event, announceSuccess = true) {
  if (event) event.preventDefault();

  try {
    if (typeof ApexCharts !== "function") {
      throw new Error(
        apexT(
          "charts.apex_unavailable",
          "ApexCharts could not be loaded. Try refreshing the page.",
        ),
      );
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
        defaultLocale: "site",
        locales: [
          {
            name: "site",
            options: {
              months: apexT(
                "charts.months",
                "January,February,March,April,May,June,July,August,September,October,November,December",
              ).split(","),
              shortMonths: apexT(
                "charts.short_months",
                "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",
              ).split(","),
              days: apexT(
                "charts.days",
                "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
              ).split(","),
              shortDays: apexT(
                "charts.short_days",
                "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
              ).split(","),
              toolbar: {
                exportToSVG: apexT("charts.download_svg", "Download SVG"),
                exportToPNG: apexT("charts.download_png", "Download PNG"),
                exportToCSV: apexT("charts.download_csv", "Download CSV"),
                menu: apexT("charts.menu", "Menu"),
                selection: apexT("charts.selection", "Selection"),
                selectionZoom: apexT("charts.selection_zoom", "Selection Zoom"),
                zoomIn: apexT("charts.zoom_in", "Zoom In"),
                zoomOut: apexT("charts.zoom_out", "Zoom Out"),
                pan: apexT("charts.pan", "Panning"),
                reset: apexT("charts.reset_zoom", "Reset Zoom"),
              },
            },
          },
        ],
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
            csv: {
              filename: "chart",
              headerCategory: apexT("charts.csv_category", "category"),
              headerValue: apexT("charts.csv_value", "value"),
            },
          },
        },
      },
      series: isPie
        ? values
        : [{ name: apexT("charts.values", "Values"), data: values }],
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
      announceSuccess ? apexT("charts.generated", "Chart generated.") : "",
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
