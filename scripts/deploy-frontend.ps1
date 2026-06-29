param(
    [Parameter(Mandatory = $true)]
    [string] $ResourceGroup,

    [Parameter(Mandatory = $true)]
    [string] $FrontendAppName,

    [Parameter(Mandatory = $true)]
    [string] $ApiUrl,

    [switch] $SkipInstall
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path "$PSScriptRoot\.."
$frontendPath = Join-Path $repoRoot "frontend"
$artifactsPath = Join-Path $repoRoot "artifacts"
$packagePath = Join-Path $artifactsPath "frontend-standalone"
$zipPath = Join-Path $artifactsPath "frontend-standalone.zip"

Write-Host ""
Write-Host "Deploying frontend"
Write-Host "Repo root:        $repoRoot"
Write-Host "Frontend path:    $frontendPath"
Write-Host "Azure app:        $FrontendAppName"
Write-Host "API URL:          $ApiUrl"
Write-Host ""

if (!(Test-Path $frontendPath)) {
    throw "Frontend folder not found at $frontendPath"
}

# Ensure artifacts folder exists
New-Item -ItemType Directory -Force -Path $artifactsPath | Out-Null

# Clean previous package
Write-Host "Cleaning previous frontend package..."
Remove-Item $packagePath -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $packagePath | Out-Null

# Build frontend locally
Push-Location $frontendPath

try {
    Write-Host "Preparing local build environment..."

    # Do not let NODE_ENV=production skip devDependencies during install/build.
    Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue

    # This is baked into the browser bundle during next build.
    $env:NEXT_PUBLIC_API_URL = $ApiUrl

    Write-Host "Cleaning previous Next build..."
    Remove-Item .\.next -Recurse -Force -ErrorAction SilentlyContinue

    if (!$SkipInstall) {
        Write-Host "Installing dependencies including devDependencies..."
        npm ci --include=dev
    }
    else {
        Write-Host "Skipping npm install because -SkipInstall was supplied."
    }

    Write-Host "Building Next.js standalone app..."
    npm run build
}
finally {
    Pop-Location
}

$standalonePath = Join-Path $frontendPath ".next\standalone"
$staticPath = Join-Path $frontendPath ".next\static"
$publicPath = Join-Path $frontendPath "public"

if (!(Test-Path $standalonePath)) {
    throw "Standalone output was not found at $standalonePath. Check frontend/next.config.ts has output: `"standalone`"."
}

if (!(Test-Path $staticPath)) {
    throw "Static output was not found at $staticPath. The Next build may have failed or produced unexpected output."
}

# Copy standalone output
Write-Host "Copying standalone output..."
Copy-Item -Path (Join-Path $standalonePath "*") -Destination $packagePath -Recurse -Force

# Copy .next/static
Write-Host "Copying .next/static..."
$packageNextPath = Join-Path $packagePath ".next"
New-Item -ItemType Directory -Force -Path $packageNextPath | Out-Null

Copy-Item `
    -Path $staticPath `
    -Destination (Join-Path $packageNextPath "static") `
    -Recurse `
    -Force

# Copy public if present
if (Test-Path $publicPath) {
    Write-Host "Copying public assets..."
    Copy-Item `
        -Path $publicPath `
        -Destination (Join-Path $packagePath "public") `
        -Recurse `
        -Force
}

# Validate package structure
$serverJs = Join-Path $packagePath "server.js"
$packageJson = Join-Path $packagePath "package.json"
$packageNextStatic = Join-Path $packagePath ".next\static"

if (!(Test-Path $serverJs)) {
    throw "server.js was not found at the package root: $serverJs"
}

if (!(Test-Path $packageJson)) {
    throw "package.json was not found at the package root: $packageJson"
}

if (!(Test-Path $packageNextStatic)) {
    throw ".next/static was not found in the package: $packageNextStatic"
}

Write-Host ""
Write-Host "Package structure looks good:"
Get-ChildItem $packagePath | Select-Object Name, Mode, Length
Write-Host ""

# Create ZIP.
# Use tar with -C so the ZIP contains server.js/package.json at the root,
# including dot folders like .next.
Write-Host "Creating ZIP package..."
tar -a -cf $zipPath -C $packagePath .

if (!(Test-Path $zipPath)) {
    throw "ZIP was not created at $zipPath"
}

Write-Host "ZIP created: $zipPath"
Write-Host ""

Write-Host "Checking first entries in ZIP..."
tar -tf $zipPath | Select-Object -First 30
Write-Host ""

# Deploy to Azure
Write-Host "Deploying ZIP to Azure App Service..."
az webapp deploy `
    --resource-group $ResourceGroup `
    --name $FrontendAppName `
    --src-path $zipPath `
    --type zip

Write-Host ""
Write-Host "Restarting Azure App Service..."
az webapp restart `
    --resource-group $ResourceGroup `
    --name $FrontendAppName

Write-Host ""
Write-Host "Frontend deployment complete."
Write-Host "URL: https://$FrontendAppName.azurewebsites.net"
Write-Host ""