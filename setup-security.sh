#!/bin/bash

# WealthEase Security Setup Script
# Script ini membantu setup project dengan aman sebelum push ke GitHub

echo "🔒 WealthEase Security Setup"
echo "=========================="

# 1. Cek apakah file sensitif ada
echo "📋 Checking for sensitive files..."

if [ -f "backend/.env" ]; then
    echo "⚠️  Found backend/.env - this file contains sensitive data!"
    echo "   Please ensure it's in .gitignore"
else
    echo "✅ No .env file found - good!"
fi

if [ -f "backend/data/transactions.json" ]; then
    echo "⚠️  Found backend/data/transactions.json - contains user financial data!"
    echo "   This file should not be committed to GitHub"
else
    echo "✅ No transactions.json found - good!"
fi

# 2. Buat file .env dari template jika belum ada
echo ""
echo "📝 Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        echo "✅ Created backend/.env from template"
        echo "   Please edit backend/.env with your actual API keys"
    else
        echo "❌ No env.example found!"
    fi
else
    echo "ℹ️  backend/.env already exists"
fi

# 3. Buat data example jika belum ada
echo ""
echo "📊 Setting up example data files..."

if [ -f "backend/data/transactions.json" ]; then
    if [ ! -f "backend/data/transactions.example.json" ]; then
        cp backend/data/transactions.json backend/data/transactions.example.json
        echo "✅ Created transactions.example.json from actual data"
    else
        echo "ℹ️  transactions.example.json already exists"
    fi
else
    echo "ℹ️  No transactions.json found"
fi

# 4. Cek .gitignore
echo ""
echo "🛡️  Checking .gitignore configuration..."

if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        echo "✅ .env files are ignored"
    else
        echo "⚠️  .env files are NOT in .gitignore!"
    fi
    
    if grep -q "transactions\.json" .gitignore; then
        echo "✅ transactions.json is ignored"
    else
        echo "⚠️  transactions.json is NOT in .gitignore!"
    fi
else
    echo "❌ No .gitignore file found!"
fi

# 5. Cek git status
echo ""
echo "🔍 Checking git status..."

if command -v git &> /dev/null; then
    echo "Files that will be committed:"
    git status --porcelain | grep -v "^D" | head -10
    
    echo ""
    echo "Files that are ignored:"
    git status --ignored --porcelain | head -10
else
    echo "ℹ️  Git not available for status check"
fi

# 6. Final recommendations
echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env with your actual API keys"
echo "2. Test your application locally"
echo "3. Run: git add ."
echo "4. Run: git commit -m 'Initial commit with security setup'"
echo "5. Run: git push origin main"

echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "- Never commit .env files"
echo "- Never commit user data files"
echo "- Use environment variables in production"
echo "- Regenerate API keys if accidentally exposed"

echo ""
echo "✅ Security setup complete!"
