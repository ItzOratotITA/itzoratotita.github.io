---
layout: default
title: SVG Chart Download Disclaimer
description: Disclaimer about exporting ApexCharts charts to SVG
keywords: chart, generator, ApexCharts, SVG, JavaScript, utility, disclaimer
---

# DISCLAIMER

When trying to view the downloaded SVG file, it will often just display a blank, empty canvas.<br><br>
This is because of how ApexCharts handles exporting as SVG:

{:.text-warning}
**Inside the svg file, it nests a HTML document with the actual image inside**.<br>

Browsers and WebViews have no problem displaying these types of SVG, but almost every program (including ones built specifically for vector graphics) that doesn't rely on **frameworks like Electron or Tauri**, such as:

- Inkscape
- Gwenview
- The GIMP

will fail to display the SVG correctly.<br>
Note that every other way of exporting the generated chart **works correctly as of now**.

<a class="btn btn-primary border " href="/utils/charts/">Go Back</a>
