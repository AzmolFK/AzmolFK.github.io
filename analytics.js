(() => {
  const id = document.querySelector('meta[name="ga4-id"]')?.content?.trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(tag);

  gtag('js', new Date());
  gtag('config', id, {
    send_page_view: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const cleanText = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);

  const nearestProjectName = (el) => {
    const card = el.closest('.project-card, .project, article, .card');
    const heading = card?.querySelector('h3, h2');
    return cleanText(heading);
  };

  const send = (name, params = {}) => {
    if (typeof window.gtag === 'function') {
      gtag('event', name, {
        page_path: window.location.pathname,
        ...params
      });
    }
  };

  document.addEventListener('click', (event) => {
    const el = event.target.closest('a, button');
    if (!el) return;

    if (el.tagName === 'BUTTON') {
      if (/print|save pdf/i.test(cleanText(el))) {
        send('resume_print_click', { link_text: cleanText(el) });
      }
      return;
    }

    const rawHref = el.getAttribute('href') || '';
    const href = el.href || rawHref;
    const linkText = cleanText(el);
    const projectName = nearestProjectName(el);

    if (/resume\.html(?:$|[?#])/i.test(rawHref)) {
      send('resume_open', { link_url: href, link_text: linkText });
      return;
    }

    if (/^mailto:/i.test(rawHref)) {
      send('contact_email_click', { link_url: rawHref, link_text: linkText });
      return;
    }

    if (/linkedin\.com/i.test(href)) {
      send('linkedin_click', { link_url: href, link_text: linkText });
      return;
    }

    if (/github\.com\/AzmolFK\/?$/i.test(href.replace(/[?#].*$/, ''))) {
      send('github_profile_click', { link_url: href, link_text: linkText });
      return;
    }

    if (/github\.com\/AzmolFK\//i.test(href)) {
      send('project_github_click', {
        link_url: href,
        link_text: linkText,
        project_name: projectName
      });
      return;
    }

    if (/doi\.org|papers\.ssrn\.com/i.test(href)) {
      send('publication_click', {
        link_url: href,
        link_text: linkText,
        publication_name: projectName
      });
      return;
    }

    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin && /^https?:$/i.test(url.protocol)) {
        send('outbound_click', { link_url: href, link_text: linkText });
      }
    } catch (_) {}
  });
})();