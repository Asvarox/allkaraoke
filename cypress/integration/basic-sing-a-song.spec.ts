describe('Sing a song', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000', {
            onBeforeLoad(win) {
                win.Math.random = () => 0.5;

                // @ts-ignore
                win.cypress = true;
            },
        });
        cy.intercept('GET', '/songs/index.json', { fixture: 'songs/index.json' });
        cy.intercept('GET', '/songs/e2e-test.json', { fixture: 'songs/e2e-test.json' });
        cy.intercept('GET', '/songs/e2e-test-multitrack.json', { fixture: 'songs/e2e-test-multitrack.json' });
    });

    it('goes through singing properly', () => {
        cy.get('[data-test="sing-a-song"]').click();
        cy.wait(500);
        cy.get('body').type('{rightarrow}'); // next song
        cy.get('body').type('{enter}'); // focus
        cy.get('body').type('{enter}'); // start song

        cy.get('[data-test="lyrics-line-player-1"]', { timeout: 7_000 }).should('be.visible');
        cy.wait(2_900);
        cy.get('canvas').then((elem) => {
            const width = elem.innerWidth();
            const height = elem.innerHeight();

            cy.get('canvas').toMatchImageSnapshot({
                threshold: 0.01,
                // @ts-ignore
                screenshotConfig: { clip: { x: 0, y: 40, width, height: height - 80 } },
            });
        });

        cy.get('[data-test="play-next-song-button"]', { timeout: 30_000 }).click();
        cy.get('[data-test="song-e2e-test.json"]').should('exist');
    });

    it('allows song setup using keyboard', () => {
        cy.get('[data-test="sing-a-song"]').click();
        cy.wait(500);
        cy.get('body').type('{enter}'); // enter first song
        cy.get('body').type('{backspace}'); // enter first song
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
    });

    describe('Filters', () => {
        it('should open and close filters songs by title', () => {
            cy.get('[data-test="sing-a-song"]').click();
            cy.wait(500);
            cy.get('body').type('f'); // Show filters
            cy.get('[data-test="song-list-filters"]').should('exist');

            cy.get('body').type('{enter}'); // focus search song
            cy.get('body').type('multitrack');
            cy.get('body').type('{enter}'); // un-focus search
            cy.get('[data-test="song-e2e-test-multitrack.json"]').should('exist');
            cy.get('[data-test="song-e2e-test.json"]').should('not.exist');
            for (let i = 0; i < 10; i++) cy.get('body').type('{backspace}');
            cy.get('[data-test="filters-search-form"]').submit();

            cy.get('body').type('{rightarrow}'); // language filters
            cy.get('body').type('{enter}'); // english
            cy.get('[data-test="song-e2e-test-multitrack.json"]').should('not.exist');
            cy.get('[data-test="song-e2e-test.json"]').should('exist');
            cy.get('body').type('{enter}'); // polish
            cy.get('[data-test="song-e2e-test-multitrack.json"]').should('exist');
            cy.get('[data-test="song-e2e-test.json"]').should('not.exist');
            cy.get('body').type('{enter}'); // All

            cy.get('body').type('{rightarrow}'); // duet filters
            cy.get('body').type('{enter}'); // Duet
            cy.get('[data-test="song-e2e-test-multitrack.json"]').should('exist');
            cy.get('[data-test="song-e2e-test.json"]').should('not.exist');
            cy.get('body').type('{enter}'); // Solo
            cy.get('[data-test="song-e2e-test-multitrack.json"]').should('not.exist');
            cy.get('[data-test="song-e2e-test.json"]').should('exist');

            cy.get('body').type('{downarrow}');
            cy.get('[data-test="song-preview"]').invoke('attr', 'data-song').should('equal', 'e2e-test.json');
        });
    });
});
