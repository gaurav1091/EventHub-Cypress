export default class BaseApi {
  constructor(context) {
    this.context = context;
  }

  get apiBaseUrl() {
    return this.context.apiBaseUrl;
  }

  authenticatedRequest(options) {
    const requestWithToken = () =>
      cy.request({
        failOnStatusCode: true,
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${this.context.token}`,
        },
      });

    if (this.context.token) {
      return requestWithToken();
    }

    return this.context.login().then(requestWithToken);
  }
}
