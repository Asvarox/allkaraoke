// source-selection.spec.ts created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
/* ==== Test Created with Cypress Studio ==== */
it('should not crash', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('http://localhost:3000');
    cy.get('[data-test="select-input"]').click();
    cy.get('[data-test="player-1-source"]').click();
    cy.get('[data-test="player-1-input"]').click();
    cy.get('[data-test="player-1-input"]').click();
    cy.get('[data-test="player-1-source"]').click();
    cy.get('[data-test="player-1-input"]').click();
    cy.get('[data-test="player-1-input"]').click();
    cy.get('[data-test="player-1-input"]').click();
    cy.get('[data-test="player-1-input"]').click();
    cy.get('[data-test="player-1-input"]').click();
    cy.get('[data-test="player-1-input"]').click();
    cy.get('[data-test="player-2-source"]').click();
    cy.get('[data-test="player-2-source"]').click();
    cy.get('[data-test="player-2-source"]').click();
    cy.get('[data-test="player-2-input"]').click();
    cy.get('[data-test="player-2-input"]').click();
    cy.get('[data-test="player-2-input"]').click();
    cy.get('[data-test="player-2-source"]').click();
    cy.get('[data-test="player-2-input"]').click();
    cy.get('[data-test="player-2-input"]').click();
    cy.get('[data-test="player-2-input"]').click();
    cy.get('[data-test="mic-mismatch-warning"]').should('be.visible');
    cy.get('[data-test="back-button"]').click();
    /* ==== End Cypress Studio ==== */
});
