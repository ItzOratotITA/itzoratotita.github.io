---
layout: default
title: No-BS Utilities and Personal Projects!
i18n_title: pages.home_title
i18n_description: pages.home_description
description: Landing page of oratot.com, a personal website by Paride, an Italian guy who likes video games and tech. This website hosts cool utilities with no bloat.
keywords: Oratot, Paride, Italian, video games, tech, Minecraft, utilities
---

<img src="/assets/summer_logo_new.avif" alt="The Summer Variant of the Website's Logo" data-i18n-alt="pages.home_logo">

# CIAO!

<div markdown="1" data-i18n-html="pages.home_intro">
Welcome to oratot.com, where you can find cool, free utilities and personal projects with no BS!
This is the personal site of [Paride Totaro, known online as Oratot](/about).
</div>

<p><strong data-i18n="pages.nickname">My nickname is my surname in reverse, not a typo for "orator"!</strong></p>

<div markdown="1" data-i18n-html="pages.home_support">
To support me, consider subscribing to [my YouTube channel](https://www.youtube.com/@ItzOratotITA?sub_confirmation=1)!
</div>

<h1 id="what-i-have-to-offer" data-i18n="pages.home_offer">What I Have To Offer</h1>

<div
  class="d-flex flex-wrap gap-2 my-3"
>
  {% include card.html 
    link="/utils/qrcode"
    text_key="common.qr" aria_key="common.qr_link" alt_key="common.qr_art"
    arialabel="Link to QR Code Generator" 
    img="/assets/qr.png"
    alt="QR Code Pixel Art" 
    pixelart=true 
    text="QR Code Generator" 
    htype="h6" %}
  {% include card.html 
    link="/utils/charts"
    text_key="common.charts" aria_key="common.charts_link" alt_key="common.charts_art"
    arialabel="Link to Chart Generator" 
    img="/assets/chart.png"
    alt="Line Chart / Value Increasing Pixel Art" 
    pixelart=true 
    text="Chart Generator" 
    htype="h6" %}
  {% include card.html 
    link="/utils/nether"
    text_key="common.nether" aria_key="common.nether_link" alt_key="common.nether_art"
    arialabel="Link to Nether Coordinate Calculator/Converter" 
    img="/assets/nether_portal.png"
    alt="Minecraft Nether Portal Texture" 
    pixelart=true 
    text="Nether Coords" 
    htype="h6" %}
  {% include card.html 
    link="/pack"
    aria_key="common.pack_link" alt_key="common.pack_logo"
    arialabel="Link to Oratot's PVP Minecraft Resource Pack" 
    img="/assets/favicon.svg"
    alt="The logo for Oratot's PVP" 
    text="Oratot's<br>PVP" 
    htype="h6" %}
</div>
