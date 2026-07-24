import LoginPage from "./pages/LoginPage";
import NavigationBar from "./components/NavigationBar";
import EventHubClient from "./api/EventHubClient";

Cypress.Commands.add(
  "login",
  (email = Cypress.env("userEmail"), password = Cypress.env("userPassword")) => {
    if (!email || !password) {
      throw new Error(
        "Missing EventHub credentials. Set EVENTHUB_USER_EMAIL and EVENTHUB_USER_PASSWORD in .env.",
      );
    }

    cy.session(
      [email],
      () => {
        const loginPage = new LoginPage();

        loginPage.visit();
        loginPage.login(email, password);
        new NavigationBar().assertAuthenticatedAs(email);
      },
      {
        validate() {
          cy.visit("/");
          new NavigationBar().assertAuthenticatedAs(email);
        },
      },
    );
  },
);

Cypress.Commands.add("loginByUi", () => {
  const loginPage = new LoginPage();

  loginPage.visit();
  loginPage.login(Cypress.env("userEmail"), Cypress.env("userPassword"));
});

Cypress.Commands.add("apiClient", () => {
  const client = new EventHubClient();

  return client.login().then(() => client);
});

Cypress.Commands.add("cleanupTestData", () => {
  const client = new EventHubClient();

  return client.login().then(() => {
    return client.cleanupBookingsByCustomerPrefix().then(() => client.cleanupEventsByTitlePrefix());
  });
});
