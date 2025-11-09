export type GenericEvent = {
    eventId: string;
    eventSource: string;
    eventName: string;
    occurredOn: number;

    correlationId?: string;
    causationId?: string;

    aggregateId: number;
    body: Record<string, number | string | boolean | null>;
}
/*
//body
domainUuid: string;
domainName: string;
evaluationType: string;
domainPendingId: number;


device_token: this.getDomainRiskDto.getDeviceAuthToken(),
    domain_uuid: this.domainUuid,
    domain_name: this.domainToCheck,
    evaluation_type: EvaluationTypeEnum.NEW.valueOf(),
    domain_pending_id: domainPendingPgId

 */