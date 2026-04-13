(function () {
  'use strict';

  let data = null;

  async function loadData() {
    const resp = await fetch('data.json');
    data = await resp.json();
    initApp();
  }

  function initApp() {
    renderProfileCard();
    renderHome();
    renderResearch();
    renderExperience();
    renderEducation();
    setupNav();
    navigate(location.hash || '#home');
  }

  /* ===== Navigation ===== */
  function setupNav() {
    const links = document.querySelectorAll('.nav__link');
    const hamburger = document.querySelector('.nav__hamburger');
    const menu = document.querySelector('.nav__links');

    links.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('data-page');
        navigate('#' + target);
        menu.classList.remove('open');
      });
    });

    if (hamburger) {
      hamburger.addEventListener('click', () => menu.classList.toggle('open'));
    }

    window.addEventListener('hashchange', () => navigate(location.hash));
    window.addEventListener('scroll', () => {
      document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  function navigate(hash) {
    const page = hash.replace('#', '') || 'home';
    history.replaceState(null, '', '#' + page);

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav__link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('data-page') === page);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ===== Profile Card ===== */
  function renderProfileCard() {
    const p = data.profile;
    const el = document.getElementById('profile-card');
    el.innerHTML = `
      <img src="${sanitizeUrl(p.avatar)}" alt="${esc(p.name)}" class="profile-card__avatar" />
      <h2 class="profile-card__name">${esc(p.name)}</h2>
      <p class="profile-card__title">${esc(p.title)}</p>
      <p class="profile-card__location"><i class="fas fa-map-marker-alt"></i> ${esc(p.location)}</p>
      <div class="profile-card__socials">
        <a href="mailto:${esc(p.email)}" class="social-btn" title="Email"><i class="fas fa-envelope"></i></a>
        ${p.socialLinks.map(s => `<a href="${sanitizeUrl(s.url)}" target="_blank" rel="noopener noreferrer" class="social-btn" title="${esc(s.label)}"><i class="${esc(s.icon)}"></i></a>`).join('')}
      </div>
    `;
  }

  /* ===== Home Page ===== */
  function renderHome() {
    const p = data.profile;
    const el = document.getElementById('content-home');
    el.innerHTML = `
      <h1 class="section-title">Welcome!</h1>
      <p class="section-subtitle">${p.bio}</p>
      <p style="color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.8;">${p.about}</p>
      <p style="color: #22c55e; margin-bottom: 2rem;">${esc(p.publicationSummary)}</p>
      ${p.phdNote ? `<div class="phd-banner"><i class="fas fa-rocket" style="margin-right: 0.5rem;"></i>We are actively providing AI services! Reach out at <a href="mailto:${esc(p.email)}" style="color: #ffffff; font-weight: 700; text-decoration: underline; text-underline-offset: 3px;">${esc(p.email)}</a> or visit <a href="https://alphabytesai.com/" target="_blank" rel="noopener noreferrer" style="color: #ffffff; font-weight: 700; text-decoration: underline; text-underline-offset: 3px;">alphabytesai.com</a></div>` : ''}
      <h2 class="section-heading"><i class="fas fa-newspaper"></i> News</h2>
      <div id="news-list"></div>
    `;
    renderNews();
  }

  function renderNews() {
    const el = document.getElementById('news-list');
    el.innerHTML = data.news.map(n => `
      <div class="news-item">
        <span class="news-date">${esc(n.date)}</span>
        <div class="news-text">${n.text} <a href="${sanitizeUrl(n.link)}" target="_blank" rel="noopener noreferrer">${esc(n.linkText)}</a></div>
      </div>
    `).join('');
  }

  /* ===== Research Page ===== */
  function renderResearch() {
    const r = data.research;
    const el = document.getElementById('content-research');
    el.innerHTML = `
      <h1 class="section-title">Research</h1>
      <h2 class="section-heading"><i class="fas fa-flask"></i> Areas of Interest</h2>
      <div class="interests-grid">
        ${r.interests.map(i => `<span class="interest-tag">${esc(i)}</span>`).join('')}
      </div>
      <h2 class="section-heading"><i class="fas fa-file-alt"></i> Publications</h2>
      ${r.publications.map(renderPubCard).join('')}
      <p style="text-align: right; color: var(--text-muted); font-size: 0.8rem; font-style: italic; margin-top: 1rem;">${esc(r.footnote)}</p>
    `;
  }

  function renderPubCard(pub) {
    const statusClass = pub.status === 'published' ? 'badge--published' : 'badge--accepted';
    const typeClass = pub.type === 'Journal' ? 'badge--journal' : 'badge--conference';
    return `
      <div class="pub-card">
        <div class="pub-card__title"><a href="${sanitizeUrl(pub.titleUrl)}" target="_blank" rel="noopener noreferrer">${esc(pub.title)}</a></div>
        <div class="pub-card__authors">${pub.authors}</div>
        <div class="pub-card__venue">${pub.venueUrl ? `<a href="${sanitizeUrl(pub.venueUrl)}" target="_blank" rel="noopener noreferrer">${esc(pub.venue)}</a>` : esc(pub.venue)}</div>
        <div class="pub-card__meta">
          <span class="badge ${typeClass}">${esc(pub.type)}</span>
          <span class="badge ${statusClass}">${esc(pub.status)}</span>
          ${pub.codeUrl ? `<a href="${sanitizeUrl(pub.codeUrl)}" target="_blank" rel="noopener noreferrer" class="code-link"><i class="fab fa-github"></i> ${esc(pub.codeLabel)}</a>` : ''}
        </div>
      </div>
    `;
  }

  /* ===== Experience Page ===== */
  function renderExperience() {
    const exp = data.experience;
    const el = document.getElementById('content-experience');
    el.innerHTML = `
      <h1 class="section-title">Experience</h1>
      <h2 class="section-heading"><i class="fas fa-briefcase"></i> Professional Experience</h2>
      ${exp.professional.map(renderExpCard).join('')}
      ${exp.teaching.length ? `
        <h2 class="section-heading"><i class="fas fa-chalkboard-teacher"></i> Teaching Experience</h2>
        ${exp.teaching.map(renderTeachCard).join('')}
      ` : ''}
    `;
  }

  function renderExpCard(job) {
    return `
      <div class="exp-card">
        <div class="exp-card__inner">
          <div class="exp-card__role">${esc(job.role)}</div>
          <div class="exp-card__company"><a href="${sanitizeUrl(job.companyUrl)}" target="_blank" rel="noopener noreferrer">${esc(job.company)}</a> — ${esc(job.location)}</div>
          <div class="exp-card__period"><i class="far fa-calendar-alt"></i> ${esc(job.period)}</div>
          ${job.highlights.length ? `
            <ul class="exp-card__highlights">
              ${job.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderTeachCard(t) {
    return `
      <div class="card">
        <div style="font-weight: 600;">${esc(t.role)}</div>
        <div style="color: var(--text-secondary); font-size: 0.9rem;">
          Project: <a href="${sanitizeUrl(t.projectUrl)}" target="_blank" rel="noopener noreferrer">${esc(t.project)}</a><br/>
          Course: ${esc(t.course)}<br/>
          Organized by: <span style="color: var(--accent);">${esc(t.organizer)}</span>
        </div>
      </div>
    `;
  }

  /* ===== Education Page ===== */
  function renderEducation() {
    const el = document.getElementById('content-education');
    el.innerHTML = `
      <h1 class="section-title">Education</h1>
      ${data.education.map(renderEduCard).join('')}
    `;
  }

  function renderEduCard(edu) {
    const iconClass = edu.icon === 'graduation-cap' ? 'fas fa-graduation-cap' : 'fas fa-award';
    return `
      <div class="edu-card">
        <div class="edu-card__degree"><i class="${iconClass}"></i> ${esc(edu.degree)}</div>
        <div class="edu-card__institution">
          ${edu.institutionUrl ? `<a href="${sanitizeUrl(edu.institutionUrl)}" target="_blank" rel="noopener noreferrer">${esc(edu.institution)}</a>` : esc(edu.institution)}
          — ${esc(edu.location)}
        </div>
        <ul class="edu-card__details">
          <li><strong>GPA:</strong> ${esc(edu.gpa)}</li>
          ${edu.credits ? `<li><strong>Credits:</strong> ${esc(edu.credits)}</li>` : ''}
          ${edu.thesis ? `
            <li><strong>Thesis:</strong> ${esc(edu.thesis.title)} <a href="${sanitizeUrl(edu.thesis.paperUrl)}" target="_blank" rel="noopener noreferrer">[paper]</a></li>
            <li><strong>Supervisor:</strong> <a href="${sanitizeUrl(edu.thesis.supervisorUrl)}" target="_blank" rel="noopener noreferrer">${esc(edu.thesis.supervisor)}</a>, ${esc(edu.thesis.supervisorTitle)}</li>
          ` : ''}
        </ul>
        ${edu.courseworks ? `
          <div style="margin-top: 0.75rem;">
            <strong style="font-size: 0.88rem;">Selected Courseworks:</strong>
            <div class="coursework-grid">
              ${edu.courseworks.map(c => `<span class="coursework-tag">${esc(c)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== Helpers ===== */
  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function sanitizeUrl(url) {
    if (!url) return '#';
    try {
      const parsed = new URL(url, location.origin);
      if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
        return parsed.href;
      }
    } catch (e) {
      // relative URL
      if (/^[a-zA-Z0-9.\-_/]+$/.test(url)) return url;
    }
    return '#';
  }

  document.addEventListener('DOMContentLoaded', loadData);
})();
