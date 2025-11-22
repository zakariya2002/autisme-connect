#!/bin/bash

# Script pour créer une image du diplôme de test

echo "📄 Conversion du diplôme HTML en PDF..."

# Option 1 : Avec wkhtmltopdf (si installé)
if command -v wkhtmltopdf &> /dev/null; then
    wkhtmltopdf diplome-test.html diplome-test.pdf
    echo "✅ PDF créé : diplome-test.pdf"

    # Convertir en JPG pour l'OCR
    if command -v convert &> /dev/null; then
        convert -density 300 diplome-test.pdf diplome-test.jpg
        echo "✅ Image créée : diplome-test.jpg"
    fi
else
    echo "⚠️  wkhtmltopdf n'est pas installé"
    echo "Installation : sudo apt install wkhtmltopdf"
    echo ""
    echo "Alternative : Utilisez le navigateur (Ctrl+P → Enregistrer PDF)"
fi
