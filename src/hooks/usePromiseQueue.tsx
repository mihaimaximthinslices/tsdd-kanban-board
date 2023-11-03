import { useState } from 'react'

export default function usePromiseQueue() {
  const [promiseQueue, setPromiseQueue] = useState<Promise<void | boolean>>(
    Promise.resolve(true),
  )

  const [promiseCounter, setPromiseCounter] = useState(0)

  const addPromise = (operation: () => Promise<void>) => {
    setPromiseCounter((old) => old + 1)
    return new Promise<void>((resolve, reject) => {
      setPromiseQueue((prev) => {
        return prev
          .then(operation)
          .then(() => {
            setPromiseCounter((old) => old - 1)
            resolve()
          })
          .catch(() => {
            setPromiseQueue(Promise.resolve(true))
            setPromiseCounter(0)
            reject()
          })
      })
    })
  }

  return {
    promiseQueue,
    promiseCounter,
    addPromise,
  }
}
