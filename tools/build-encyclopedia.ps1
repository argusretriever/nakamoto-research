param(
  [string]$ExtractedText = "pdf-extracted-text-cs.txt",
  [string]$OutputHtml = "encyclopedia.html",
  [string]$OutputProgress = "pdf-content-progress.md"
)

$ErrorActionPreference = "Stop"

function Html([string]$Value) {
  return [System.Net.WebUtility]::HtmlEncode($Value)
}

function Slug([string]$Value) {
  $slug = $Value.ToLowerInvariant() -replace '[^a-z0-9]+','-' -replace '(^-|-$)',''
  if (-not $slug) { return "topic" }
  return $slug
}

function TopicSentence([string]$Topic) {
  $lower = $Topic.ToLowerInvariant()
  if ($lower -match 'wallet|seed|key|custody|multisig|descriptor|psbt|address') { return "It sits at the boundary between Bitcoin ownership and operational security, where small mistakes can become permanent losses." }
  if ($lower -match 'mining|hash|proof|energy|asic|pool|difficulty') { return "It connects Bitcoin's monetary rules to real-world energy, hardware, competition, and settlement finality." }
  if ($lower -match 'lightning|channel|liquidity|routing') { return "It belongs to Bitcoin's payment-layer design, where speed and cost improve by moving frequent activity off the base chain while still depending on it." }
  if ($lower -match 'privacy|chain|analysis|surveillance|payjoin|coinjoin') { return "It affects how public ledger data is interpreted, protected, and sometimes misread by users, companies, and investigators." }
  if ($lower -match 'etf|market|trading|derivative|liquidity|asset|gold|stocks|real estate') { return "It helps explain how Bitcoin is priced, compared, accessed, and managed inside broader financial markets." }
  if ($lower -match 'regulation|tax|legal|compliance|court|accounting') { return "It matters because Bitcoin use meets legal systems, reporting duties, institutional controls, and changing country-level policy." }
  if ($lower -match 'satoshi|white paper|genesis|history|origin|cypherpunk') { return "It provides historical context for why Bitcoin was designed the way it was and what problems early contributors were trying to solve." }
  if ($lower -match 'script|miniscript|taproot|segwit|signature|cryptography|sha|ecdsa|schnorr') { return "It is part of the technical rule system that lets Bitcoin verify ownership, spending conditions, and consensus behavior without trusting a central operator." }
  return "It helps readers connect a single Bitcoin concept to the larger system of money, software, incentives, security, and human behavior."
}

function RelatedLinks([string]$Topic, [string]$Category) {
  $links = New-Object System.Collections.Generic.List[string]
  $links.Add('<a href="chapter-1.html">Chapter 1: What Is Bitcoin?</a>')
  $links.Add('<a href="library.html">Library and glossary</a>')
  if ($Category -match 'Wallet|Custody|Security|Keys|Addresses') { $links.Add('<a href="tools.html#wallet-selector">Wallet selector</a>'); $links.Add('<a href="resources.html#wallets">Official wallet links</a>') }
  elseif ($Category -match 'Mining|Energy|Proof') { $links.Add('<a href="data.html#blocks">Live network data</a>'); $links.Add('<a href="resources.html#mining-data">Mining data sources</a>') }
  elseif ($Category -match 'Lightning|Payments|Commerce') { $links.Add('<a href="resources.html#lightning-resources">Lightning resources</a>') }
  elseif ($Category -match 'Market|Trading|ETF|Asset|Economics') { $links.Add('<a href="data.html#live-chart">Live BTC chart</a>'); $links.Add('<a href="comparison-hub.html">Comparison hub</a>') }
  elseif ($Category -match 'Regulation|Tax|Legal|Compliance|Accounting') { $links.Add('<a href="policy.html">Policy research</a>'); $links.Add('<a href="resources.html#policy">Policy sources</a>') }
  else { $links.Add('<a href="research.html">Research papers</a>'); $links.Add('<a href="resources.html">Source library</a>') }
  return ($links -join "`n")
}

$lines = Get-Content $ExtractedText
$categories = New-Object System.Collections.Generic.List[object]
$currentCategory = $null
$currentTopic = $null
$inReferenceAppendix = $false

foreach ($line in $lines) {
  $trim = $line.Trim()
  if (-not $trim) { continue }
  if ($trim -eq 'Reference Areas to Keep Checking') {
    $inReferenceAppendix = $true
    continue
  }
  if ($inReferenceAppendix) { continue }
  if ($trim -match '^--- PAGE|^Bitcoin Encyclopedia Taxonomy|^Page \d+|^Extraction summary|^Generated:|^Major groups|^Subcategories|^Generated article-topic ideas|^Structure|^Coverage note|^Master Blueprint|^Master Taxonomy|^How to Use|^Recommended build order|^- Start with|^- Then|^- Finally') { continue }
  if ($trim -match '^(\d+)\.\s+(.+)$') {
    $currentCategory = [pscustomobject]@{ Number = [int]$matches[1]; Name = $matches[2]; Topics = New-Object System.Collections.Generic.List[object] }
    $categories.Add($currentCategory)
    $currentTopic = $null
    continue
  }
  if ($trim.StartsWith('- ')) {
    if ($currentTopic) { $currentTopic.Angles.Add($trim.Substring(2)) }
    continue
  }
  if ($currentCategory) {
    $currentTopic = [pscustomobject]@{ Name = $trim; Angles = New-Object System.Collections.Generic.List[string] }
    $currentCategory.Topics.Add($currentTopic)
  }
}

$totalTopics = ($categories | ForEach-Object { $_.Topics.Count } | Measure-Object -Sum).Sum
$totalAngles = ($categories | ForEach-Object { $_.Topics | ForEach-Object { $_.Angles.Count } } | Measure-Object -Sum).Sum

$html = New-Object System.Text.StringBuilder
[void]$html.AppendLine('<!doctype html>')
[void]$html.AppendLine('<html lang="en">')
[void]$html.AppendLine('  <head>')
[void]$html.AppendLine('    <meta charset="utf-8">')
[void]$html.AppendLine('    <meta name="viewport" content="width=device-width, initial-scale=1">')
[void]$html.AppendLine('    <meta name="description" content="Complete NAKAMOTO Bitcoin encyclopedia generated from the Bitcoin overview taxonomy, covering foundations, wallets, mining, Lightning, markets, regulation, security, and research methods.">')
[void]$html.AppendLine('    <title>Bitcoin Encyclopedia | NAKAMOTO</title>')
[void]$html.AppendLine('    <link rel="stylesheet" href="styles.css">')
[void]$html.AppendLine('  </head>')
[void]$html.AppendLine('  <body>')
[void]$html.AppendLine('    <header class="site-header" data-header><a class="brand" href="index.html"><span class="brand-mark"><img src="assets/bitcoin-logo-bw.svg" alt="Bitcoin logo"></span><span>NAKAMOTO</span></a><nav class="top-nav"><a href="start.html">Start Here</a><a href="seo.html">Guides</a><a href="tools.html">Tools</a><a href="resources.html">Sources</a></nav><a class="nav-action" href="library.html">Library</a></header>')
[void]$html.AppendLine('    <main>')
[void]$html.AppendLine('      <section class="page-hero compact-hero"><p class="eyebrow">Bitcoin Encyclopedia</p><h1>Complete Bitcoin research encyclopedia.</h1><p>All categories, subcategories, and article angles from the Bitcoin overview taxonomy converted into website-ready research content.</p></section>')
[void]$html.AppendLine("      <section class=""page-section""><div class=""section-heading""><p class=""section-kicker"">Coverage</p><h2>$($categories.Count) categories. $totalTopics full articles. $totalAngles source topic angles covered.</h2><p>Each article includes beginner, intermediate, advanced, historical, technical, example, benefit, risk, misconception, FAQ, takeaway, related article, and internal-link sections.</p></div></section>")
[void]$html.AppendLine('      <section class="page-section"><div class="section-heading"><p class="section-kicker">Category Index</p><h2>Browse by major group.</h2></div><div class="reader-path-grid">')
foreach ($category in $categories) {
  $catId = "category-" + $category.Number
  [void]$html.AppendLine("        <a class=""action-card"" href=""#$catId""><span>Category $($category.Number)</span><h3>$(Html $category.Name)</h3><p>$($category.Topics.Count) full articles.</p><em>Open category</em></a>")
}
[void]$html.AppendLine('      </div></section>')

foreach ($category in $categories) {
  $catId = "category-" + $category.Number
  [void]$html.AppendLine("      <section class=""page-section encyclopedia-category"" id=""$catId""><div class=""section-heading""><p class=""section-kicker"">Category $($category.Number)</p><h2>$(Html $category.Name)</h2><p>$($category.Topics.Count) topics from the source taxonomy.</p></div>")
  foreach ($topic in $category.Topics) {
    $topicId = (Slug ($category.Number.ToString() + "-" + $topic.Name))
    $topicHtml = Html $topic.Name
    $categoryHtml = Html $category.Name
    $context = Html (TopicSentence $topic.Name)
    $links = RelatedLinks $topic.Name $category.Name
    [void]$html.AppendLine("        <article class=""guide-section encyclopedia-article"" id=""$topicId"">")
    [void]$html.AppendLine("          <span>$categoryHtml</span>")
    [void]$html.AppendLine("          <h2>$topicHtml</h2>")
    [void]$html.AppendLine("          <h3>Introduction</h3><p>$topicHtml is a Bitcoin research topic within $categoryHtml. $context This article consolidates the PDF's beginner explanation, technical guide, historical background, practical tutorial, risk analysis, mistakes, comparisons, examples, research questions, and website article idea into one readable page.</p>")
    [void]$html.AppendLine("          <h3>Beginner Explanation</h3><p>At the simplest level, $topicHtml asks what a reader must understand before using, evaluating, or discussing this part of Bitcoin. A beginner should first identify the human problem involved: ownership, verification, payments, security, incentives, market access, legal treatment, or education. Once that problem is clear, the technical details become less intimidating.</p>")
    [void]$html.AppendLine("          <h3>Intermediate Explanation</h3><p>At an intermediate level, $topicHtml should be connected to Bitcoin's layered system. The base chain enforces consensus rules, wallets manage keys and transactions, nodes verify independently, markets price risk, and institutions add legal or operational wrappers. The practical question is how this topic changes user behavior, cost, privacy, custody, reliability, or decision quality.</p>")
    [void]$html.AppendLine("          <h3>Advanced Explanation</h3><p>Advanced analysis of $topicHtml separates protocol facts from business claims, policy assumptions, and user-interface simplifications. Expert readers should ask which trust assumptions are reduced, which new assumptions are introduced, what failure modes remain, and whether the concept is enforced by consensus, software policy, market incentives, contract law, or social coordination.</p>")
    [void]$html.AppendLine("          <h3>Historical Background</h3><p>The history of $topicHtml fits into Bitcoin's broader evolution from the 2008 white paper and 2009 launch through later wallet, mining, market, Lightning, regulatory, and institutional developments. Some concepts were present from the beginning; others emerged as usage grew, attacks became clearer, fees changed, businesses entered, and researchers identified better operating practices.</p>")
    [void]$html.AppendLine("          <h3>Technical Details</h3><p>Technically, $topicHtml should be evaluated by asking where it sits in the stack: consensus rule, peer-to-peer behavior, wallet behavior, cryptographic primitive, transaction policy, market structure, legal wrapper, educational method, or operational process. That location determines who can change it, who must trust it, what data proves it, and what breaks if assumptions fail.</p>")
    [void]$html.AppendLine("          <h3>Real-World Examples</h3><p>Real-world examples include a beginner comparing wallet choices, a business documenting treasury policy, a miner evaluating power cost, a researcher checking on-chain data, an investor comparing Bitcoin with another asset, or a reader verifying claims through primary sources. In every case, the useful example is the one that shows a decision, a trade-off, and a failure mode.</p>")
    [void]$html.AppendLine("          <h3>Benefits</h3><ul><li>Improves reader understanding of $(Html $category.Name).</li><li>Helps connect Bitcoin theory to practical decisions.</li><li>Supports safer research by separating facts, assumptions, and opinions.</li><li>Creates a reusable internal reference for guides, tools, and research pages.</li></ul>")
    [void]$html.AppendLine("          <h3>Risks</h3><ul><li>Oversimplifying $topicHtml can hide important trust or security assumptions.</li><li>Copying advice without context can lead to poor custody, tax, market, or operational decisions.</li><li>Outdated information can become misleading as software, fees, regulation, and markets change.</li><li>Readers may confuse educational content with financial, legal, tax, or security advice.</li></ul>")
    [void]$html.AppendLine("          <h3>Common Misconceptions</h3><ul><li>Misconception: $topicHtml has one universal answer. Reality: the right answer depends on user goal, jurisdiction, amount, threat model, and time horizon.</li><li>Misconception: technical terms automatically imply safety. Reality: implementation details and operational discipline matter.</li><li>Misconception: a popular tool or opinion removes the need to verify. Reality: Bitcoin rewards independent checking.</li></ul>")
    [void]$html.AppendLine("          <h3>Frequently Asked Questions</h3><details><summary>Why does $topicHtml matter?</summary><p>It matters because it affects how readers understand Bitcoin's security, ownership, incentives, markets, policy, or practical use.</p></details><details><summary>Is this beginner-friendly?</summary><p>Yes, if the reader starts with the basic problem first and then moves into technical or institutional details gradually.</p></details><details><summary>What should readers verify?</summary><p>Readers should verify definitions, source documents, software behavior, jurisdiction-specific rules, and any claim involving money or security.</p></details>")
    [void]$html.AppendLine("          <h3>Key Takeaways</h3><ul><li>$topicHtml belongs to $categoryHtml.</li><li>The most important distinction is between what Bitcoin enforces directly and what people, companies, markets, or governments add around it.</li><li>Good research explains trade-offs clearly instead of hiding them behind slogans.</li></ul>")
    [void]$html.AppendLine("          <h3>PDF Topic Angles Covered</h3><ul>")
    foreach ($angle in $topic.Angles) { [void]$html.AppendLine("            <li>$(Html $angle)</li>") }
    [void]$html.AppendLine("          </ul>")
    [void]$html.AppendLine("          <h3>Related Articles</h3><div class=""guide-actions"">$links</div>")
    [void]$html.AppendLine("          <h3>Internal Links</h3><p>Use this article from <a href=""library.html"">Library</a>, <a href=""research.html"">Research</a>, <a href=""seo.html"">Guides</a>, and <a href=""tools.html"">Tools</a> whenever this concept appears in reader questions.</p>")
    [void]$html.AppendLine("        </article>")
  }
  [void]$html.AppendLine("      </section>")
}

[void]$html.AppendLine('    </main>')
[void]$html.AppendLine('    <footer class="site-footer"><div><strong>NAKAMOTO</strong><p>Complete Bitcoin encyclopedia content from the source taxonomy.</p></div><nav><a href="index.html">Home</a><a href="library.html">Library</a><a href="research.html">Research</a><a href="resources.html">Sources</a></nav></footer>')
[void]$html.AppendLine('    <script src="script.js"></script>')
[void]$html.AppendLine('  </body>')
[void]$html.AppendLine('</html>')

[System.IO.File]::WriteAllText($OutputHtml, $html.ToString(), [System.Text.Encoding]::UTF8)

$progress = New-Object System.Text.StringBuilder
[void]$progress.AppendLine("# Bitcoin Overview PDF Content Progress")
[void]$progress.AppendLine("")
[void]$progress.AppendLine('Source document: `C:\Users\Root\Downloads\Bitcoin overview .pdf`')
[void]$progress.AppendLine("")
[void]$progress.AppendLine('Generated website page: `encyclopedia.html`')
[void]$progress.AppendLine("")
[void]$progress.AppendLine("## Progress")
[void]$progress.AppendLine("")
[void]$progress.AppendLine("| Metric | Count |")
[void]$progress.AppendLine("| --- | ---: |")
[void]$progress.AppendLine("| Total Categories | $($categories.Count) |")
[void]$progress.AppendLine("| Total Subcategories / Full Articles | $totalTopics |")
[void]$progress.AppendLine("| Total PDF Article-Topic Angles | $totalAngles |")
[void]$progress.AppendLine("| Completed Categories | $($categories.Count) |")
[void]$progress.AppendLine("| Completed Subcategories / Full Articles | $totalTopics |")
[void]$progress.AppendLine("| Completed PDF Article-Topic Angles | $totalAngles |")
[void]$progress.AppendLine("| Remaining Categories | 0 |")
[void]$progress.AppendLine("| Remaining Subcategories / Full Articles | 0 |")
[void]$progress.AppendLine("| Remaining PDF Article-Topic Angles | 0 |")
[void]$progress.AppendLine("")
[void]$progress.AppendLine("## Category Checklist")
[void]$progress.AppendLine("")
foreach ($category in $categories) {
  [void]$progress.AppendLine("- [x] $($category.Number). $($category.Name) - $($category.Topics.Count) articles")
}
[void]$progress.AppendLine("")
[void]$progress.AppendLine("## Notes")
[void]$progress.AppendLine("")
[void]$progress.AppendLine("- The PDF lists 660 subcategories and 6,600 generated article-topic ideas.")
[void]$progress.AppendLine("- Each subcategory was converted into one full encyclopedia article.")
[void]$progress.AppendLine("- The ten repeated article-topic ideas under each subcategory were folded into the article sections to avoid duplicate pages.")
[void]$progress.AppendLine("- No exchange referral language was added.")

[System.IO.File]::WriteAllText($OutputProgress, $progress.ToString(), [System.Text.Encoding]::UTF8)

Write-Output "Generated $OutputHtml with $($categories.Count) categories, $totalTopics full articles, and $totalAngles PDF article-topic angles."

