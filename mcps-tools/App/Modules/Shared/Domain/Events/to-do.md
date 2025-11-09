crear esta Interfaz:
https://github.com/eacevedof/prj_marketing/blob/main/backend_web/src/Shared/Domain/Bus/Event/IEvent.php

crear este abstract: 
https://github.com/eacevedof/prj_marketing/blob/main/backend_web/src/Shared/Infrastructure/Bus/AbstractEvent.php

```php
interface IEvent
{
    public static function fromPrimitives(
        int    $aggregateId,
        array  $body,
        string $eventId,
        int    $occurredOn,
        string $correlationId,
        string $causationId
    ): self;

    public static function eventName(): string;
    public function toPrimitives(): array;

    public function aggregateId(): int;
    public function eventId(): string;
    public function occurredOn(): int;
    public function correlationId(): string;
    public function causationId(): string;
}

abstract class AbstractEvent implements IEvent
{
    private int $aggregateId;
    private string $eventId;
    private int $occurredOn;

    //id del evento inicial
    private string $correlationId;
    //id del padre
    private string $causationId;

    public function __construct(
        int     $aggregateId,
        ?string $eventId = null,
        ?int    $occurredOn = null,
        ?string $correlationId = null,
        ?string $causationId = null
    ) {
        $this->aggregateId = $aggregateId;
        $this->eventId = $eventId ?? uniqid();
        $this->occurredOn = $occurredOn ?? (new DateTimeImmutable)->getTimestamp();
        //creador original
        $this->correlationId = $correlationId ?? $this->eventId;
        //padre directo
        $this->causationId = $causationId ?? $this->correlationId;
    }

    abstract public static function fromPrimitives(
        int    $aggregateId,
        array  $body,
        string $eventId,
        int    $occurredOn,
        string $correlationId,
        string $causationId
    ): self;

    abstract public static function eventName(): string;

    abstract public function toPrimitives(): array;

    public function aggregateId(): int
    {
        return $this->aggregateId;
    }

    public function eventId(): string
    {
        return $this->eventId;
    }

    public function occurredOn(): int
    {
        return $this->occurredOn;
    }

    public function correlationId(): string
    {
        return $this->correlationId;
    }

    public function causationId(): string
    {
        return $this->causationId;
    }
}

final class PromotionWasCreatedEvent extends AbstractEvent
{
    private string $uuid;
    private int $idOwner;
    private string $slug;

    public function __construct(
        int     $idUser,
        string  $uuid,
        int     $idOwner,
        string  $slug,
        ?string $eventId = null,
        ?int    $occurredOn = null,
        ?string $correlationId = null,
        ?string $causationId = null
    ) {
        parent::__construct($idUser, $eventId, $occurredOn, $correlationId, $causationId);
        $this->uuid = $uuid;
        $this->idOwner = $idOwner;
        $this->slug = $slug;
    }

    public static function eventName(): string
    {
        return "promotion.created";
    }

    public static function fromPrimitives(
        int     $aggregateId,
        array   $body,
        ?string $eventId = null,
        ?int    $occurredOn = null,
        ?string $correlationId = null,
        ?string $causationId = null
    ): AbstractEvent {
        return new self(
            $aggregateId,
            $body["uuid"],
            $body["id_owner"],
            $body["slug"],
            $eventId,
            $occurredOn,
            $correlationId,
            $causationId
        );
    }

    public function toPrimitives(): array
    {
        return [
            "uuid" => $this->uuid,
            "id_owner" => $this->idOwner,
            "slug" => $this->slug,
        ];
    }

    public function uuid(): string
    {
        return $this->uuid;
    }

    public function idOwner(): int
    {
        return $this->idOwner;
    }

    public function slug(): string
    {
        return $this->slug;
    }
}

EventBus::instance()->publish(...[
    PromotionWasCreatedEvent::fromPrimitives(
    $payload["promotionEntity"]["id"], 
    $payload["promotionEntity"]
    )
]);
```