import { useContext, useState } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { PortalModal } from '../modal/PortalModal.tsx'
import { clsx } from 'clsx'
import IconCross from '../svg/icon-cross.tsx'
import * as yup from 'yup'
import { ValidationError } from 'yup'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { AxiosError } from 'axios'
import { useBoards } from '../hooks/useBoards.tsx'

export type BoardStateType = {
  name: string
  columns: string[]
  columnIds: string[]
}

export type BoardStateTypeErrors = {
  name?: string
  columnErrors: Record<string, { error: string }>
}

const SubmitNewBoardValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .min(1, 'Name should contain at least 1 character')
    .max(25, 'Name should contain at most 25 characters'),
  columns: yup
    .array()
    .of(
      yup
        .string()
        .matches(
          /^[a-zA-Z\s]+$/,
          'Column name can only contain letters and spaces',
        )
        .min(1, 'Column name should contain at least 1 character')
        .max(25, 'Column name should contain at most 25 characters'),
    )
    .test('unique', 'Column names must be unique', function (value) {
      if (!value || value.length === 0) return true // No need to validate if the array is empty.

      const uniqueSet = new Set(value)
      return uniqueSet.size === value.length
    }),
})

function LoadingSpinner() {
  return (
    <div className="text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm  text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
      <svg
        aria-hidden="true"
        role="status"
        className="inline w-4 h-4 mr-3 text-white animate-spin"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="#E5E7EB"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentColor"
        />
      </svg>
      Loading...
    </div>
  )
}

export function AddNewBoardModal() {
  const { refetch } = useBoards()

  const [requestState, setRequestState] = useState({
    loading: false,
    error: false,
  })
  const { setDashboardState } = useContext(DashboardContext)

  const examplePlaceholders = [
    'eg. Todo',
    'eg. Doing',
    'eg. Done',
    'eg. Testing',
  ]
  const [boardState, setBoardState] = useState<BoardStateType>({
    name: '',
    columns: ['Todo', 'Doing'],
    columnIds: [uuidv4(), uuidv4()],
  })

  const [boardErrors, setBoardErrors] = useState<BoardStateTypeErrors>({
    columnErrors: {},
  })

  function changeColumnName(index: number, name: string) {
    setBoardState((old) => ({
      ...old,
      columns: old.columns.map((_, i) => (i === index ? name : _)),
    }))
  }

  function changeBoardName(name: string) {
    setBoardState((old) => ({
      ...old,
      name,
    }))
  }

  function deleteBoardColumn(index: number) {
    setBoardState((old) => {
      return {
        ...old,
        columns: [
          ...old.columns.filter((_val: string, i: number) => {
            return i !== index
          }),
        ],
        columnIds: old.columnIds.filter((_val: string, i: number) => {
          return i !== index
        }),
      }
    })
    setBoardErrors({
      columnErrors: {},
    })
  }

  function addNewColumn() {
    setBoardState((old) => ({
      ...old,
      columns: [...old.columns, ''],
      columnIds: [...old.columnIds, uuidv4()],
    }))
    setBoardErrors({
      columnErrors: {},
    })
  }

  function findDuplicateIndices(arr: string[]) {
    const occurances: Record<string, number[]> = {}

    for (let i = 0; i < arr.length; i++) {
      occurances[arr[i]] = [...(occurances[arr[i]] || []), i]
    }

    return Object.values(occurances)
      .filter((l) => l.length > 1)
      .reduce((a, c) => [...a, ...c], [])
      .map((n) => n.toString())
  }

  async function verifyBoard(callback?: (boardState: BoardStateType) => void) {
    const errors: Record<string, string> = {}
    await SubmitNewBoardValidationSchema.validate(boardState, {
      abortEarly: false,
    }).catch((err) => {
      err.inner.forEach((error: ValidationError) => {
        errors[error.path!] = error.message
      })
    })

    let newBoardErrors: BoardStateTypeErrors = {
      columnErrors: {},
    }

    if (errors.name) {
      newBoardErrors.name = errors.name
    }

    const affectedIndexes = []

    for (let i = 0; i < boardState.columns.length; i++) {
      if (errors[`columns["${i}"]`] || errors[`columns[${i}]`]) {
        affectedIndexes.push(i)
      }
    }

    if (affectedIndexes.length) {
      affectedIndexes.forEach((index) => {
        newBoardErrors.columnErrors[index] = {
          error: errors[`columns["${index}"]`] || errors[`columns[${index}]`],
        }
      })
      setBoardErrors(newBoardErrors)
      return
    }

    if (errors.columns) {
      const affectedIndexes = findDuplicateIndices(boardState.columns)

      affectedIndexes.forEach((index) => {
        newBoardErrors.columnErrors[index] = { error: errors.columns }
      })

      setBoardErrors(newBoardErrors)
      return
    }

    setBoardErrors(newBoardErrors)

    newBoardErrors = newBoardErrors as BoardStateTypeErrors
    if (
      !newBoardErrors.name &&
      Object.keys(newBoardErrors.columnErrors).length === 0
    ) {
      if (callback) {
        callback(boardState)
      }
    }
  }

  function createNewBoard() {
    verifyBoard(async (data) => {
      try {
        setRequestState((prev) => ({ ...prev, loading: true }))
        const response = await axios.post('/api/boards', data)
        refetch().then(() => {
          setDashboardState!((old) => ({
            ...old,
            showAddNewBoardModal: false,
            selectedBoard: response.data.boardId,
          }))
          setRequestState((prev) => ({ ...prev, loading: false }))
        })
      } catch (err) {
        const error = err as AxiosError
        if (error.response!.status === 409) {
          setBoardErrors((old) => ({
            ...old,
            name: 'You already created a board with this name',
          }))
          setRequestState({ loading: false, error: false })
        } else {
          setRequestState({ loading: false, error: true })
        }
      }
    })
  }

  return (
    <PortalModal
      onClose={() => {
        setDashboardState!((old) => ({ ...old, showAddNewBoardModal: false }))
      }}
    >
      <div className="min-w-[343px] md:w-[480px] bg-white dark:bg-black2 rounded-md flex flex-col p-8 gap-6 shadow-md dark:border border-black1">
        <div>
          <h1 className="font-plusJSans text-headingL text-black dark:text-white">
            Add New Board
          </h1>
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="font-plusJSans text-bodyM text-black1 dark:text-white"
            data-cy="board-name-input-label"
            htmlFor="boardName"
          >
            Board Name
          </label>

          <input
            data-cy="board-name-input"
            className={clsx(
              'pl-4 pb-[10px] pt-[10px] border rounded-md text-bodyL dark:bg-black2 dark:text-white dark:border-black1',
            )}
            onChange={(e) => {
              changeBoardName(e.target.value)
            }}
            onFocus={() => {
              setBoardErrors((old) => ({
                ...old,
                name: undefined,
              }))
            }}
            type="text"
            id="boardName"
            placeholder="eg. Web Design"
          />
          {boardErrors.name && (
            <div className="font-plusJSans text-headingS text-red2">
              <span>{boardErrors.name}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {boardState.columns.length > 0 && (
            <label
              className="font-plusJSans text-bodyM text-black1 dark:text-white"
              data-cy="board-columns-input-label"
            >
              Board Columns
            </label>
          )}
          <div className="flex flex-col gap-[12px]">
            {boardState.columns.map((name, index) => {
              return (
                <div
                  key={boardState.columnIds[index]}
                  className="flex flex-col"
                >
                  <div className="flex w-full items-center gap-4">
                    <input
                      onFocus={() => {
                        if (boardErrors.columnErrors[index]) {
                          setBoardErrors((old) => {
                            const newErrors = { ...old }
                            delete newErrors.columnErrors[index]
                            return newErrors
                          })
                        }
                      }}
                      data-cy="column-name-input"
                      className={clsx(
                        'pl-4 pb-[10px] pt-[10px] border rounded-md text-bodyL dark:bg-black2 dark:text-white dark:border-black1 grow',
                      )}
                      type="text"
                      id="boardName"
                      defaultValue={name}
                      placeholder={
                        examplePlaceholders[index % examplePlaceholders.length]
                      }
                      onChange={(e) => {
                        changeColumnName(index, e.target.value)
                      }}
                    />
                    <button
                      data-cy="remove-column-button"
                      onClick={() => {
                        deleteBoardColumn(index)
                      }}
                    >
                      <IconCross />
                    </button>
                  </div>
                  {boardErrors.columnErrors[index] && (
                    <div className="font-plusJSans text-headingS text-red2">
                      <span>{boardErrors.columnErrors[index]?.error}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-1">
            <button
              data-cy="create-new-column-button"
              onClick={() => {
                addNewColumn()
              }}
              className="font-plusJSans text-bodyL text-blue2 w-full pt-2 pb-2 rounded-2xl bg-white2 dark:bg-white"
            >
              + Add New Column
            </button>
          </div>
        </div>
        <div onClick={createNewBoard} className="w-full">
          <button
            disabled={requestState.loading || requestState.error}
            data-cy="create-new-board-button"
            className="font-plusJSans text-bodyL text-white w-full pt-2 pb-2 rounded-2xl bg-blue2 hover:bg-blue1 disabled:cursor-not-allowed"
          >
            {requestState.loading ? (
              <LoadingSpinner />
            ) : (
              <span>Create New Board</span>
            )}
          </button>
        </div>
      </div>
    </PortalModal>
  )
}
