# Nakamoto Research Marketing Stack

Free local tools for traffic growth and retention:

- Matomo analytics: `http://localhost:8081`
- listmonk newsletter: `http://localhost:9000`
- n8n automation: `http://localhost:5678`
- Uptime Kuma monitoring: `http://localhost:3001`

Extended tools are available when needed:

- Umami simple analytics: `http://localhost:3002`
- GoAccess log analytics: `http://localhost:7890`
- Metabase dashboards: `http://localhost:3003`
- Baserow content calendar: `http://localhost:3004`
- Directus CMS/API: `http://localhost:8055`
- Ghost publishing/newsletter CMS: `http://localhost:2368`
- Keila email campaigns: `http://localhost:4000`
- LimeSurvey reader surveys: `http://localhost:8082`
- Docmost internal wiki: `http://localhost:3005`
- BookStack internal wiki: `http://localhost:6875`
- Rallly scheduling: `http://localhost:3006`
- GoToSocial community server: `http://localhost:8083`
- Shlink short links API: `http://localhost:8084`
- Shlink short links UI: `http://localhost:8085`

Apache Foundation tools are available when needed:

- Apache Superset dashboards: `http://localhost:8088`
- Apache Airflow workflows: `http://localhost:8086`
- Apache Solr search: `http://localhost:8983`
- Apache Answer Q&A/community help center: `http://localhost:9080`

## Start

Run:

```powershell
.\marketing\start-marketing-stack.ps1
```

## Start Extended Tools

Run:

```powershell
.\marketing\start-extended-tools.ps1
```

Stop only the extended tools:

```powershell
.\marketing\stop-extended-tools.ps1
```

The extended tools are intentionally separate because they download more images and use more memory than the core stack.

## Start Apache Tools

Run:

```powershell
.\marketing\start-apache-tools.ps1
```

Stop only the Apache tools:

```powershell
.\marketing\stop-apache-tools.ps1
```

Use Apache Superset for dashboards, Apache Airflow for repeatable operations, Apache Solr for future site search experiments, and Apache Answer for a public Q&A or internal help center.

## Temporary Public Access

Run:

```powershell
.\marketing\start-public-tunnels.ps1
```

This creates temporary Cloudflare tunnel links for the local tools. The links are protected by a basic login stored in `marketing/.env` as `PUBLIC_GATEWAY_USER` and `PUBLIC_GATEWAY_PASSWORD`.

For Uptime Kuma, use the printed URL with `/dashboard` if the root page asks for login again after redirect.

Stop public access:

```powershell
.\marketing\stop-public-tunnels.ps1
```

The script creates `marketing/.env` from `.env.example` if it does not exist. Change those passwords before putting the stack on a public server.

## What Each Tool Does

- Matomo shows top pages, search traffic, referrers, returning visitors, and engagement.
- listmonk runs email newsletters like a daily crypto brief.
- n8n can automate daily research, RSS checks, social reminders, and report tasks.
- Uptime Kuma watches `https://nakamatoresearch.com/` and alerts you if the site goes down.
- Umami provides a simpler analytics dashboard beside Matomo.
- GoAccess can read server logs if the site moves to Apache, Nginx, or VPS hosting.
- Metabase turns traffic, newsletter, and content data into dashboards.
- Baserow tracks article ideas, sources, SEO tasks, and publishing status.
- Directus can become a CMS/admin layer if the static site grows into a database-backed product.
- Ghost is a publishing and newsletter CMS for experiments separate from the static site.
- Keila is another email campaign tool if listmonk does not fit a workflow.
- LimeSurvey collects reader feedback and content requests.
- Docmost and BookStack store internal operations, SEO playbooks, and editorial standards.
- Rallly helps schedule content planning, interviews, and community sessions.
- GoToSocial is the lightweight community/social option.
- Shlink creates tracked short links for social sharing.
- Apache Superset is a dashboard tool for traffic, newsletter, and content performance reporting.
- Apache Airflow can run repeatable daily operations and editorial automation.
- Apache Solr can power fast search if the site grows beyond static page navigation.
- Apache Answer can become a reader Q&A, community support, or internal knowledge base.

## First Setup Checklist

1. Open Matomo and create the `nakamatoresearch.com` site.
2. Copy the Matomo tracking script into the website only after you confirm you want analytics on the live site.
3. Open listmonk and create lists for `Daily Crypto Brief` and `Weekly Research Digest`.
4. Open n8n and create workflows for news-source checks, sitemap checks, and daily publishing reminders.
5. Open Uptime Kuma and add monitors for the homepage, sitemap, news page, and feed.

## Safety

Keep this local unless you are ready to secure it with a domain, HTTPS, strong passwords, firewall rules, backups, and email provider settings.

## Troubleshooting

If Docker Desktop is open but commands return an internal engine error, close Docker Desktop, run `wsl --shutdown`, reopen Docker Desktop, wait one or two minutes, then start the stack again.
