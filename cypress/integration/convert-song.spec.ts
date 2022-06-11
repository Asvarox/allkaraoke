// convert-song.spec.ts created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test
/* ==== Test Created with Cypress Studio ==== */

const txtfile = `
#TITLE:Friday I'm in Love
#ARTIST:The Cure
#LANGUAGE:English
#YEAR:1992
#VIDEOGAP:0,3
#BPM:272
#GAP:33088,24
: 0 3 58 I
`;

it('should not crash', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('http://localhost:3000');
    cy.get('[data-test="convert-song"]').click();
    cy.get('[data-test="output"]').should('be.visible');
    cy.get('[data-test="input-txt"]').clear();
    cy.get('[data-test="input-txt"]').type(txtfile);
    cy.get('[data-test="input-video-url"]').clear();
    cy.get('[data-test="input-video-url"]').type('https://www.youtube.com/watch?v=8YKAHgwLEMg');
    cy.get('[data-test="player-container"]').should('be.visible');
    /* ==== End Cypress Studio ==== */
});
