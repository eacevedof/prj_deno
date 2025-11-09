#!/bin/bash

# ./curl-get-example-stress.sh 1000 50    # 1000 requests, 50 en paralelo

clear
TOTAL=${1:-100}
PARALLEL=${2:-10}

echo "Starting $TOTAL requests with parallelism of $PARALLEL..."

log_file="curl-domain-risk-$TOTAL-$PARALLEL.log"

if ! [[ "$TOTAL" =~ ^[0-9]+$ ]] || ! [[ "$PARALLEL" =~ ^[0-9]+$ ]]; then
    echo "Uso: $0 [total_calls] [parallelism]"
    exit 2
fi

# Limpiar log anterior
> "$log_file"

start_date=$(date '+%Y-%m-%d %H:%M:%S.%6N')

seq 1 "$TOTAL" | xargs -P "$PARALLEL" -I {} bash -c '
    idx={}
    parallel='"$PARALLEL"'

    # Marcar inicio de bloque (cada PARALLEL requests)
    if (( idx % parallel == 1 )); then
        echo ""
        echo "--- Batch $((idx / parallel + 1)) [requests $idx-$((idx + parallel - 1))] ---"
    fi

    response=$(curl -s -w "\n%{http_code}|%{time_total}" --location \
        --connect-timeout 10 \
        --max-time 45 \
        --retry 0 \
        "https://appms-someappxxx.examplebsntechservices.com/v1/mod-name/get-example-stress" \
        --header "Content-Type: application/json" \
        --header "appmsaph-device-auth: aph-dev-auth-vNpd2gHWCSrBMPtTkWM6an3ogMsiuv5Kh0N" \
        --data "{
          \"domain_uuid\": \"ab6cd537f9ead71a668024afbf2087ac\",
          \"domain\": \"000000000000000000000000000000000000dbscrfg.000webhostapp.com\"
        }" 2>&1)

    # Extraer código HTTP y tiempo
    last_line=$(echo "$response" | tail -1)
    http_code=$(echo "$last_line" | cut -d"|" -f1)
    time_total=$(echo "$last_line" | cut -d"|" -f2)
    body=$(echo "$response" | head -n -1)

    # Log resultado con índice
    if [[ "$http_code" == "200" ]]; then
        echo "✓ [$idx] 200 ${time_total}s"
    else
        echo "✗ [$idx] $http_code ${time_total}s - $body"
    fi
' | tee -a "$log_file"

echo "" | tee -a "$log_file"
end_date=$(date '+%Y-%m-%d %H:%M:%S.%6N')
echo "Start time: $start_date" | tee -a "$log_file"
echo "End time: $end_date" | tee -a "$log_file"
echo "" | tee -a "$log_file"

# Calcular duración
start_seconds=$(date -d "$start_date" +%s.%N 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S" "$(echo $start_date | cut -d'.' -f1)" +%s)
end_seconds=$(date -d "$end_date" +%s.%N 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S" "$(echo $end_date | cut -d'.' -f1)" +%s)
duration=$(awk -v start="$start_seconds" -v end="$end_seconds" 'BEGIN {printf "%.2f", end - start}')

# totales
total_responses=$(grep -E "^[✓✗]" "$log_file" | wc -l)
success_count=$(grep -c "^✓.*200" "$log_file" 2>/dev/null || echo 0)

# Separar curl errors (000) de HTTP errors
curl_error_count=$(grep "^✗.*000" "$log_file" 2>/dev/null | wc -l)
http_error_count=$(grep "^✗" "$log_file" 2>/dev/null | grep -v "000" | wc -l)
no_response_count=$((TOTAL - total_responses))

fail_count=$((curl_error_count + http_error_count))

# Calcular tiempo promedio de respuesta (solo requests que respondieron, excluyendo 000)
# Extraer tiempos de respuesta (formato: "✓ [1] 200 0.045s" -> "0.045")
response_times=$(grep -E "^[✓✗]" "$log_file" | grep -v " 000 " | awk '{print $4}' | sed 's/s$//' | grep -E "^[0-9]+\.[0-9]+$")
if [ -n "$response_times" ]; then
    responses_with_time=$(echo "$response_times" | wc -l)
    avg_response_time=$(echo "$response_times" | awk '{sum+=$1; count++} END {if(count>0) printf "%.3f", sum/count; else print "0.000"}')
    min_response_time=$(echo "$response_times" | sort -n | head -1)
    max_response_time=$(echo "$response_times" | sort -n | tail -1)
else
    avg_response_time="0.000"
    min_response_time="0.000"
    max_response_time="0.000"
    responses_with_time=0
fi

# contar codigos de error
error_codes=$(grep "^✗" "$log_file" 2>/dev/null | awk '{print $3}' | sort | uniq -c | sort -rn)

# porcentajes
if [ "$TOTAL" -gt 0 ]; then
    success_pct=$(awk -v s="$success_count" -v t="$TOTAL" 'BEGIN {printf "%.2f", (s/t)*100}')
    curl_error_pct=$(awk -v c="$curl_error_count" -v t="$TOTAL" 'BEGIN {printf "%.2f", (c/t)*100}')
    http_error_pct=$(awk -v h="$http_error_count" -v t="$TOTAL" 'BEGIN {printf "%.2f", (h/t)*100}')
    no_response_pct=$(awk -v n="$no_response_count" -v t="$TOTAL" 'BEGIN {printf "%.2f", (n/t)*100}')
else
    success_pct="0.00"
    curl_error_pct="0.00"
    http_error_pct="0.00"
    no_response_pct="0.00"
fi

{
    echo "═══════════════════════════════════════"
    echo "RESULTS SUMMARY"
    echo "═══════════════════════════════════════"
    echo "Total requests:    $TOTAL / $PARALLEL parallel"
    echo "Execution time:    ${duration}s"
    echo "Throughput:        $(awk -v t="$TOTAL" -v d="$duration" 'BEGIN {printf "%.2f", t/d}') req/s"
    echo ""
    echo "Response times (excluding timeouts):"
    echo "  Responses:       $responses_with_time"
    echo "  Average:         ${avg_response_time}s"
    echo "  Min:             ${min_response_time}s"
    echo "  Max:             ${max_response_time}s"
    echo ""
    echo "Success (200):     $success_count ($success_pct%)"
    echo "Curl errors (000): $curl_error_count ($curl_error_pct%) - timeout/connection failed (over 45s)"
    echo "HTTP errors:       $http_error_count ($http_error_pct%) - 4xx/5xx responses"
    echo "No response:       $no_response_count ($no_response_pct%) - script killed/crashed"
    echo ""
    if [ "$fail_count" -gt 0 ]; then
        echo "Error codes breakdown:"
        while IFS= read -r line; do
            count=$(echo "$line" | awk '{print $1}')
            code=$(echo "$line" | awk '{print $2}')
            pct=$(awk -v c="$count" -v t="$TOTAL" 'BEGIN {printf "%.2f", (c/t)*100}')

            # Explicar código
            case "$code" in
                000) desc="timeout/connection failed" ;;
                400) desc="Bad Request" ;;
                401) desc="Unauthorized" ;;
                403) desc="Forbidden" ;;
                404) desc="Not Found" ;;
                500) desc="Internal Server Error" ;;
                502) desc="Bad Gateway" ;;
                503) desc="Service Unavailable" ;;
                504) desc="Gateway Timeout" ;;
                *) desc="HTTP $code" ;;
            esac

            echo "  $code: $count ($pct%) - $desc"
        done <<< "$error_codes"
    fi
    echo "═══════════════════════════════════════"
} | tee -a "$log_file"

#  watch -n 1 'ps aux | grep appms-someappxxx.examplebsntechservices.com'