/**
 * Tests Bundle - Main entry point for all controller tests
 * 
 * This file imports all controller tests following the import order specified in Some-App-Xxx-tests.ia.md:
 * 1. Deno libraries
 * 2. Third-party libraries  
 * 3. Shared libraries (enums, components, repositories, entities, exceptions)
 * 4. Other modules (not current one) following previous order
 * 5. Current module libraries and exceptions last
 */

// =============================================================================
// TEST ENVIRONMENT SETUP
// =============================================================================
// Set global flag to indicate we're in test mode
// This prevents file logging operations that would cause async operation leaks
(globalThis as any).IS_TEST_MODE = true;

// Connection pools are initialized/closed by each test suite individually
// using beforeAll() and afterAll() hooks for proper leak detection

// =============================================================================
// 1. DENO LIBRARIES
// =============================================================================
// (No deno libraries needed in this bundle)

// =============================================================================
// 2. THIRD-PARTY LIBRARIES
// =============================================================================
// (No third-party libraries needed in this bundle)

// =============================================================================
// 3. SHARED MODULE TESTS
// =============================================================================
// (Shared module doesn't have controllers to test, only infrastructure components)

// =============================================================================
// 4. OTHER MODULES CONTROLLER TESTS (Alphabetical order)
// =============================================================================

// Documentation Module
// Tests/Modules/Documentation/Infrastructure/Controllers/DocumentationWebController/DocumentationWebControllerTest.ts
// (Not implemented yet - Documentation controllers usually don't need tests)

// HealthCheck Module
// Tests/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController/GetHealthCheckStatusControllerTest.ts
// (Not implemented yet - Will be added when created)

// Projects Module  
// Tests/Modules/Projects/Infrastructure/Controllers/GetProjectConfigController/GetProjectConfigControllerTest.ts
// (Not implemented yet - Will be added when created)

// UserDevices Module
// Tests/Modules/UserDevices/Infrastructure/Controllers/ConfirmUserDeviceController/ConfirmUserDeviceControllerTest.ts
// Tests/Modules/UserDevices/Infrastructure/Controllers/DeleteUserDeviceController/DeleteUserDeviceControllerTest.ts
// Tests/Modules/UserDevices/Infrastructure/Controllers/GenerateUserDeviceCodeController/GenerateUserDeviceCodeControllerTest.ts
// Tests/Modules/UserDevices/Infrastructure/Controllers/GetUserDevicesByUserUuidController/GetUserDevicesByUserUuidControllerTest.ts
// (Not implemented yet - Will be added when created)

// Users Module
// Tests/Modules/Users/Infrastructure/Controllers/CreateUserController/CreateUserControllerTest.ts
// Tests/Modules/Users/Infrastructure/Controllers/DeleteUserController/DeleteUserControllerTest.ts
// (Not implemented yet - Will be added when created)

// =============================================================================
// 5. CURRENT MODULE TESTS (mod-name Module) - Load last as per instructions
// =============================================================================

// mod-name Module - GetDomainRiskController
import "Tests/Modules/mod-name/Infrastructure/Controllers/GetDomainRiskController/GetDomainRiskControllerTest.ts";
// mod-name Module - ReevaluateDomainRiskController
import "Tests/Modules/mod-name/Infrastructure/Controllers/ReevaluateDomainRiskController/ReevaluateDomainRiskControllerTest.ts";

// =============================================================================
// EXPORT STATEMENT (if needed for programmatic access)
// =============================================================================
export {};

// =============================================================================
// TODO: Add imports for remaining controller tests when implemented:
// =============================================================================
/*
import "Tests/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController/GetHealthCheckStatusControllerTest.ts";
import "Tests/Modules/Projects/Infrastructure/Controllers/GetProjectConfigController/GetProjectConfigControllerTest.ts";
import "Tests/Modules/UserDevices/Infrastructure/Controllers/ConfirmUserDeviceController/ConfirmUserDeviceControllerTest.ts";
import "Tests/Modules/UserDevices/Infrastructure/Controllers/DeleteUserDeviceController/DeleteUserDeviceControllerTest.ts";
import "Tests/Modules/UserDevices/Infrastructure/Controllers/GenerateUserDeviceCodeController/GenerateUserDeviceCodeControllerTest.ts";
import "Tests/Modules/UserDevices/Infrastructure/Controllers/GetUserDevicesByUserUuidController/GetUserDevicesByUserUuidControllerTest.ts";
import "Tests/Modules/Users/Infrastructure/Controllers/CreateUserController/CreateUserControllerTest.ts";
import "Tests/Modules/Users/Infrastructure/Controllers/DeleteUserController/DeleteUserControllerTest.ts";
*/