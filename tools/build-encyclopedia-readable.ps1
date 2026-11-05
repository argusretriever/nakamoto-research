param(
  [string]$ExtractedText = "pdf-extracted-text-cs.txt",
  [string]$OutputHtml = "encyclopedia.html"
)

$ErrorActionPreference = "Stop"

function Html([string]$Value) {
  return [System.Net.WebUtility]::HtmlEncode($Value)
}

function Slug([string]$Value) {
  return (($Value.ToLowerInvariant() -replace '[^a-z0-9]+','-') -replace '(^-|-$)','')
}

function Domain([string]$Category, [string]$Topic) {
  $text = "$Category $Topic".ToLowerInvariant()
  if ($text -match 'wallet|seed|key|address|custody|multisig|descriptor|psbt') { return 'custody' }
  if ($text -match 'mining|proof of work|hash|asic|difficulty|energy') { return 'mining' }
  if ($text -match 'lightning|channel|liquidity|routing|payment') { return 'lightning' }
  if ($text -match 'privacy|chain analysis|surveillance|coinjoin|payjoin|kyc') { return 'privacy' }
  if ($text -match 'market|trading|etf|asset|gold|stocks|real estate|derivative|liquidity|volatility') { return 'markets' }
  if ($text -match 'regulation|tax|legal|court|compliance|accounting|treasury|institutional') { return 'policy' }
  if ($text -match 'script|miniscript|taproot|segwit|signature|cryptography|sha|ecdsa|schnorr|bip|core|protocol') { return 'technical' }
  if ($text -match 'satoshi|origin|white paper|genesis|cypherpunk|digital money|history') { return 'history' }
  if ($text -match 'career|education|media|culture|philosophy|criticism|future|website|research') { return 'learning' }
  return 'foundations'
}

function DomainCopy([string]$Domain) {
  switch ($Domain) {
    'custody' { return @{
      Intro='This topic helps readers understand how bitcoin is controlled, recovered, and protected.'
      Beginner='For a consumer, the key question is simple: who can spend the bitcoin, and what happens if something is lost?'
      Intermediate='The practical trade-off is convenience versus control. Easier setups often add trust; stronger setups require better backup habits.'
      Advanced='Advanced review should identify signing devices, recovery paths, key exposure, metadata leakage, and single points of failure.'
      Example='A reader choosing between a mobile wallet, desktop wallet, hardware wallet, or multisig setup can use this topic to match risk to amount.'
      Benefit='Better custody knowledge reduces avoidable loss, phishing risk, bad backups, and overreliance on exchanges.'
      Risk='The biggest risk is false confidence: a setup can look secure while recovery, privacy, or inheritance is still weak.'
    } }
    'mining' { return @{
      Intro='This topic explains how Bitcoin turns energy, hardware, and competition into transaction ordering and settlement security.'
      Beginner='For a consumer, mining is the process that adds blocks and makes rewriting history expensive.'
      Intermediate='The important trade-off is that miners compete economically, while nodes still decide whether blocks follow the rules.'
      Advanced='Advanced review should separate hash rate, difficulty, block subsidy, fees, pool policy, energy contracts, and geographic concentration.'
      Example='A mining farm comparing power cost, uptime, cooling, ASIC efficiency, and pool selection is dealing with this topic directly.'
      Benefit='Understanding mining helps readers evaluate security claims, energy criticism, fee markets, and the halving cycle.'
      Risk='The common risk is assuming miners control Bitcoin; miners propose blocks, but validating nodes enforce consensus rules.'
    } }
    'lightning' { return @{
      Intro='This topic belongs to Bitcoin payments beyond the base chain, where speed, cost, routing, and liquidity matter.'
      Beginner='For a consumer, Lightning is useful because small payments can move faster and cheaper than ordinary on-chain transactions.'
      Intermediate='The practical trade-off is that channels, liquidity, backups, and routing add operational complexity.'
      Advanced='Advanced review should separate channel state, HTLCs, routing fees, watchtowers, liquidity management, and force-close risk.'
      Example='A shop accepting small Bitcoin payments or a user sending frequent low-value payments is dealing with this topic.'
      Benefit='Lightning can improve payment usability while still depending on Bitcoin as the settlement layer.'
      Risk='The risk is treating Lightning like a normal bank app; channel backups, liquidity, and custody model still matter.'
    } }
    'privacy' { return @{
      Intro='This topic explains what can be learned from Bitcoin activity and how users can reduce unnecessary exposure.'
      Beginner='For a consumer, Bitcoin is not automatically anonymous. Transactions are public, even when names are not shown on-chain.'
      Intermediate='The practical trade-off is that convenience, exchange use, address reuse, and wallet behavior can reveal patterns.'
      Advanced='Advanced review should separate on-chain heuristics, network surveillance, wallet clustering, coin control, and legal reporting.'
      Example='A user withdrawing from an exchange to a reused address creates a different privacy profile than a user practicing address hygiene.'
      Benefit='Better privacy knowledge helps readers avoid accidental disclosure and understand what public explorers can and cannot prove.'
      Risk='The risk is overclaiming privacy. Some tools reduce signals, but none erase all history or legal obligations.'
    } }
    'markets' { return @{
      Intro='This topic helps readers understand Bitcoin as a market asset: how it is priced, compared, accessed, and risk-managed.'
      Beginner='For a consumer, the key idea is that Bitcoin price can move sharply because supply is fixed but demand changes constantly.'
      Intermediate='The practical trade-off is exposure versus volatility. Different products create different custody, fee, tax, and counterparty risks.'
      Advanced='Advanced review should separate spot markets, derivatives, liquidity, leverage, basis, ETF flows, and macro conditions.'
      Example='A reader comparing Bitcoin with gold, stocks, real estate, ETFs, or cash is using this topic to understand risk and role.'
      Benefit='Market knowledge helps readers avoid hype, compare instruments, and think in time horizon instead of headlines.'
      Risk='The risk is confusing historical performance with a promise. Bitcoin has large drawdowns and no guaranteed return.'
    } }
    'policy' { return @{
      Intro='This topic explains how Bitcoin interacts with law, accounting, tax, compliance, institutions, and governments.'
      Beginner='For a consumer, the key point is that Bitcoin rules are global, but legal treatment depends on country and activity.'
      Intermediate='The practical trade-off is access versus obligations. Exchanges, ETFs, companies, and custodians add reporting and compliance layers.'
      Advanced='Advanced review should separate protocol behavior from securities law, tax classification, accounting treatment, AML rules, and court precedent.'
      Example='A company holding bitcoin, a taxpayer selling bitcoin, or an exchange serving customers all face different parts of this topic.'
      Benefit='Policy knowledge helps readers avoid legal surprises and understand why countries treat Bitcoin differently.'
      Risk='The risk is assuming one country’s rule applies everywhere, or that online commentary is a substitute for qualified advice.'
    } }
    'technical' { return @{
      Intro='This topic is part of Bitcoin’s technical rule system: how software verifies ownership, transactions, blocks, and upgrades.'
      Beginner='For a consumer, the simple idea is that Bitcoin works because computers can independently check the same rules.'
      Intermediate='The practical trade-off is that technical improvements can add capability while increasing wallet, node, or developer complexity.'
      Advanced='Advanced review should identify consensus rules, standardness policy, cryptographic assumptions, upgrade paths, and backward compatibility.'
      Example='A developer reading BIPs, a wallet implementing Taproot, or a node operator upgrading Bitcoin Core is dealing with this topic.'
      Benefit='Technical understanding helps readers distinguish protocol facts from marketing claims.'
      Risk='The risk is assuming technical language means safety. Correct implementation, review, and user behavior still matter.'
    } }
    'history' { return @{
      Intro='This topic gives historical context for why Bitcoin was created and how early design choices shaped the system.'
      Beginner='For a consumer, history matters because Bitcoin did not appear from nowhere; it built on earlier money, cryptography, and digital cash ideas.'
      Intermediate='The practical trade-off is interpreting old material carefully: early posts explain intent, but the running network and rules matter too.'
      Advanced='Advanced review should separate primary sources, later interpretations, myths, disputed claims, and verifiable records.'
      Example='A reader studying the white paper, Genesis block, cypherpunks, or failed digital cash systems is using history to understand design.'
      Benefit='Historical knowledge helps readers avoid shallow origin stories and understand Bitcoin’s design constraints.'
      Risk='The risk is turning history into mythology. Good research keeps evidence separate from speculation.'
    } }
    'learning' { return @{
      Intro='This topic helps organize Bitcoin knowledge for readers, researchers, builders, institutions, and educators.'
      Beginner='For a consumer, the key is knowing what to learn next without getting buried in jargon.'
      Intermediate='The practical trade-off is depth versus clarity. Good education gives simple answers first and detail only when useful.'
      Advanced='Advanced review should consider source quality, update frequency, bias, audience level, and how claims are verified.'
      Example='A reader using guides, glossaries, research databases, books, courses, or FAQs is dealing with this topic.'
      Benefit='A good learning system lowers confusion and helps readers make safer decisions.'
      Risk='The risk is information overload: too many terms, tools, or opinions can make Bitcoin feel harder than it needs to be.'
    } }
    default { return @{
      Intro='This topic explains a core part of Bitcoin and how it fits into money, software, incentives, and user behavior.'
      Beginner='For a consumer, the goal is to understand the basic problem before memorizing technical words.'
      Intermediate='The practical trade-off is knowing what Bitcoin handles directly and what depends on wallets, markets, companies, or people.'
      Advanced='Advanced review should separate protocol facts, software behavior, incentives, legal wrappers, and operational assumptions.'
      Example='A reader moving from a beginner guide to tools, sources, and research can use this topic as a bridge.'
      Benefit='Clear understanding reduces confusion and helps readers ask better questions.'
      Risk='The risk is oversimplification: Bitcoin topics often involve trade-offs rather than one perfect answer.'
    } }
  }
}

function RelatedLinks([string]$Domain) {
  $base = @('<a href="chapter-1.html">Chapter 1</a>','<a href="library.html">Glossary</a>')
  switch ($Domain) {
    'custody' { return ($base + @('<a href="tools.html#wallet-selector">Wallet selector</a>','<a href="resources.html#wallets">Wallet sources</a>')) -join "`n" }
    'mining' { return ($base + @('<a href="data.html#blocks">Live blocks</a>','<a href="resources.html#mining-data">Mining sources</a>')) -join "`n" }
    'lightning' { return ($base + @('<a href="resources.html#lightning-resources">Lightning sources</a>','<a href="tools.html#transaction-explainer">Transaction explainer</a>')) -join "`n" }
    'markets' { return ($base + @('<a href="data.html#live-chart">Live chart</a>','<a href="comparison-hub.html">Comparison hub</a>')) -join "`n" }
    'policy' { return ($base + @('<a href="policy.html">Policy research</a>','<a href="resources.html#policy">Policy sources</a>')) -join "`n" }
    default { return ($base + @('<a href="research.html">Research</a>','<a href="resources.html">Sources</a>')) -join "`n" }
  }
}

$lines = Get-Content $ExtractedText
$categories = New-Object System.Collections.Generic.List[object]
$currentCategory = $null
$currentTopic = $null
$inReferenceAppendix = $false

foreach ($line in $lines) {
  $trim = $line.Trim()
  if (-not $trim) { continue }
  if ($trim -eq 'Reference Areas to Keep Checking') { $inReferenceAppendix = $true; continue }
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
[void]$html.AppendLine('    <meta name="description" content="NAKAMOTO Bitcoin encyclopedia covering foundations, wallets, mining, Lightning, markets, privacy, regulation, security, culture, and research methods.">')
[void]$html.AppendLine('    <title>Bitcoin Encyclopedia | NAKAMOTO</title>')
[void]$html.AppendLine('    <link rel="stylesheet" href="styles.css">')
[void]$html.AppendLine('  </head>')
[void]$html.AppendLine('  <body>')
[void]$html.AppendLine('    <header class="site-header" data-header><a class="brand" href="index.html"><span class="brand-mark"><img src="assets/bitcoin-logo-bw.svg" alt="Bitcoin logo"></span><span>NAKAMOTO</span></a><nav class="top-nav"><a href="start.html">Start Here</a><a href="seo.html">Guides</a><a href="tools.html">Tools</a><a href="resources.html">Sources</a></nav><a class="nav-action" href="library.html">Library</a></header>')
[void]$html.AppendLine('    <main>')
[void]$html.AppendLine('      <section class="page-hero compact-hero"><p class="eyebrow">Bitcoin Encyclopedia</p><h1>Bitcoin topics, explained clearly.</h1><p>A complete reference for readers who want plain explanations first, with deeper technical and research context available inside each topic.</p></section>')
[void]$html.AppendLine("      <section class=""page-section""><div class=""section-heading""><p class=""section-kicker"">Coverage</p><h2>$($categories.Count) categories. $totalTopics topics. $totalAngles research angles covered.</h2><p>This page keeps the full source coverage but avoids repeating the same definition across hundreds of entries.</p></div></section>")
[void]$html.AppendLine('      <section class="page-section"><div class="section-heading"><p class="section-kicker">Category Index</p><h2>Start with a major area.</h2></div><div class="reader-path-grid">')
foreach ($category in $categories) {
  [void]$html.AppendLine("        <a class=""action-card"" href=""#category-$($category.Number)""><span>Category $($category.Number)</span><h3>$(Html $category.Name)</h3><p>$($category.Topics.Count) topics.</p><em>Open</em></a>")
}
[void]$html.AppendLine('      </div></section>')

foreach ($category in $categories) {
  [void]$html.AppendLine("      <section class=""page-section encyclopedia-category"" id=""category-$($category.Number)""><div class=""section-heading""><p class=""section-kicker"">Category $($category.Number)</p><h2>$(Html $category.Name)</h2><p>$($category.Topics.Count) connected topics.</p></div>")
  foreach ($topic in $category.Topics) {
    $domain = Domain $category.Name $topic.Name
    $copy = DomainCopy $domain
    $topicHtml = Html $topic.Name
    $catHtml = Html $category.Name
    $id = Slug "$($category.Number)-$($topic.Name)"
    $links = RelatedLinks $domain
    [void]$html.AppendLine("        <article class=""guide-section encyclopedia-article"" id=""$id"">")
    [void]$html.AppendLine("          <span>$catHtml</span><h2>$topicHtml</h2>")
    [void]$html.AppendLine("          <p class=""article-summary"">$($copy.Intro)</p>")
    [void]$html.AppendLine("          <h3>Introduction</h3><p><b>$topicHtml</b> sits inside $catHtml. $($copy.Intro) The useful way to study this topic is to ask what problem it solves, what trade-offs it creates, and what a normal reader should verify before acting.</p>")
    [void]$html.AppendLine("          <h3>Beginner Explanation</h3><p>$($copy.Beginner) Start with the plain-language meaning, then connect it to a real action: buying, storing, sending, verifying, comparing, researching, or complying.</p>")
    [void]$html.AppendLine("          <h3>Intermediate Explanation</h3><p>$($copy.Intermediate) Readers should compare the simple story with the operational reality: costs, risks, incentives, tools, and who must be trusted.</p>")
    [void]$html.AppendLine("          <h3>Advanced Explanation</h3><p>$($copy.Advanced) The expert question is not whether the topic is good or bad in isolation, but which assumptions it changes and which assumptions remain.</p>")
    [void]$html.AppendLine("          <h3>Historical Background</h3><p>Read this topic against Bitcoin's history: the white paper, early software, later upgrades, changing fee markets, stronger custody practices, institutional adoption, and public policy reactions. The timeline matters because many Bitcoin ideas were responses to actual failures, attacks, or scaling limits.</p>")
    [void]$html.AppendLine("          <h3>Technical Details</h3><p>Technically, place this topic in the right layer: consensus rules, node policy, wallet behavior, cryptography, mining economics, payment channels, market structure, law, education, or research process. That layer tells readers what can be verified directly and what depends on people or institutions.</p>")
    [void]$html.AppendLine("          <h3>Real-World Examples</h3><p>$($copy.Example) A good example should show the user's goal, the available choices, the failure mode, and the safer next step.</p>")
    [void]$html.AppendLine("          <h3>Benefits</h3><ul><li>$($copy.Benefit)</li><li>Helps readers move from vague Bitcoin language to concrete decisions.</li><li>Creates a shared reference point for guides, tools, research, and glossary entries.</li></ul>")
    [void]$html.AppendLine("          <h3>Risks</h3><ul><li>$($copy.Risk)</li><li>Outdated information can mislead readers as software, markets, regulation, and fees change.</li><li>No reader should treat this as financial, tax, legal, or security advice.</li></ul>")
    [void]$html.AppendLine("          <h3>Common Misconceptions</h3><ul><li><b>Misconception:</b> One answer fits everyone. <b>Reality:</b> goals, jurisdiction, amount, skill level, and threat model change the answer.</li><li><b>Misconception:</b> Popular tools remove the need to verify. <b>Reality:</b> Bitcoin rewards checking sources and understanding assumptions.</li><li><b>Misconception:</b> Technical language guarantees safety. <b>Reality:</b> implementation and user behavior still matter.</li></ul>")
    [void]$html.AppendLine("          <h3>Frequently Asked Questions</h3><details><summary>Why should a reader care about ${topicHtml}?</summary><p>Because it changes how they understand Bitcoin's use, safety, economics, policy, or technical design.</p></details><details><summary>What is the first thing to learn?</summary><p>Learn the basic problem first, then study the tools, rules, or trade-offs that address it.</p></details><details><summary>What should be checked before acting?</summary><p>Check primary sources, official documentation, country-specific rules, and whether the advice matches the reader's own risk situation.</p></details>")
    [void]$html.AppendLine("          <h3>Key Takeaways</h3><ul><li>$topicHtml belongs under $catHtml.</li><li>The practical question is what the reader can verify and what they must trust.</li><li>Good Bitcoin research explains trade-offs instead of selling certainty.</li></ul>")
    [void]$html.AppendLine("          <details class=""coverage-details""><summary>Research angles covered</summary><ul>")
    foreach ($angle in $topic.Angles) { [void]$html.AppendLine("            <li>$(Html $angle)</li>") }
    [void]$html.AppendLine("          </ul></details>")
    [void]$html.AppendLine("          <h3>Related Articles</h3><div class=""guide-actions"">$links</div>")
    [void]$html.AppendLine("        </article>")
  }
  [void]$html.AppendLine('      </section>')
}

[void]$html.AppendLine('    </main>')
[void]$html.AppendLine('    <footer class="site-footer"><div><strong>NAKAMOTO</strong><p>Bitcoin encyclopedia and research index.</p></div><nav><a href="index.html">Home</a><a href="library.html">Library</a><a href="research.html">Research</a><a href="resources.html">Sources</a></nav></footer>')
[void]$html.AppendLine('    <script src="script.js"></script>')
[void]$html.AppendLine('  </body>')
[void]$html.AppendLine('</html>')

[System.IO.File]::WriteAllText($OutputHtml, $html.ToString(), [System.Text.Encoding]::UTF8)
Write-Output "Rebuilt $OutputHtml with $($categories.Count) categories, $totalTopics topics, and $totalAngles research angles."
