---
layout: default
title: SVG Chart Download Disclaimer
i18n_title: charts.svg_title
description: Disclaimer about exporting ApexCharts charts to SVG
i18n_description: charts.svg_description
keywords: chart, generator, ApexCharts, SVG, JavaScript, utility, disclaimer
---

<h1 data-i18n="charts.disclaimer_heading">DISCLAIMER</h1>

<p data-i18n-html="charts.svg_explanation">When trying to view the downloaded SVG file, it will often just display a blank, empty canvas.<br><br>
This is because of how ApexCharts handles exporting as SVG:</p>

<p class="text-warning" data-i18n-html="charts.svg_nested_html"><strong>Inside the svg file, it nests a HTML document with the actual image inside</strong>.<br></p>

<p data-i18n-html="charts.svg_viewers">Browsers and WebViews have no problem displaying these types of SVG, but almost every program (including ones built specifically for vector graphics) that doesn't rely on <strong>frameworks like Electron or Tauri</strong>, such as:</p>

<ul>
    <li>Inkscape</li>
    <li>Gwenview</li>
    <li>The GIMP</li>
</ul>

<p data-i18n-html="charts.svg_export_note">will fail to display the SVG correctly.<br>
Note that every other way of exporting the generated chart <strong>works correctly as of now</strong>.</p>

<a class="btn btn-primary border " href="/utils/charts/" data-i18n="charts.go_back">Go Back</a>
