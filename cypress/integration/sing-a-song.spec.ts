/// <reference types="cypress" />

describe('Sing a song', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('http://localhost:3000');
        cy.intercept('GET', '/songs/index.json', { fixture: 'songs/index.json' });
        cy.intercept('GET', '/songs/e2e-test.json', { fixture: 'songs/e2e-test.json' });
        cy.intercept('GET', '/songs/e2e-test-multitrack.json', { fixture: 'songs/e2e-test-multitrack.json' });
    });

    it('goes through singing properly using keyboard', () => {
        cy.get('[data-test="sing-a-song"]').click();
        cy.wait(500);
        cy.get('body').type('{rightarrow}'); // next song
        cy.get('body').type('{enter}'); // focus
        cy.get('body').type('{uparrow}'); // player 2 track
        cy.get('body').type('{enter}'); // change to track 1
        cy.get('body').type('{uparrow}'); // player 1 track
        cy.get('body').type('{enter}'); // change to track 2
        cy.get('body').type('{uparrow}'); // game mode
        cy.get('body').type('{enter}'); // change to pass the mic
        cy.get('body').type('{uparrow}'); // difficulty
        cy.get('body').type('{enter}'); // change to hard
        cy.get('[data-test="player-2-track-setting"]').should('have.attr', 'data-test-value', '1');
        cy.get('[data-test="player-1-track-setting"]').should('have.attr', 'data-test-value', '2');
        cy.get('[data-test="game-mode-setting"]').should('have.attr', 'data-test-value', 'Pass The Mic');
        cy.get('[data-test="difficulty-setting"]').should('have.attr', 'data-test-value', 'Hard');

        cy.get('body').type('{uparrow}'); // play button
        cy.get('body').type('{enter}'); // start song

        cy.wait(18000);
        cy.get('[data-test="play-next-song-button"]').click();
        cy.get('[data-test="song-e2e-test.json"]').should('exist');
    });
});
