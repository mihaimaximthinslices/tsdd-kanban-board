describe('create-account flow', () => {
  describe('given the user is not logged in', () => {
    beforeEach(() => {
      cy.clearCookies()
    })

    it('should display the create account page on a small screen', () => {
      cy.visit('http://localhost:3000/sign-up')
      cy.viewport(375, 667)

      cy.contains('Create Account')

      cy.contains('Let’s get you started organizing your tasks!')

      cy.get('[data-cy="kanban-app-logo"]').should('exist')

      cy.get('[data-cy="create-account-button"]').should('exist')

      cy.get('[data-cy="sign-in-with-google-button"]').should('exist')

      cy.contains('Or sign in with Google')

      cy.get('[data-cy="email-address-input-label"]').should('exist')
      cy.get('[data-cy="email-address-input"]').should('exist')
      cy.get('[data-cy="password-input-label"]').should('exist')
      cy.get('[data-cy="password-input"]').should('exist')

      cy.get('[data-cy="confirmPassword-input-label"]').should('exist')
      cy.get('[data-cy="confirmPassword-input"]').should('exist')

      cy.get('a[href="/sign-in"]').should('exist')
    })

    it('should display the create account page and image on a big screen', () => {
      cy.visit('http://localhost:3000/sign-up')
      cy.viewport(1440, 900)

      cy.get('[data-cy="app-preview-image"]').should('exist')

      cy.contains('Create Account')

      cy.contains('Let’s get you started organizing your tasks!')

      cy.get('[data-cy="kanban-app-logo"]').should('exist')

      cy.get('[data-cy="create-account-button"]').should('exist')

      cy.get('[data-cy="sign-in-with-google-button"]').should('exist')

      cy.contains('Or sign in with Google')

      cy.get('[data-cy="email-address-input-label"]').should('exist')
      cy.get('[data-cy="email-address-input"]').should('exist')
      cy.get('[data-cy="password-input-label"]').should('exist')
      cy.get('[data-cy="password-input"]').should('exist')

      cy.get('[data-cy="confirmPassword-input-label"]').should('exist')
      cy.get('[data-cy="confirmPassword-input"]').should('exist')

      cy.get('a[href="/sign-in"]').should('exist')
    })
    describe('given the inputs are not completed', () => {
      it('should display "Can\'t be empty" text three times', () => {
        cy.visit('http://localhost:3000/sign-up')
        cy.get('[data-cy="create-account-button"]').click()

        cy.contains("Can't be empty")
          .get("span:contains(Can't be empty)")
          .should('have.length', 3)
      })
      describe('given I press on sign in with google', () => {
        it('should not show me any errors', () => {
          cy.visit('http://localhost:3000/sign-up')
          cy.get('[data-cy="sign-in-with-google-button"]').click()

          cy.contains("Can't be empty").should('not.exist')
          cy.contains('Password too short').should('not.exist')
          cy.contains('Invalid email address').should('not.exist')
        })
      })
    })

    describe('given the user clicks on input and then clicks outside', () => {
      it('errors should appear on blur', () => {
        cy.visit('http://localhost:3000/sign-up')

        cy.contains("Can't be empty").should('not.exist')
        cy.contains('Password too short').should('not.exist')
        cy.contains('Invalid email address').should('not.exist')

        cy.get('[data-cy="email-address-input"]').click()
        cy.get('[data-cy="sign-up-from"]').click()
        cy.contains("Can't be empty").should('exist')

        cy.get('[data-cy="password-input"]').click()
        cy.get('[data-cy="email-address-input"]').click()
        cy.contains("Can't be empty")
          .get("span:contains(Can't be empty)")
          .should('have.length', 2)

        cy.get('[data-cy="confirmPassword-input"]').click()
        cy.get('[data-cy="sign-up-from"]').click()
        cy.contains("Can't be empty")
          .get("span:contains(Can't be empty)")
          .should('have.length', 3)
      })
    })

    describe('given the email is not valid', () => {
      it('should display "Invalid email address" text', () => {
        cy.visit('http://localhost:3000/sign-up')
        cy.get('[data-cy="email-address-input"]').type('this is invalid')

        cy.get('[data-cy="create-account-button"]').click()

        cy.contains('Invalid email address').should('exist')
      })
    })

    describe('given the passwords do not match', () => {
      it('should display Password too short', () => {
        cy.visit('http://localhost:3000/sign-up')
        cy.get('[data-cy="email-address-input"]').type(
          'mihai.maxim@thinslices.com',
        )

        cy.get('[data-cy="password-input"]').type('test')
        cy.get('[data-cy="confirmPassword-input"]').type('test2')

        cy.get('[data-cy="create-account-button"]').click()

        cy.contains('Password too short').should('exist')
      })
    })

    describe('given the input is correct', () => {
      describe('given the user already has an account', () => {
        it('should display User already exists', () => {
          cy.intercept('POST', '/api/sign-up', {
            statusCode: 409,
          }).as('signUpUser')

          cy.visit('http://localhost:3000/sign-up')

          cy.get('[data-cy="email-address-input"]').type(
            'mihai.maxim@thinslices.com',
          )
          cy.get('[data-cy="password-input"]').type('password1234')
          cy.get('[data-cy="confirmPassword-input"]').type('password1234')

          cy.get('[data-cy="create-account-button"]').click()

          cy.wait('@signUpUser')

          cy.contains('User already exists')
            .get('span:contains(User already exists)')
            .should('have.length', 1)
        })
      })
      describe('given the user does not have an account', () => {
        it('should redirect me to /', () => {
          cy.intercept('POST', '/api/sign-up', {
            statusCode: 201,
          }).as('signUpUser')

          cy.visit('http://localhost:3000/sign-up')

          cy.get('[data-cy="email-address-input"]').type(
            'mihai.maxim@thinslices.com',
          )

          cy.get('[data-cy="password-input"]').type('password1234')
          cy.get('[data-cy="confirmPassword-input"]').type('password1234')

          cy.get('[data-cy="create-account-button"]').click()

          cy.wait('@signUpUser')

          cy.url().should('eq', 'http://localhost:3000/')
        })
      })
    })
  })
})
