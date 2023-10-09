---
layout: default
permalink: /tests/
---

{% for group in site.data.test_urls %}
  <h2>{{ group.groupname }}</h2>
  <ul>
  {% for url in group.urls %}
    <li><a href="{{ url }}">{{ url }}</a></li>
  {% endfor %}
  </ul>
{% endfor %}