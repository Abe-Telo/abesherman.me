const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text || "";
};

const link = ({ label, url }) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;

async function init() {
  const res = await fetch("./data/profile.json");
  const profile = await res.json();

  setText("hero-name", profile.name);
  setText("hero-headline", profile.headline);
  setText("hero-location", profile.location);
  setText("year", new Date().getFullYear());

  const heroLinks = document.getElementById("hero-links");
  heroLinks.innerHTML = profile.links.map(link).join("");

  const about = document.getElementById("about-content");
  about.innerHTML = `
    <p>I’m ${profile.name} — a founder/operator focused on building practical systems that help businesses communicate, sell, and support customers.</p>
    <p>I lead <strong>${profile.roles[0].org}</strong> as ${profile.roles[0].title}, delivering business VoIP and communication workflows.</p>
    <p>Alongside telecom, I build software tools and internal portals that automate billing, onboarding, contracts, and support workflows.</p>
  `;

  const grid = document.getElementById("projects-grid");
  grid.innerHTML = profile.ventures
    .map(
      (venture) => `
      <article class="card">
        <p class="type">${venture.type}</p>
        <h3>${venture.name}</h3>
        <p>${venture.description}</p>
      </article>
    `,
    )
    .join("");

  const skills = document.getElementById("skills-list");
  skills.innerHTML = profile.skills.map((skill) => `<li>${skill}</li>`).join("");

  setText("contact-preferred", profile.contact.preferred);
  setText("contact-notes", profile.contact.notes);

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
