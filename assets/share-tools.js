(() => {
  if (document.body.classList.contains("reader-entry-page")) return;
  if (document.querySelector("[data-share-tools]")) return;
  const heading = document.querySelector("main h1");
  if (!heading) return;
  const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
  const title = heading.textContent.trim();
  const tools = document.createElement("aside");
  tools.className = "article-share-tools";
  tools.dataset.shareTools = "true";
  tools.setAttribute("aria-label", "Share this page");
  tools.innerHTML = `
    <strong>Useful? Share this page.</strong>
    <div>
      <button type="button" data-native-share>Share</button>
      <button type="button" data-copy-link>Copy link</button>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener noreferrer">X</a>
    </div>
    <span data-share-status aria-live="polite"></span>
  `;
  const container = heading.closest("section, article");
  if (container) container.insertAdjacentElement("afterend", tools);
  else heading.insertAdjacentElement("afterend", tools);

  const status = tools.querySelector("[data-share-status]");
  const track = (method) => {
    if (typeof window.gtag === "function") window.gtag("event", "content_share", {
      method,
      page_path: window.location.pathname
    });
  };
  tools.querySelector("[data-native-share]").addEventListener("click", async () => {
    if (!navigator.share) {
      status.textContent = "Use Copy link or a social button.";
      return;
    }
    try {
      await navigator.share({ title, url: canonical });
      track("native");
    } catch (error) {
      if (error?.name !== "AbortError") status.textContent = "Sharing is unavailable in this browser.";
    }
  });
  tools.querySelector("[data-copy-link]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(canonical);
      status.textContent = "Link copied.";
      track("copy_link");
    } catch {
      status.textContent = canonical;
    }
  });
  tools.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => track(link.textContent.toLowerCase())));
})();
