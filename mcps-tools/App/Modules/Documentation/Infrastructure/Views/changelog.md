# Lazarus Anti mod-name API - Changelog

⬅️ [volver a la api]({{appBaseUrl}})

#### {{appVersion}} - Actualización: {{appVersionUpdate}}

**Fixed:**
- Ahora aplica pooling. Se reutilizan conexiones a PostgreSQL y Redis con pools configurables. Antes se abria y cerraba una conexion por cada query (ineficiente y lento)
- Mailer: Aplica alias RFC 5322 en envio ("Name" <email@domain.com>)
- corrige contraseña en mailer

**Modified:**
  - Actualizados controladores usando metodo handleUnknownError()

**New:**
- **Environment Variables** (@env):
  - APP_DB_POOL_SIZE: PostgreSQL connection pool size (default: 20)
  - APP_EMAIL_FROM_NAME: Email sender alias name (optional)

#### v.0.0.7 - Actualización: 2025-10-01
**Deleted:**
- /v1/domains/remove-reevaluated-domain (ahora va por eventos en Redis)
- RemoveReevaluatedDomainController and related services
- Test cases for removed endpoint
**Modified:**
- **Redis Performance Optimization**:
  - DomainsScoredReaderRedisRepository: Implemented Redis pipeline for bulk HGETALL operations (N → 1 round-trip)
  - DomainsScoredWriterRedisRepository: Implemented Redis pipeline for bulk HSET+EXPIRE operations (2N → 1 round-trip)
  - DomainsPendingWriterRedisRepository: Implemented Redis pipeline for bulk operations
  - AbstractRedisRepository: Added getBulkHashSets() and saveBulkHashSets() methods using redis.multi()
- **Error Handling**:
  - All controllers now send alert emails on unhandled exceptions via SendAlertEmailService
  - Non-blocking email sending using promises instead of async/await
**New:**
- **Mailings Module**:
  - SendAlertEmailService: Alert email service for error notifications
  - Three public methods: invoke(), sendSecurityThreatAlert(), sendWarning()
  - Background email execution to avoid blocking HTTP responses
- **Documentation**:
  - architecture.md: Architecture documentation with performance analysis and scaling strategies
**Fixed:**
- N+1 query anti-pattern in Redis bulk operations (up to 100k queries → 1 pipeline)
- ETL bulk operations now use optimized Redis pipelines
- Documentation endpoint numbering after removing endpoint #9

#### v.0.0.6 - Actualización: 2025-09-30
**Fixed:**
- Antes el error no se escalaba y se devolvia un 400 porque no entraba el body de la request por un json mal formado
- Ahora se escala el error y devuelve un 400 con el mensaje wrong json body

#### v.0.0.5 - Actualización: 2025-08-28
**Deleted:**
- /v1/mod-name/check-if-domain-is-dangerous (renamed to get-domain-risk)
**Modified:**
- **mod-name Module**:
- renamed: /v1/mod-name/check-if-domain-is-dangerous → /v1/mod-name/get-domain-risk
**New:**
- **mod-name Module**:
   - POST /v1/mod-name/reevaluate-domain-risk - Queue domains for reevaluation by ETL workers
- **Domains Module**:
   - POST /v1/domains/remove-reevaluated-domain
- **User Devices Module**:
   - PATCH /v1/user-devices/update-notification-token - Update device FCM push tokens after confirmation

#### v.0.0.4 - Actualización: 2025-08-25
- nuevo endpoint de notificaciones push

#### v.0.0.3 - Actualización: 2025-08-21
- incluye Redis 
- Tests unitarios para el **módulo mod-name**
- ETL con ftp para postgres
- Nuevo endpoint de configuración global del proyecto
- Nuevo endpoint de scoring de dominios masivo
- Se quita oak como framework de servidor
- Servidor de contenido estático
- CSS documentación

### TO-DO
- etl lista blanca
- endpoint con comprobacion de dominio sin device token solo cli-token 
- crear endpoint para configuracion de datos del cliente para notificaciones push ios: ver safelink de tarea 1446
- quitar: curl --location 'https://appms-someappxxx.examplebsntechservices.com/v1/domains/remove-reevaluated-domain', ahora va por eventos en redis
  - crear worker que consuma los eventos de calculo/recalculo de dominios que escriba en redis y pg 
- endpoint de login / logout por OTP
- endpoint de comprobacion de estado de usuario. si esta borrado o inactivo, al borrar un usuario incluirlo en redis
- enviar notificaciones push despues de evaluar dominio con el dominio y su riesgo
- enova: ETL scoring de dominios
- tabla de metadata de usuarios cuando el servicio no tiene plataforma
- tagging de dominios (organizacion por sectores)
- auto inyeccion de dependencias

⬅️ [volver a la api]({{appBaseUrl}})