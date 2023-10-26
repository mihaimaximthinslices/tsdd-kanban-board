import { UseCaseConstructor } from '../../types/UseCase'
import { BoardColumnRepository, BoardRepository, UserRepository } from '../../repositorties'
import { DuplicateEntityError, EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { BoardColumn } from '../../entities'

type Params = {
  userRepository: UserRepository
  boardRepository: BoardRepository
  boardColumnRepository: BoardColumnRepository
  uuidGenerator: UuidGenerator
  dateGenerator: DateGenerator
}

type Request = {
  userId: string
  boardId: string
  boardName: string
  columnNames: string[]
  columnIds: string[]
}

export const updateBoardUsecase: UseCaseConstructor<Params, Request, void> = (request) => {
  const { userRepository, boardRepository, boardColumnRepository, uuidGenerator, dateGenerator } = request
  return async (params) => {
    const { userId, boardId, columnIds, boardName, columnNames } = params
    await validateUser(userId)
    const board = await validateBoard(userId, boardId)
    await validateBoardName(userId, boardName, boardId)

    const [columnsUpdateList, columnsCreateList] = await validateColumns(columnIds, columnNames, boardId)

    const NOW = dateGenerator.now()

    await boardRepository.save({
      ...board,
      boardName,
      updatedAt: NOW,
    })

    const columnsMutateListPromises = [...columnsUpdateList!, ...columnsCreateList!].map((mutateColumn) => {
      return new Promise((resolve) => {
        resolve(boardColumnRepository.save(mutateColumn))
      })
    })

    await Promise.all(columnsMutateListPromises)
  }

  async function validateUser(userId: string) {
    const user = await userRepository.getById(userId)

    if (!user) {
      throw new InvalidInputError(userId)
    }
  }
  async function validateBoard(userId: string, boardId: string) {
    const board = await boardRepository.getById(boardId)
    if (!board) {
      throw new EntityNotFoundError(boardId)
    }

    if (board.userId !== userId) {
      throw new UnauthorizedError(userId, boardId)
    }
    return board
  }

  async function validateBoardName(userId: string, boardName: string, boardId: string) {
    const board = await boardRepository.getByUserIdAndBoardName(userId, boardName)

    if (!board) {
      return
    }

    if (board.id !== boardId) {
      throw new DuplicateEntityError(boardName)
    }
  }

  async function validateColumns(columnIds: string[], columnNames: string[], boardId: string) {
    const columns = await boardColumnRepository.getByBoardId(boardId)

    if (columns.length !== columnIds.length) {
      throw new InvalidInputError('columnIds')
    }

    const columnsUpdateList: BoardColumn[] = []

    const usedColumnNames: string[] = []
    const matchingIdsColumns = columns.filter((column) => {
      return columnIds.includes(column.id)
    })

    if (matchingIdsColumns.length !== columnIds.length) {
      throw new InvalidInputError('columnIds')
    }

    const NOW = dateGenerator.now()

    matchingIdsColumns.forEach((column) => {
      columnsUpdateList.push({
        ...column,
        columnName: columnNames[columnIds.indexOf(column.id)]!,
        updatedAt: NOW,
      })

      usedColumnNames.push(columnNames[columnIds.indexOf(column.id)]!)
    })

    const columnsCreateList = columnNames
      .filter((columnName) => {
        return !usedColumnNames.includes(columnName)
      })
      .map((newColumnName): BoardColumn => {
        return {
          id: uuidGenerator.next(),
          boardId,
          columnName: newColumnName,
          createdAt: NOW,
          updatedAt: NOW,
        }
      })

    return [columnsUpdateList, columnsCreateList]
  }
}
