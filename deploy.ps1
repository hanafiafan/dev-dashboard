# ============================================================
#  Dev Dashboard — one-shot deploy to Vercel
#  Jalankan:  powershell -ExecutionPolicy Bypass -File .\deploy.ps1
#  (atau klik kanan > Run with PowerShell)
#
#  Yang dilakukan script ini:
#   1. Verifikasi production build lolos
#   2. Login Vercel (buka browser, sekali saja)
#   3. Link folder ini ke project Vercel
#   4. Upload env vars dari .env.local (NEXT_PUBLIC_*)
#   5. Deploy ke production
# ============================================================

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== [1/5] Verifikasi build ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build GAGAL - perbaiki error di atas dulu." -ForegroundColor Red
    exit 1
}
Write-Host "Build OK" -ForegroundColor Green

Write-Host ""
Write-Host "=== [2/5] Login Vercel ===" -ForegroundColor Cyan
$who = npx vercel whoami 2>$null
if ($LASTEXITCODE -ne 0 -or -not $who) {
    Write-Host "Belum login - browser akan terbuka, pilih akun (boleh daftar gratis pakai GitHub/Google/email)..."
    npx vercel login
    if ($LASTEXITCODE -ne 0) { Write-Host "Login gagal." -ForegroundColor Red; exit 1 }
} else {
    Write-Host "Sudah login sebagai: $who" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== [3/5] Link project ===" -ForegroundColor Cyan
npx vercel link --yes --project dev-dashboard
if ($LASTEXITCODE -ne 0) { Write-Host "Link gagal." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "=== [4/5] Upload environment variables ===" -ForegroundColor Cyan
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^\s*(NEXT_PUBLIC_[A-Z0-9_]+)\s*=\s*(.+)\s*$') {
            $name = $Matches[1]
            $value = $Matches[2].Trim()
            if ($value) {
                Write-Host "  setting $name ..."
                # hapus dulu kalau sudah ada (abaikan error), lalu tambah
                Write-Output "y" | npx vercel env rm $name production 2>$null | Out-Null
                Write-Output $value | npx vercel env add $name production | Out-Null
            }
        }
    }
    Write-Host "Env vars OK" -ForegroundColor Green
} else {
    Write-Host ".env.local tidak ditemukan - lewati (app akan jalan di demo mode!)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== [5/5] Deploy ke production ===" -ForegroundColor Cyan
npx vercel --prod
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy gagal." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "SELESAI! URL production tampil di atas (https://....vercel.app)" -ForegroundColor Green
Write-Host "Halaman publik + form request kamu sekarang ONLINE." -ForegroundColor Green
