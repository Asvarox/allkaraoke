/// <reference types="cypress" />
import './commands';

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to select DOM element by data-cy attribute.
             * @example cy.dataCy('greeting')
             */
            getIframeBody(selector: string): Chainable<JQuery<any>>;
        }
    }
}
