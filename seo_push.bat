@echo off
"C:\Program Files\Git\bin\bash.exe" -l -c "cd /c/Users/Root/nakamoto-research && rm -f .git/index.lock && git config user.email 'paras@nakamatoresearch.com' && git config user.name 'NAKAMOTO' && git add -A && git commit -m 'seo: Improve title tags, meta descriptions, noindex internal pages, clean sitemap' && git push && echo SUCCESS > /c/Users/Root/OneDrive/Desktop/seo_push_result.txt && git log --oneline -3 >> /c/Users/Root/OneDrive/Desktop/seo_push_result.txt || echo FAILED > /c/Users/Root/OneDrive/Desktop/seo_push_result.txt"
pause
