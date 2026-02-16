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
  setText("hero-name", `Hey, I'm ${profile.name}`);
  setText("hero-headline", profile.headline);
  setText("hero-location", profile.location);
  setText("year", new Date().getFullYear());

  const heroLinks = document.getElementById("hero-links");
  heroLinks.innerHTML = profile.links.map(link).join("");

  // About
  const about = document.getElementById("about-content");
  about.innerHTML = profile.about.map((p) => `<p>${p}</p>`).join("");

  // Ventures
  const venturesRow = document.getElementById("ventures-row");
  venturesRow.innerHTML = profile.ventures
    .map((v) => {
      const tag = v.url ? "a" : "div";
      const href = v.url ? ` href="${v.url}" target="_blank" rel="noopener noreferrer"` : "";
      return `
      <${tag} class="venture-card"${href}>
        <span class="type">${v.type}</span>
        <h3>${v.name}</h3>
        <p>${v.description}</p>
      </${tag}>
    `;
    })
    .join("");

  // Projects
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

  // Skills
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

  // Contact quick links
  const contactLinks = document.getElementById("contact-links");
  if (contactLinks) {
    const linkedin = profile.links.find((l) => l.label === "LinkedIn");
    const github = profile.links.find((l) => l.label === "GitHub");
    let contactLinksHtml = `<a href="/contact.html">Get in Touch</a>`;
    if (linkedin) {
      contactLinksHtml += `<a class="secondary" href="${linkedin.url}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`;
    }
    if (github) {
      contactLinksHtml += `<a class="secondary" href="${github.url}" target="_blank" rel="noopener noreferrer">GitHub</a>`;
    }
    contactLinks.innerHTML = contactLinksHtml;
  }

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

  // Fade-in animation on scroll
  const fadeEls = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  fadeEls.forEach((el) => observer.observe(el));

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav ul");
  if (toggle && navList) {
    toggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen);
    });
    navList.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navList.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
}

init().catch((err) => {
  console.error("Failed to load profile", err);
});
