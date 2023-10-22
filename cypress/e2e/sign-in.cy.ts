describe('sign-in-account flow', () => {
  describe('given the user is not logged in', () => {
    beforeEach(() => {
      cy.clearCookies()
    })

    it('should display the sign in page on a small screen', () => {
      cy.visit('http://localhost:3000/sign-in')
      cy.viewport(375, 667)

      cy.contains('Sign in')

      cy.contains('Add your details below to access your tasks!')

      cy.get('[data-cy="kanban-app-logo"]').should('exist')

      cy.get('[data-cy="sign-in-account-button"]').should('exist')

      cy.get('[data-cy="sign-in-with-google-button"]').should('exist')

      cy.contains('Or sign in with Google')

      cy.get('[data-cy="email-address-input-label"]').should('exist')
      cy.get('[data-cy="email-address-input"]').should('exist')
      cy.get('[data-cy="password-input-label"]').should('exist')
      cy.get('[data-cy="password-input"]').should('exist')

      cy.get('a[href="/sign-up"]').should('exist')
    })

    it('should display the create account page and image on a big screen', () => {
      cy.visit('http://localhost:3000/sign-in')
      cy.viewport(1440, 900)

      cy.get('[data-cy="app-preview-image"]').should('exist')

      cy.contains('Sign in')

      cy.contains('Add your details below to access your tasks!')

      cy.get('[data-cy="kanban-app-logo"]').should('exist')

      cy.get('[data-cy="sign-in-account-button"]').should('exist')

      cy.get('[data-cy="sign-in-with-google-button"]').should('exist')

      cy.contains('Or sign in with Google')

      cy.get('[data-cy="email-address-input-label"]').should('exist')
      cy.get('[data-cy="email-address-input"]').should('exist')
      cy.get('[data-cy="password-input-label"]').should('exist')
      cy.get('[data-cy="password-input"]').should('exist')

      cy.get('a[href="/sign-up"]').should('exist')
    })
    describe('given the inputs are not completed', () => {
      it('should display "Can\'t be empty" text two times', () => {
        cy.visit('http://localhost:3000/sign-in')
        cy.get('[data-cy="sign-in-account-button"]').click()

        cy.contains("Can't be empty")
          .get("span:contains(Can't be empty)")
          .should('have.length', 2)
      })
      describe('given I press on sign in with google', () => {
        it('should not show me any errors and redirect me to https://accounts.google.com/', () => {
          cy.visit('http://localhost:3000/sign-in')
          cy.get('[data-cy="sign-in-with-google-button"]').click()

          cy.origin('https://accounts.google.com', () => {
            cy.url().should('contain', 'https://accounts.google.com/')
          })
        })
      })
    })

    describe('given the user clicks on input and then clicks outside', () => {
      it('errors should appear on blur', () => {
        cy.visit('http://localhost:3000/sign-in')

        cy.contains("Can't be empty").should('not.exist')
        cy.contains('Password too short').should('not.exist')
        cy.contains('Invalid email address').should('not.exist')

        cy.get('[data-cy="email-address-input"]').click()
        cy.get('[data-cy="sign-in-form"]').click()
        cy.contains("Can't be empty").should('exist')

        cy.get('[data-cy="password-input"]').click()
        cy.get('[data-cy="email-address-input"]').click()
        cy.contains("Can't be empty")
          .get("span:contains(Can't be empty)")
          .should('have.length', 2)
      })
    })

    describe('given the email is not valid', () => {
      it('should display "Invalid email address" text', () => {
        cy.visit('http://localhost:3000/sign-in')
        cy.get('[data-cy="email-address-input"]').type('this is invalid')

        cy.get('[data-cy="sign-in-account-button"]').click()

        cy.contains('Invalid email address').should('exist')
      })
    })

    describe('given the input is structurally correct', () => {
      describe('given the credentials do not belong to any user', () => {
        it('should display Please check again for email and password inputs', () => {
          cy.intercept('POST', '/api/sign-in', {
            statusCode: 401,
          }).as('signInUser')

          cy.visit('http://localhost:3000/sign-in')

          cy.get('[data-cy="email-address-input"]').type(
            'mihai.maxim@thinslices.com',
          )
          cy.get('[data-cy="password-input"]').type('password1234')

          cy.get('[data-cy="sign-in-account-button"]').click()

          cy.wait('@signInUser')

          cy.contains('Please check again')
            .get('span:contains(Please check again)')
            .should('have.length', 2)
        })
        describe('given the email belongs to a user but the password was not set', () => {
          it('should show Account was configured to sign in with Google', () => {
            cy.intercept('POST', '/api/sign-in', {
              statusCode: 422,
            }).as('signInUser')

            cy.visit('http://localhost:3000/sign-in')

            cy.get('[data-cy="email-address-input"]').type(
              'mihai.maxim@thinslices.com',
            )
            cy.get('[data-cy="password-input"]').type('password1234')

            cy.get('[data-cy="sign-in-account-button"]').click()

            cy.wait('@signInUser')

            cy.contains('Account was configured to sign in with Google')
              .get(
                'span:contains(Account was configured to sign in with Google)',
              )
              .should('have.length', 1)
          })
        })
      })
    })
  })
})
