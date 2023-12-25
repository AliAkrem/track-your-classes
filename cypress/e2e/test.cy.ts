describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')


    cy.get('#add-class-button-test').click()



    cy.get('input[placeholder="class name"]').type('GL2');


    cy.get('input[placeholder="class name"]').should('have.value', 'GL');

  })

})
