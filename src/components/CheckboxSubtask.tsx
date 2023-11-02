import { Subtask, SubtaskStatus } from '../../backend/src/domain/entities'
import { useRef, useState } from 'react'

export default function CheckboxSubtask({
  subtask: { id, description, status },
}: {
  subtask: Subtask
}) {
  const checkboxRef = useRef<HTMLInputElement | null>(null)
  const [isChecked, setIsChecked] = useState(status === SubtaskStatus.completed)

  return (
    <div
      onClick={() => {
        checkboxRef.current!.click()
        setIsChecked(checkboxRef.current!.checked!)
      }}
      className="p-4 bg-white2 dark:bg-black3 flex gap-4 items-center cursor-pointer"
      key={id}
    >
      <input
        ref={checkboxRef}
        defaultChecked={isChecked}
        type="checkbox"
        value=""
        className="!outline-none !border-none !border-0 !outline-0 w-4 h-4 bg-blue2 text-red2 accent-blue2 pointer-events-none"
      ></input>
      <p className="font-plusJSans text-bodyM text-black dark:text-white font-bold">
        {description}
      </p>
    </div>
  )
}
