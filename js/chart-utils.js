(function createChartUtilities() {
  function t(key, fallback, params = {}) {
    return (
      window.SiteI18n?.t(key, fallback, params) ??
      fallback.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match)
    );
  }

  function readChartData(type, rawLabels, rawValues) {
    const labels = rawLabels.split(",").map((label) => label.trim());
    const valueParts = rawValues.split(",").map((value) => value.trim());

    if (!rawLabels.trim() || !rawValues.trim()) {
      throw new Error(
        t("charts.empty_data", "Insert at least one label and one value."),
      );
    }
    if (labels.some((label) => !label) || valueParts.some((value) => !value)) {
      throw new Error(
        t(
          "charts.blank_entries",
          "Labels and values cannot contain blank entries.",
        ),
      );
    }
    if (labels.length !== valueParts.length) {
      throw new Error(
        t(
          "charts.mismatched_data",
          "The number of labels must match the number of values.",
        ),
      );
    }

    const values = valueParts.map(Number);
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error(
        t("charts.invalid_number", "Every value must be a finite number."),
      );
    }

    if (type === "pie") {
      if (values.some((value) => value < 0)) {
        throw new Error(
          t("charts.negative_pie", "Pie chart values cannot be negative."),
        );
      }
      if (!values.some((value) => value > 0)) {
        throw new Error(
          t(
            "charts.zero_pie",
            "A pie chart needs at least one value above zero.",
          ),
        );
      }
    }

    return { labels, values };
  }

  function setStatus(element, message = "", kind = "danger") {
    element.replaceChildren();
    if (!message) return;

    const alert = document.createElement("div");
    alert.className = `alert alert-${kind}`;
    alert.textContent = message;

    if (kind === "success") {
      alert.classList.add("alert-dismissible", "fade", "show");
      const dismissButton = document.createElement("button");
      dismissButton.type = "button";
      dismissButton.className = "btn-close";
      dismissButton.dataset.bsDismiss = "alert";
      dismissButton.setAttribute(
        "aria-label",
        t("charts.dismiss_status", "Dismiss status"),
      );
      alert.append(dismissButton);
    }

    element.append(alert);
  }

  function renderDataTable(table, labels, values) {
    const caption = document.createElement("caption");
    caption.className = "visually-hidden";
    caption.textContent = t(
      "charts.table_caption",
      "Labels and values used in the generated chart",
    );

    const header = document.createElement("tr");
    for (const text of [
      t("charts.label", "Label"),
      t("charts.value", "Value"),
    ]) {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = text;
      header.append(cell);
    }

    const head = document.createElement("thead");
    head.append(header);
    const body = document.createElement("tbody");

    labels.forEach((label, index) => {
      const row = document.createElement("tr");
      const labelCell = document.createElement("th");
      labelCell.scope = "row";
      labelCell.textContent = label;
      const valueCell = document.createElement("td");
      valueCell.textContent = String(values[index]);
      row.append(labelCell, valueCell);
      body.append(row);
    });

    table.replaceChildren(caption, head, body);
    table.hidden = false;
    table.closest("details").hidden = false;
  }

  window.ChartUtility = { t, readChartData, renderDataTable, setStatus };
})();
