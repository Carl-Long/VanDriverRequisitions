param(
    [Parameter(Mandatory = $true)]
    [string] $ResourceGroup,

    [Parameter(Mandatory = $true)]
    [string] $ApiAppName,

    [string] $Configuration = "Release"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path "$PSScriptRoot\.."
$artifactsPath = Join-Path $repoRoot "artifacts"
$publishPath = Join-Path $artifactsPath "api"
$zipPath = Join-Path $artifactsPath "api.zip"

$apiProject = Join-Path $repoRoot "backend\src\VanDriverRequisitions.Api\VanDriverRequisitions.Api.csproj"

Write-Host ""
Write-Host "Deploying backend API"
Write-Host "Repo root:      $repoRoot"
Write-Host "API project:    $apiProject"
Write-Host "Azure app:      $ApiAppName"
Write-Host "Resource group: $ResourceGroup"
Write-Host "Configuration:  $Configuration"
Write-Host ""

if (!(Test-Path $apiProject)) {
    throw "API project not found at $apiProject"
}

New-Item -ItemType Directory -Force -Path $artifactsPath | Out-Null

Write-Host "Cleaning previous API publish output..."
Remove-Item $publishPath -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

Write-Host "Publishing API..."
dotnet publish $apiProject `
    -c $Configuration `
    -o $publishPath

if (!(Test-Path $publishPath)) {
    throw "Publish output was not created at $publishPath"
}

$apiDll = Join-Path $publishPath "VanDriverRequisitions.Api.dll"

if (!(Test-Path $apiDll)) {
    throw "Expected API DLL was not found at $apiDll"
}

Write-Host ""
Write-Host "Published output looks good:"
Get-ChildItem $publishPath | Select-Object Name, Mode, Length | Select-Object -First 20
Write-Host ""

Write-Host "Creating API ZIP package..."
tar -a -cf $zipPath -C $publishPath .

if (!(Test-Path $zipPath)) {
    throw "ZIP was not created at $zipPath"
}

Write-Host "ZIP created: $zipPath"
Write-Host ""

Write-Host "Checking first entries in ZIP..."
tar -tf $zipPath | Select-Object -First 30
Write-Host ""

Write-Host "Deploying ZIP to Azure App Service..."
az webapp deploy `
    --resource-group $ResourceGroup `
    --name $ApiAppName `
    --src-path $zipPath `
    --type zip

Write-Host ""
Write-Host "Restarting API App Service..."
az webapp restart `
    --resource-group $ResourceGroup `
    --name $ApiAppName

Write-Host ""
Write-Host "Backend deployment complete."
Write-Host "Health check: https://$ApiAppName.azurewebsites.net/health"
Write-Host "Swagger:      https://$ApiAppName.azurewebsites.net/swagger"
Write-Host ""