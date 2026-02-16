const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text || "";
};

const link = ({ label, url }) =>
  `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;

async function init() {
  const res = await fetch("./data/profile.json");
  const profile = await res.json();

  // Hero
  setText("hero-name", profile.name);
  setText("hero-headline", profile.headline);
  setText("hero-location", profile.location);
  setText("year", new Date().getFullYear());

  const heroLinks = document.getElementById("hero-links");
  heroLinks.innerHTML = profile.links.map(link).join("");

  // About — rich multi-paragraph
  const about = document.getElementById("about-content");
  about.innerHTML = profile.about.map((p) => `<p>${p}</p>`).join("");

  // Projects — detailed cards with status and links
  const grid = document.getElementById("projects-grid");
  grid.innerHTML = profile.projects
    .map((project) => {
      const linksHtml =
        project.links && project.links.length
          ? `<div class="card-links">${project.links
              .map(
                (url) =>
                  `<a href="${url}" target="_blank" rel="noopener noreferrer">${new URL(url).hostname.replace("www.", "")}</a>`
              )
              .join("")}</div>`
          : "";
      return `
      <article class="card">
        <span class="status">${project.status}</span>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        ${linksHtml}
      </article>
    `;
    })
    .join("");

  // Skills — categorized grid
  const skillsGrid = document.getElementById("skills-grid");
  skillsGrid.innerHTML = profile.skillCategories
    .map(
      (cat) => `
      <div class="skill-card">
        <h3>${cat.category}</h3>
        <ul>${cat.skills.map((s) => `<li>${s}</li>`).join("")}</ul>
      </div>
    `
    )
    .join("");

  // Contact
  setText("contact-preferred", profile.contact.preferred);
  setText("contact-notes", profile.contact.notes);

  // Structured data (JSON-LD)
  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: "https://abesherman.me",
    sameAs: profile.links
      .map((l) => l.url)
      .filter((u) => /github\.com|linkedin\.com/.test(u)),
    jobTitle: profile.roles[0].title,
    worksFor: {
      "@type": "Organization",
      name: profile.roles[0].org,
    },
  });
  document.head.appendChild(schema);
}

init().catch((err) => {
  console.error("Failed to load profile", err);
});
