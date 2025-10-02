$BRANCH = "feature/initial-setup"

Write-Host "Switching to branch: $BRANCH"
git checkout $BRANCH

Write-Host "Adding all untracked + modified files..."
git add .

Write-Host "Committing changes..."
git commit -m "Auto-update: added/updated frontend, backend and ai files"

Write-Host "Pushing to GitHub..."
git push origin $BRANCH

Write-Host "`n======================================"
Write-Host "✅ All done! Files pushed to $BRANCH"
Write-Host "======================================"
