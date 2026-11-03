// Builds the static portfolio page: node build/build.mjs  ->  ../index.html
// Content lives in build/content.json (timeline entries + projects with case studies),
// styles in build/style.css, hand-written blocks in build/*.html.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(here, f), 'utf8');
const { entries, projects } = JSON.parse(read('content.json'));
const css = read('style.css');
const header = read('header.html');
const outside = read('outside.html');

const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tileBg = (c) => `background:${c};`;
const logoTile = 'background:#fff; border:1px solid var(--line); padding:6px 8px;';

function tile(t) {
  if (!t.logo) return `<div class="tile" style="${esc(t.tileStyle)}">${esc(t.mono)}</div>`;
  const style = t.logoBg ? `background:${t.logoBg}; padding:7px;` : logoTile;
  return `<div class="tile" style="${style}"><img src="${esc(t.logo)}" alt="${esc(t.org)}" loading="lazy"></div>`;
}

function entry(t) {
  const partners = (t.partners || []).length
    ? `<div class="partners">${t.partners.map((p) => `<span class="pchip" style="${esc(p.style)}" title="${esc(p.label)}">${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.label)}" loading="lazy">` : esc(p.text)}</span>`).join('')}</div>`
    : '';
  const courses = (t.courses || []).length
    ? `<dl class="courses">${t.courses.map((c) => `<dt>${esc(c.g)}</dt><dd>${esc(c.items)}</dd>`).join('')}</dl>`
    : '';
  const links = (t.links || []).map((l) => `<a href="#project-${esc(l.id)}">${esc(l.label)} →</a>`).join('');
  return `      <div class="tl-row">
        <div class="tl-date">${esc(t.date)}</div>
        <div class="tiles">${tile(t)}</div>
        <div class="tl-text">
          <b>${esc(t.title)}</b><span class="sub">${esc(t.org)}</span>${partners}
          <div>${esc(t.text)}</div>${courses}
          ${links ? `<div class="tl-links">${links}</div>` : ''}
        </div>
      </div>`;
}

function card(p) {
  return `      <a class="pcard" href="#project-${esc(p.id)}">
        <div class="ptop"><span class="pcat">${esc(p.category)}</span><span class="pyear">${esc(p.year)}</span></div>
        <div class="ptitle">${esc(p.title)}</div>
        <div class="pdesc">${esc(p.summary)}</div>
        <div class="ptags">${p.tech.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="pmore">Read more →</div>
      </a>`;
}

function caseStudy(p) {
  const d = p.d;
  const paras = (arr) => arr.map((x) => `<p>${esc(x)}</p>`).join('');
  const body = d
    ? `<div class="cs"><h4>Problem</h4>${paras(d.problem)}</div>
        <div class="cs"><h4>State of the art</h4>${paras(d.stateOfArt)}</div>
        <div class="cs"><h4>My contribution</h4><ul>${d.contribution.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div class="cs"><h4>Technologies</h4><dl class="tech">${d.technologies.map((r) => `<dt>${esc(r.k)}</dt><dd>${esc(r.v)}</dd>`).join('')}</dl></div>
        <div class="cs"><h4>Outcome</h4>${paras(d.outcome)}</div>`
    : `<div class="cs"><h4>Technologies</h4><p>${esc(p.tech.join(' · '))}</p></div>`;
  return `    <article class="study" id="study-${esc(p.id)}" hidden>
      <div class="panel-head"><span>${esc(p.category)}</span><a class="close" href="#projects">Close ✕</a></div>
      <div class="panel-body">
        <h3>${esc(p.title)}</h3>
        <p class="summary">${esc(p.summary)}</p>
        <div class="facts"><span><b>Year</b> ${esc(p.year)}</span><span><b>Context</b> ${esc(p.context)}</span><span><b>Role</b> ${esc(p.role)}</span></div>
        ${body}
      </div>
    </article>`;
}

const school = entries.filter((t) => t.kind !== 'work');
const work = entries.filter((t) => t.kind === 'work');

const extraCss = `
  .collab { margin:44px 0 0; padding:30px 28px; border:1px solid var(--line); border-radius:14px; background:var(--soft);
    display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
  .collab h2 { margin:0 0 6px; }
  .collab p { margin:0; color:var(--body); max-width:520px; }
  .collab .icons a { padding:8px 16px; font-size:15px; }
  .collab .icons a.primary { background:var(--link); color:#fff; border-color:var(--link); }
  .collab .icons a.primary:hover { background:var(--link-hover); color:#fff; }
  [hidden] { display:none !important; }
  a.pcard { text-decoration:none; color:inherit; }
  a.pcard:hover { text-decoration:none; }
  a.close { text-decoration:none; display:inline-block; }
  .tl-links a { cursor:pointer; }
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mehdi Djerboua — AI Engineer</title>
<meta name="description" content="Mehdi Djerboua — AI engineer, M.Sc. in Artificial Intelligence (CNAM Paris). Digital twins, local LLMs, multi-agent systems, embedded and web projects.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<style>${css}${extraCss}</style>
</head>
<body>
<div class="col">
  ${header}

  <h2>Education &amp; internships</h2>
  <div class="tl">
${school.map(entry).join('\n')}
  </div>

  <h2 id="projects">Projects</h2>
  <div class="pgrid">
${projects.map(card).join('\n')}
  </div>

  <h2>Other experience</h2>
  <div class="tl">
${work.map(entry).join('\n')}
  </div>

  <h2>Outside work</h2>
  ${outside}

  <section class="collab" id="contact">
    <div>
      <h2>Have a project idea?</h2>
      <p>I'm open to collaborations, freelance work and research projects in AI, data and software. Tell me about your idea.</p>
    </div>
    <div class="icons">
      <a class="primary" href="mailto:djerbouame@gmail.com?subject=Project%20idea">Contact me</a>
      <a href="https://www.linkedin.com/in/mehdi-amine-djerboua-34a72831b/" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </section>

  <footer>Mehdi Djerboua · Paris · <a href="mailto:djerbouame@gmail.com">djerbouame@gmail.com</a> · +33 6 44 97 41 39</footer>
</div>

<!-- Case studies: plain HTML, opened by #project-<id> links -->
<div class="overlay" id="overlay" hidden>
  <div class="panel" role="dialog" aria-modal="true" aria-label="Project case study">
${projects.map(caseStudy).join('\n')}
  </div>
</div>

<script>
(function () {
  var overlay = document.getElementById('overlay');
  var panel = overlay.querySelector('.panel');
  var open = null;
  function sync() {
    var m = /^#project-([a-z0-9-]+)$/.exec(location.hash);
    var el = m && document.getElementById('study-' + m[1]);
    if (open) open.hidden = true;
    open = el || null;
    if (open) { open.hidden = false; panel.scrollTop = 0; }
    overlay.hidden = !open;
    document.body.classList.toggle('lock', !!open);
  }
  function close() { if (open) history.pushState(null, '', location.pathname + location.search); sync(); }
  window.addEventListener('hashchange', sync);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
    if (e.target.closest('a.close')) { e.preventDefault(); close(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  sync();
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(here, '..', 'index.html'), html);
console.log('index.html written:', html.length, 'bytes,', projects.length, 'projects,', entries.length, 'entries');
