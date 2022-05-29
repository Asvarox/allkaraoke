describe('Help', () => {
    it('Toggles and persist help correctly', () => {
        cy.visit('http://localhost:3000');

        cy.get('[data-test="help-container"]').should('exist');
        cy.get('body').type('h'); // toggle help
        cy.get('[data-test="help-container"]').should('not.exist');
        cy.reload();
        cy.get('[data-test="help-container"]').should('not.exist');
    });
});
