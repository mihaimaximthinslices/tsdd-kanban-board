export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'InvalidInputError'
    this.message = message
  }
}

export class UnauthorizedError extends Error {
  constructor(entity: string, action?: string) {
    super()

    this.name = `UnauthorizedError`
    this.message = `${entity} is not authorized${action ? ' to ' + action : ''}`
  }
}

export class DuplicateEntityError extends Error {
  constructor(entity: string) {
    super()
    this.name = 'DuplicateEntityError'
    this.message = `${entity} already exists`
  }
}

export class EntityNotFoundError extends Error {
  constructor(entity: string, id?: string) {
    super()

    this.name = `EntityNotFound`
    this.message = `${entity} ${id ? 'with id ' + id : ''} was not found`
  }
}
