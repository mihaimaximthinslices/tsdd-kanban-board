let authCookie = ''
describe('dashboard-empty flow', () => {
  describe('given the user is logged in', () => {
    before('get auth cookie', () => {
      cy.intercept('/api/sign-in').as('signIn')
      cy.visit('http://localhost:3000/sign-in')

      cy.get('[data-cy="email-address-input"]').type(
        'mihai.maxim+dashboard@thinslices.com',
      )
      cy.get('[data-cy="password-input"]').type('password1234')

      cy.get('[data-cy="sign-in-account-button"]').click()

      cy.wait('@signIn')

      console.log(
        cy.getCookie('connect.sid').then((cookie) => {
          authCookie = cookie!.value
        }),
      )
    })

    beforeEach(() => {
      cy.setCookie('connect.sid', authCookie)
    })

    describe('given I am on a small screen', () => {
      it('should display the dashboard with all the required options', () => {
        cy.visit('http://localhost:3000')
        cy.viewport(375, 667)
        cy.get('[data-cy="platform-logo"]').should('be.visible')
        cy.contains('Platform Launch')
        cy.get('[data-cy="platform-launch-dropdown"]').should('be.visible')
        cy.get('[data-cy="add-new-task-button"]').should('be.disabled')
        cy.get('[data-cy="add-new-column-button"]').should('be.visible')
        cy.contains('This board is empty. Create a new column to get started.')
        cy.get('[data-cy="edit-board-button"]').should('be.visible')
        cy.get('[data-cy="sidebar"]').should('not.exist')
        cy.get('[data-cy="show-sidebar-button"]').should('not.exist')

        cy.contains('+ Add New Column')

        cy.get('[data-cy="platform-launch-dropdown"]').click()

        cy.get('[data-cy="modal-background"]').should('be.visible')

        cy.get('[data-cy="sidebar"]').should('be.visible')

        cy.contains('+ Add New Task')

        cy.get('[data-cy="sidebar-all-boards-counter"]').should('be.visible')
        cy.contains('ALL BOARDS (0)')

        cy.get('[data-cy="sidebar-create-new-board-button"]').should(
          'be.visible',
        )

        cy.contains('+ Create New Board')

        cy.get('[data-cy="sidebar-switch-theme-button"]').should('be.visible')

        cy.get('[data-cy="modal-background"]').click('topRight')

        cy.get('[data-cy="sidebar"]').should('not.exist')
      })
    })

    describe('given I am on a normal screen', () => {
      it('should display the dashboard with all the required options', () => {
        cy.visit('http://localhost:3000')
        cy.viewport(768, 1024)
        cy.get('[data-cy="platform-logo-full"]').should('be.visible')
        cy.contains('Platform Launch')
        cy.get('[data-cy="add-new-task-button"]').should('be.disabled')
        cy.get('[data-cy="add-new-column-button"]').should('be.visible')
        cy.contains('This board is empty. Create a new column to get started.')

        cy.get('[data-cy="sidebar"]').should('be.visible')
        cy.get('[data-cy="edit-board-button"]').should('be.visible')
        cy.contains('+ Add New Task')

        cy.get('[data-cy="sidebar-all-boards-counter"]').should('be.visible')
        cy.contains('ALL BOARDS (0)')

        cy.get('[data-cy="sidebar-create-new-board-button"]').should(
          'be.visible',
        )

        cy.contains('+ Create New Board')

        cy.get('[data-cy="sidebar-switch-theme-button"]').should('be.visible')

        cy.get('[data-cy="hide-sidebar-button"]').should('be.visible')

        cy.get('[data-cy="hide-sidebar-button"]').click()

        cy.get('[data-cy="sidebar"]').should('not.exist')

        cy.get('[data-cy="show-sidebar-button"]').should('be.visible')

        cy.get('[data-cy="show-sidebar-button"]').click()

        cy.get('[data-cy="sidebar"]').should('be.visible')
      })
    })
  })
})
