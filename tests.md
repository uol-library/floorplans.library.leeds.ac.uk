---
layout: default
permalink: /tests/
---

{% for group in site.data.test_urls %}
  <h2>{{ group }}</h2>
  <ul>
  {% for url in site.data.test_urls[group] %}
    <li><a href="{{ url }}">{{ url }}</a></li>
  {% endfor %}
  </ul>
{% endfor %}