---
layout: iiif
permalink: /iiif/
---
{% for library in site.data.iiif %}
  <h2>{{ library.name }}</h2>
  <ul class="iiif-floors">
  {% for plan in library.floors %}
    <li>
{% include iiif-floor.html floor=plan %}
    </li>
  {% endfor %}
  </ul>
{% endfor %}
</div>