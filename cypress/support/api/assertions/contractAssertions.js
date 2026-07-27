import contract from "../../../fixtures/contracts/eventhub-api-contract.json";

export function getContractOperation(operationId) {
  const operation = contract.operations.find((item) => item.operationId === operationId);

  expect(operation, `API contract operation ${operationId}`).to.exist;

  return operation;
}

export function assertResponseMatchesContract(response, operationId, expectedStatus = null) {
  const operation = getContractOperation(operationId);
  const allowedStatuses = [operation.successStatus, ...(operation.errorStatuses || [])].filter(
    Boolean,
  );
  const status = expectedStatus || operation.successStatus;

  expect(operation.method, `${operationId} should declare an HTTP method`).to.be.a("string").and.not
    .be.empty;
  expect(operation.path, `${operationId} should declare a path`).to.match(/^\/api\//);
  expect(allowedStatuses, `${operationId} should allow status ${response.status}`).to.include(
    response.status,
  );
  expect(response.status, `${operationId} expected status`).to.eq(status);
}

export function assertContractIsDocumented() {
  const operationIds = contract.operations.map((operation) => operation.operationId);

  expect(contract.name).to.eq("EventHub Internal API Contract");
  expect(contract.version).to.match(/^\d+\.\d+\.\d+$/);
  expect(operationIds, "operation ids should be unique").to.have.length(new Set(operationIds).size);
  expect(operationIds).to.include.members([
    "getHealth",
    "login",
    "getCurrentUser",
    "listEvents",
    "getEvent",
    "createBooking",
    "deleteBooking",
  ]);
}
