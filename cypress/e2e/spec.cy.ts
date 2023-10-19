describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000')
    cy.log('abcd')

    cy.get('h3').contains('http://localhost:3001')
    cy.get('h1').contains('Hello World')
  })
})
