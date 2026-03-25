#!/bin/bash

# Start docker compose with automatic host port selection.
# If a preferred port is busy, the script increments until a free one is found.

set -euo pipefail

ENVIRONMENT="${1:-development}"
shift || true

COMPOSE_FILE="docker-compose.yml"
MAX_SCAN="${MAX_PORT_SCAN_ATTEMPTS:-200}"

# Keep selected ports unique within this run.
declare -A SELECTED_PORTS

print_info() {
    echo "[PORT] $1"
}

print_warn() {
    echo "[PORT][WARN] $1"
}

is_numeric_port() {
    [[ "$1" =~ ^[0-9]+$ ]] && [ "$1" -ge 1 ] && [ "$1" -le 65535 ]
}

is_port_in_use() {
    local port="$1"

    if command -v ss >/dev/null 2>&1; then
        ss -ltnH "( sport = :${port} )" 2>/dev/null | grep -q .
        return $?
    fi

    if command -v lsof >/dev/null 2>&1; then
        lsof -iTCP:"${port}" -sTCP:LISTEN -n -P >/dev/null 2>&1
        return $?
    fi

    if command -v netstat >/dev/null 2>&1; then
        netstat -ltn 2>/dev/null | awk '{print $4}' | grep -E "[:.]${port}$" >/dev/null 2>&1
        return $?
    fi

    print_warn "No port-check tool found (ss/lsof/netstat). Assuming port ${port} is free."
    return 1
}

is_port_already_selected() {
    local port="$1"
    [[ -n "${SELECTED_PORTS[$port]:-}" ]]
}

find_next_free_port() {
    local start_port="$1"
    local label="$2"
    local attempt=0
    local port="$start_port"

    while [ "$attempt" -lt "$MAX_SCAN" ]; do
        if ! is_port_in_use "$port" && ! is_port_already_selected "$port"; then
            SELECTED_PORTS["$port"]="$label"
            echo "$port"
            return 0
        fi

        port=$((port + 1))
        if [ "$port" -gt 65535 ]; then
            break
        fi
        attempt=$((attempt + 1))
    done

    echo ""
    return 1
}

resolve_port_var() {
    local var_name="$1"
    local default_port="$2"
    local label="$3"

    local requested_port="${!var_name:-$default_port}"

    if ! is_numeric_port "$requested_port"; then
        print_warn "${var_name} has invalid value '${requested_port}', using default ${default_port}."
        requested_port="$default_port"
    fi

    local resolved_port
    resolved_port="$(find_next_free_port "$requested_port" "$label")"

    if [ -z "$resolved_port" ]; then
        echo "[PORT][ERROR] Could not find free port for ${var_name} after ${MAX_SCAN} attempts from ${requested_port}." >&2
        exit 1
    fi

    if [ "$resolved_port" != "$requested_port" ]; then
        print_warn "${label}: ${requested_port} is busy, using ${resolved_port}."
    else
        print_info "${label}: using ${resolved_port}."
    fi

    export "${var_name}=${resolved_port}"
}

print_info "Resolving host ports for ENV=${ENVIRONMENT}..."

resolve_port_var "MONGO_PORT" "27017" "MongoDB"
resolve_port_var "REDIS_PORT" "6379" "Redis"
resolve_port_var "API_PORT" "5000" "API"
resolve_port_var "DEBUG_PORT" "9229" "Node Debug"
resolve_port_var "NGINX_HTTP_PORT" "80" "Nginx HTTP"
resolve_port_var "NGINX_HTTPS_PORT" "443" "Nginx HTTPS"

export ENV="${ENVIRONMENT}"

print_info "Starting docker compose with resolved ports..."
docker compose -f "${COMPOSE_FILE}" up -d "$@"

print_info "Docker compose started."
print_info "Resolved host ports:"
print_info "- MongoDB: ${MONGO_PORT}"
print_info "- Redis: ${REDIS_PORT}"
print_info "- API: ${API_PORT}"
print_info "- Debug: ${DEBUG_PORT}"
print_info "- Nginx HTTP: ${NGINX_HTTP_PORT}"
print_info "- Nginx HTTPS: ${NGINX_HTTPS_PORT}"
