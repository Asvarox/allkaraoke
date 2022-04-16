describe('Jukebox', () => {
    beforeEach(() => {
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
