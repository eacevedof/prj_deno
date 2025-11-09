export type ElasticDocType = {
    domain: string;
    environment: string;
    level: string;
    date_time: string;
    server_ip: string;
    request_ip: string;
    request_uri: string;
    log_content: string;
    "@timestamp": number | string;
}
