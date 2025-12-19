#!/bin/bash

# BestHoliday Finans Paneli - Setup Script
# One-shot deployment for Ubuntu servers

set -e

echo "======================================"
echo "  BestHoliday Finans Paneli"
echo "  Kurulum Scripti"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker bulunamadı! Lütfen önce Docker yükleyin.${NC}"
    echo "Docker kurulumu için: https://docs.docker.com/engine/install/ubuntu/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose bulunamadı!${NC}"
    echo "Docker Compose kurulumu için: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker ve Docker Compose mevcut${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}→ .env dosyası oluşturuluyor...${NC}"
    cat > .env << EOF
# N8N Webhook URLs
N8N_TRANSACTION_WEBHOOK=https://n8n.globaltripmarket.com/webhook/transaction
N8N_QUERY_WEBHOOK=https://n8n.globaltripmarket.com/webhook/query
N8N_REPORT_WEBHOOK=https://n8n.globaltripmarket.com/webhook/report
EOF
    echo -e "${GREEN}✓ .env dosyası oluşturuldu${NC}"
fi

echo ""
echo -e "${YELLOW}→ Docker imajı oluşturuluyor... (Bu işlem birkaç dakika sürebilir)${NC}"
echo ""

# Build the Docker image
docker compose build --no-cache

echo ""
echo -e "${GREEN}✓ Docker imajı başarıyla oluşturuldu${NC}"
echo ""

echo -e "${YELLOW}→ Container başlatılıyor...${NC}"
echo ""

# Start the container
docker compose up -d

echo ""
echo -e "${GREEN}======================================"
echo "  ✓ Kurulum Tamamlandı!"
echo "======================================${NC}"
echo ""
echo -e "Panel adresi: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "Giriş Bilgileri:"
echo -e "  Yönetici: ${YELLOW}admin / admin${NC}"
echo -e "  Personel: ${YELLOW}user / user${NC}"
echo ""
echo "Yararlı komutlar:"
echo "  Logları görüntüle: docker compose logs -f"
echo "  Durdur: docker compose down"
echo "  Yeniden başlat: docker compose restart"
echo ""
