#!/usr/bin/env bash

# ==============================================================================
# EcoThread - Universal Application Launcher (Backend + Frontend)
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
AMBER='\033[0;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${GREEN}${BOLD}"
cat << "EOF"
  ______          _______ _                         _ 
 |  ____|        |__   __| |                       | |
 | |__   ___ ___    | |  | |__  _ __ ___  __ _   __| |
 |  __| / __/ _ \   | |  | '_ \| '__/ _ \/ _` | / _` |
 | |___| (_| (_) |  | |  | | | | | |  __/ (_| || (_| |
 |______\___\___/   |_|  |_| |_|_|  \___|\__,_| \__,_|
EOF
echo -e "${NC}"
echo -e "${CYAN}Sustainable Circular Fashion & NGO Clothing Redistribution Platform${NC}"
echo -e "=============================================================================="

# 1. Environment & Dependency Checks
echo -e "\n${BOLD}[1/4] Checking Environment Prerequisites...${NC}"

# Detect Java 21
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/opt/homebrew/opt/openjdk@21" ]; then
        export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
    elif /usr/libexec/java_home -v 21 >/dev/null 2>&1; then
        export JAVA_HOME=$(/usr/libexec/java_home -v 21)
    fi
fi

if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
    export PATH="$JAVA_HOME/bin:$PATH"
    JAVA_VERSION=$("$JAVA_HOME/bin/java" -version 2>&1 | head -n 1)
    echo -e "  ✔ Java: ${GREEN}$JAVA_VERSION${NC} (using $JAVA_HOME)"
else
    echo -e "  ${RED}✖ Java 21 not found. Please install OpenJDK 21 or set JAVA_HOME.${NC}"
    exit 1
fi

# Check Node & npm
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    echo -e "  ✔ Node.js: ${GREEN}$NODE_VERSION${NC} | npm: ${GREEN}$NPM_VERSION${NC}"
else
    echo -e "  ${RED}✖ Node.js or npm is missing. Please install Node.js (v18+).${NC}"
    exit 1
fi

# 2. Frontend Dependencies Check
echo -e "\n${BOLD}[2/4] Verifying Frontend Dependencies...${NC}"
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "  Installing frontend dependencies (npm install)..."
    (cd "$FRONTEND_DIR" && npm install)
else
    echo -e "  ✔ Frontend node_modules verified."
fi

# 3. Process Cleanup Trap (Graceful Termination)
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo -e "\n\n${AMBER}${BOLD}Stopping EcoThread services...${NC}"
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    # Also terminate any background child processes
    pkill -P $$ 2>/dev/null || true
    echo -e "${GREEN}All EcoThread processes stopped cleanly. Have a great day! 🌱${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 4. Start Spring Boot Backend
echo -e "\n${BOLD}[3/4] Launching Spring Boot 3.3.5 Backend (Port 8080)...${NC}"
(
    cd "$BACKEND_DIR"
    export JAVA_HOME="$JAVA_HOME"
    ./mvnw spring-boot:run
) &
BACKEND_PID=$!

# Wait for backend to be responsive on port 8080
echo -n "  Waiting for backend API to initialize..."
MAX_ATTEMPTS=60
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:8080/api/impact/stats >/dev/null 2>&1; then
        echo -e " ${GREEN}Online! ✔${NC}"
        break
    fi
    sleep 1
    echo -n "."
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "\n  ${AMBER}Backend is taking longer than usual to respond, proceeding with frontend launch...${NC}"
fi

# 5. Start Vite Frontend
echo -e "\n${BOLD}[4/4] Launching Vite + React + Tailwind Frontend (Port 5173)...${NC}"
(
    cd "$FRONTEND_DIR"
    npm run dev
) &
FRONTEND_PID=$!

sleep 2

# 6. Service Dashboard & Access Links
echo -e "\n=============================================================================="
echo -e "${GREEN}${BOLD}🚀 EcoThread Platform is LIVE!${NC}"
echo -e "=============================================================================="
echo -e "  💻 ${BOLD}Frontend Web Client:${NC}   ${BLUE}${BOLD}http://localhost:5173${NC}"
echo -e "  ⚡ ${BOLD}Backend REST API:${NC}       ${BLUE}http://localhost:8080${NC}"
echo -e "  📖 ${BOLD}Swagger / OpenAPI UI:${NC}   ${BLUE}http://localhost:8080/swagger-ui/index.html${NC}"
echo -e "  🗄️  ${BOLD}H2 Database Console:${NC}   ${BLUE}http://localhost:8080/h2-console${NC}"
echo -e "      ${PURPLE}JDBC URL:${NC} jdbc:h2:mem:ecothreaddb | ${PURPLE}User:${NC} sa | ${PURPLE}Password:${NC} (none)"
echo -e "------------------------------------------------------------------------------"
echo -e "  🔑 ${BOLD}Preloaded Demo Accounts (Password for all: password123)${NC}"
echo -e "     🌿 ${BOLD}Donor:${NC}             donor@ecothread.org       (Pickup booking & 80G PDF)"
echo -e "     🛍️  ${BOLD}Beneficiary:${NC}       beneficiary@ecothread.org (150 Seasonal Credits)"
echo -e "     🚚 ${BOLD}Logistics Driver:${NC}  driver@ecothread.org      (Route pickup manifests)"
echo -e "     ⚙️  ${BOLD}Warehouse Admin:${NC}   admin@ecothread.org       (Garment QC & grading)"
echo -e "=============================================================================="
echo -e "${AMBER}Press Ctrl+C at any time to shut down both frontend and backend.${NC}\n"

# Wait for background processes to keep script running
wait $BACKEND_PID $FRONTEND_PID
