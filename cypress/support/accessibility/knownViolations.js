const knownAccessibilityViolations = [
  {
    pageName: "Events",
    id: "select-name",
    reason: "Category and city select controls currently do not expose accessible names.",
  },
  {
    pageName: "My Bookings",
    id: "color-contrast",
    reason: "Muted booking-card text currently misses WCAG AA contrast.",
  },
];

export function isKnownAccessibilityViolation(violation) {
  return knownAccessibilityViolations.some(
    (knownViolation) =>
      knownViolation.pageName === violation.pageName && knownViolation.id === violation.id,
  );
}

export default knownAccessibilityViolations;
