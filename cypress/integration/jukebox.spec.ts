/// <reference types="cypress" />

describe('Jukebox', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('http://localhost:3000');
    });

    it('Should properly skip songs and go to song selection', () => {
        cy.on('uncaught:exception', (err, runnable) => {
            console.log(`caught error: ${err.message}`);
            if (err.message.indexOf("Cannot read properties of null (reading 'src')") >= 0) {
                return false;
            }
            throw err;
        });

        cy.get('[data-test="jukebox"]').click();
        cy.wait(500);
        cy.frameLoaded('#widget2');
        cy.iframe('#widget2').find('#player').should('exist');
        cy.wait(1500);
        cy.get('body').type('{uparrow}'); // "skip song"
        cy.wait(1500);
        cy.get('body').type('{enter}');
        cy.wait(1500);
        cy.get('[data-test="jukebox-container"]')
            .invoke('attr', 'data-song')
            .then((song) => {
                cy.get('body').type('{downarrow}'); // "sing this song"
                cy.get('body').type('{enter}');
                cy.get('[data-test="song-list-container"]').should('exist');
                cy.wait(1000);
                cy.get('[data-test="song-preview"]').invoke('attr', 'data-song').should('equal', song);
            });
    });
});
