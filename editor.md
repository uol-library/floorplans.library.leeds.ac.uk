---
layout: floorplans
mapclass: refactor-editor
permalink: /edit/
---

<div id="geojson-input" class="dialog-container" aria-labelledby="geojson-input-title" aria-describedby="geojson-input-description" aria-hidden="true">
    <div class="dialog-overlay" data-a11y-dialog-hide></div>
    <article role="document" class="dialog-content">
        <header>
            <button type="button" class="button dialog-close" data-a11y-dialog-hide aria-label="Close dialog">&times;</button>
            <h2 id="geojson-input-title">GeoJSON</h2>
            <p class="visuallyhidden" id="geojson-input-description">GeoJSON input / output</p>
        </header>
        <textarea id="geojson-input-textarea"></textarea>
        <button id="geojson-input-load">Load GeoJSON</button>
    </article>
</div>