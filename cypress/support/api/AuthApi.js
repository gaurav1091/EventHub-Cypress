export default class AuthApi {
  constructor(context) {
    this.context = context;
  }

  login(email = Cypress.env("userEmail"), password = Cypress.env("userPassword")) {
    return cy
      .request({
        method: "POST",
        url: `${this.context.apiBaseUrl}/api/auth/login`,
        body: {
          email,
          password,
        },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.eq(true);
        expect(response.body.token).to.be.a("string").and.not.be.empty;
        this.context.token = response.body.token;
        return response.body;
      });
  }

  getCurrentUser() {
    return this.context.authenticatedRequest({
      method: "GET",
      url: `${this.context.apiBaseUrl}/api/auth/me`,
    });
  }
}
