/// <reference types="cypress" />
Cypress.Commands.add('getIframeBody', (selector: string) => {
    cy.log('getIframeBody', selector);

    return (
        cy
            .get(selector, { log: false })
            .its('0.contentDocument.body', { log: false })
            .should('not.be.empty')
            // wraps "body" DOM element to allow
            // chaining more Cypress commands, like ".find(...)"
            // https://on.cypress.io/wrap
            .then((body) => cy.wrap(body, { log: false }))
    );
});
