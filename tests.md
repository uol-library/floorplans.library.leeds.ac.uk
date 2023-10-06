---
layout: default
permalink: /tests/
---

<ul>
{% for url in site.data.primo_urls %}
  <li><a href="{{ url }}">{{ url }}</a></li>
{% endfor %}
</ul>