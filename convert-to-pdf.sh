#!/bin/bash

# Script de conversion Markdown vers PDF
# Guide de vérification des diplômes - Autisme Connect

echo "🚀 Installation de Pandoc et dépendances LaTeX..."
sudo apt update
sudo apt install -y pandoc texlive-latex-base texlive-fonts-recommended texlive-latex-extra

echo ""
echo "📄 Conversion du guide en PDF..."
cd /home/zakariya/Bureau/saasprojet/autisme-connect

pandoc GUIDE_VERIFICATION_DIPLOMES.md \
  -o guide_verification_diplomes.pdf \
  --pdf-engine=pdflatex \
  --toc \
  --toc-depth=3 \
  -V geometry:margin=2cm \
  -V fontsize=11pt \
  -V documentclass=article \
  -V linkcolor=blue \
  -V urlcolor=blue

echo ""
if [ -f "guide_verification_diplomes.pdf" ]; then
  echo "✅ PDF créé avec succès !"
  echo "📍 Emplacement : $(pwd)/guide_verification_diplomes.pdf"
  echo ""
  echo "📂 Ouverture du PDF..."
  xdg-open guide_verification_diplomes.pdf
else
  echo "❌ Erreur lors de la création du PDF"
  exit 1
fi
