# Script to add dvh fallback for vh units in CSS
$cssFile = "c:\Users\Admin\Downloads\landing ttdpt v2\landing ttdpt\style.css"
$content = Get-Content $cssFile -Raw

# Patterns to update with dvh
$patterns = @(
    # max-height patterns
    @{ Pattern = '(\s+max-height: )(\d+vh);(?!\s*max-height: \d+dvh;)'; Replacement = '$1$2;$1$2'.Replace('vh', 'dvh') + ' /* Dynamic viewport height for mobile browsers */;' }
    # gap patterns
    @{ Pattern = '(\s+gap: )(\d+\.?\d*vh);(?!\s*gap: \d+\.?\d*dvh;)'; Replacement = '$1$2;$1$2'.Replace('vh', 'dvh') + ' /* Dynamic viewport height for mobile browsers */;' }
)

# Apply replacements
foreach ($pattern in $patterns) {
    $content = $content -replace $pattern.Pattern, $pattern.Replacement
}

# Save the file
Set-Content $cssFile -Value $content -NoNewline

Write-Host "✓ Updated CSS file with dvh fallbacks" -ForegroundColor Green
