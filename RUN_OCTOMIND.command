#!/usr/bin/env bash
set -u

ROOT="$HOME/octomind"
SCRIPT="$ROOT/octo_zero_secret_bootstrap.py"
URL="https://raw.githubusercontent.com/angeladoloressen-tech/octomind-cloud/main/bootstrap/octo_zero_secret_bootstrap.py"

mkdir -p "$ROOT"
cd "$ROOT" || exit 1

clear || true
printf "\n===============================================\n"
printf "  OCTOMIND STARTER\n"
printf "===============================================\n\n"
printf "Bu pencere Octomind cloud worker bootstrap'i calistiracak.\n"
printf "Claude/GitHub/Supabase key istemez. Once Cloudflare worker'i ayaga kaldirir.\n\n"

if ! command -v python3 >/dev/null 2>&1; then
  printf "Python3 bulunamadi. Once Python3 kurulmali.\n"
  read -r -p "Kapatmak icin Enter..." _
  exit 1
fi

if command -v curl >/dev/null 2>&1; then
  printf "Bootstrap indiriliyor...\n"
  curl -fsSL "$URL" -o "$SCRIPT"
else
  printf "curl bulunamadi.\n"
  read -r -p "Kapatmak icin Enter..." _
  exit 1
fi

chmod +x "$SCRIPT"
printf "\nBootstrap basliyor...\n\n"
python3 "$SCRIPT"

printf "\n===============================================\n"
printf "  OCTOMIND STARTER FINISHED\n"
printf "===============================================\n"
read -r -p "Kapatmak icin Enter..." _
