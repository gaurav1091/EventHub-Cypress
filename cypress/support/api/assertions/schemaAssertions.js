export function assertRequiredFields(subject, requiredFields, label = "response body") {
  requiredFields.forEach((field) => {
    expect(subject, `${label} should include ${field}`).to.have.property(field);
  });
}
