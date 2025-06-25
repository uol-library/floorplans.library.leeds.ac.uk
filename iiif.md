---
layout: iiif
permalink: /iiif/
---
<h1>Original images</h1>
{% for library in site.data.iiif %}
  <h2>{{ library.name }}</h2>
  <ul class="iiif-floors">
  {% for plan in library.floors %}
    <li>
{% include iiif-floor.html floor=plan type='original' %}
    </li>
  {% endfor %}
  </ul>
{% endfor %}
<h1>Cropped images</h1>
{% for library in site.data.iiif %}
  <h2>{{ library.name }}</h2>
  <ul class="iiif-floors">
  {% for plan in library.floors %}
    <li>
{% include iiif-floor.html floor=plan type='cropped' %}
    </li>
  {% endfor %}
  </ul>
{% endfor %}
