---
layout: page
title: Projects
permalink: /projects/
---

<div class="projects-grid">
  {% assign sorted_projects = site.projects | sort: "year" | reverse %}
  {% for project in sorted_projects %}
    <div class="project-thumb-link">
      <a href="{{ project.url }}">
        <img class="project-thumb" src="{{ project.thumbnail }}" alt="{{ project.title }}">
        <h3 class="project-title-link">{{ project.title }}</h3>
      </a>
      <div class="project-tags">
        {% if project.type %}
          <a class="project-tag-link" href="?tag={{ project.type | append: "" | uri_escape }}">{{ project.type }}</a>
        {% endif %}
        {% if project.location %}
          <a class="project-tag-link" href="?tag={{ project.location | append: "" | uri_escape }}">{{ project.location }}</a>
        {% endif %}
        {% if project.year %}
          <a class="project-tag-link" href="?tag={{ project.year | append: "" | uri_escape }}">{{ project.year }}</a>
        {% endif %}
      </div>
    </div>
  {% endfor %}
</div>
