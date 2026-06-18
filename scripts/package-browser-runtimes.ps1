# Empacota runtimes para CDN Polaris (GitHub Releases).
# Os kernels do AdsPower ficam em %APPDATA%\adspower_global\cwd_global\chrome_* — NÃO na pasta do instalador em A:\.
#
# Uso automático (recomendado):
#   npm run package-browser-runtimes
#
# Uso manual:
#   npm run package-browser-runtimes -- -SunKernelDir "C:\Users\...\cwd_global\chrome_148"

param(
  [string]$SourceRoot = "",
  [string]$SunKernelDir = "",
  [string]$FlowerKernelDir = "",
  [string]$OutputDir = "dist\runtime-packages",
  [string]$SunVersion = "148.0.7778.97",
  [string]$FlowerVersion = "150.0.3"
)

$ErrorActionPreference = "Stop"

function Get-LatestKernelDir([string]$CwdGlobal, [string]$Prefix, [string[]]$ExeNames) {
  if (-not (Test-Path $CwdGlobal)) { return $null }

  $best = $null
  Get-ChildItem $CwdGlobal -Directory -Filter "${Prefix}*" -ErrorAction SilentlyContinue | ForEach-Object {
  if ($_.Name -match "^${Prefix}(\d+)$") {
      $num = [int]$matches[1]
      $hasExe = $false
      foreach ($name in $ExeNames) {
        if (Test-Path (Join-Path $_.FullName $name)) { $hasExe = $true; break }
        $found = Get-ChildItem $_.FullName -Recurse -Filter $name -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) { $hasExe = $true; break }
      }
      if ($hasExe -and ($null -eq $best -or $num -gt $best.Num)) {
        $best = [pscustomobject]@{ Num = $num; Path = $_.FullName }
      }
    }
  }
  return $best
}

function Find-ExeInKernel([string]$KernelDir, [string[]]$Names) {
  foreach ($name in $Names) {
    $direct = Join-Path $KernelDir $name
    if (Test-Path $direct) { return $direct }
  }
  return Get-ChildItem -Path $KernelDir -Recurse -Include $Names -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

function Package-Kernel([string]$Engine, [string]$KernelDir, [string]$Version) {
  if (-not $KernelDir -or -not (Test-Path $KernelDir)) {
    Write-Warning "[$Engine] kernel não encontrado"
    return $null
  }

  $exePath = if ($Engine -eq 'sunbrowser') {
    Find-ExeInKernel $KernelDir @('SunBrowser.exe', 'sunbrowser.exe')
  } else {
    Find-ExeInKernel $KernelDir @('FlowerBrowser.exe', 'flowerbrowser.exe')
  }

  if (-not $exePath) {
    Write-Warning "[$Engine] executável não encontrado em $KernelDir"
    return $null
  }

  $stageDir = Join-Path $OutputDir "stage-$Engine"
  if (Test-Path $stageDir) { Remove-Item $stageDir -Recurse -Force }
  New-Item -ItemType Directory -Force -Path $stageDir | Out-Null

  Copy-Item -Path (Join-Path $KernelDir '*') -Destination $stageDir -Recurse -Force

  $zipName = "$Engine-win32-x64-$Version.zip"
  $zipPath = Join-Path $OutputDir $zipName
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
  Compress-Archive -Path (Join-Path $stageDir '*') -DestinationPath $zipPath -Force
  Remove-Item $stageDir -Recurse -Force

  Write-Host "OK $zipName  (origem: $KernelDir)"
  return $zipPath
}

$cwdGlobal = Join-Path $env:APPDATA "adspower_global\cwd_global"
Write-Host "AdsPower cwd_global: $cwdGlobal"

if (-not $SunKernelDir) {
  $latestSun = Get-LatestKernelDir $cwdGlobal "chrome_" @('SunBrowser.exe', 'sunbrowser.exe')
  if ($latestSun) {
    $SunKernelDir = $latestSun.Path
    Write-Host "SunBrowser: $($latestSun.Path) (chrome_$($latestSun.Num))"
  }
}

if (-not $FlowerKernelDir) {
  $latestFlower = Get-LatestKernelDir $cwdGlobal "flower_" @('flowerbrowser.exe', 'FlowerBrowser.exe')
  if ($latestFlower) {
    $FlowerKernelDir = $latestFlower.Path
    Write-Host "Flower Browser: $($latestFlower.Path) (flower_$($latestFlower.Num))"
  }
}

if ($SourceRoot -and (Test-Path $SourceRoot)) {
  Write-Host "SourceRoot informado: $SourceRoot"
  if (-not $SunKernelDir) {
    $found = Get-ChildItem $SourceRoot -Recurse -Include SunBrowser.exe, sunbrowser.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $SunKernelDir = $found.DirectoryName }
  }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$created = @()
$z = Package-Kernel 'sunbrowser' $SunKernelDir $SunVersion
if ($z) { $created += $z }
$z = Package-Kernel 'flowerbrowser' $FlowerKernelDir $FlowerVersion
if ($z) { $created += $z }

Write-Host ""
if ($created.Count -eq 0) {
  Write-Host "Nenhum pacote gerado." -ForegroundColor Yellow
  Write-Host "Abra o AdsPower e baixe os kernels (Chrome/Firefox) na Central de Atualizações."
  Write-Host "Depois rode novamente: npm run package-browser-runtimes"
  exit 1
}

Write-Host "Publique no GitHub Releases:"
Write-Host "  cd ""c:\dev\POLARIS BROWSER"""
Write-Host "  gh release create runtimes-v1 $($created -join ' ') --title 'Polaris Browser Runtimes v1'"
