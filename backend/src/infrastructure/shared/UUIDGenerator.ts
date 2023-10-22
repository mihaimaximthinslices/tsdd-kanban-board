import crypto from 'crypto'

export const uuidGenerator = {
  next: () => crypto.randomUUID(),
}
