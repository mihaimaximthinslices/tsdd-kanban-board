import { Subtask, SubtaskStatus } from '../../backend/src/domain/entities'
import { useRef, useState } from 'react'

export default function CheckboxSubtask({
  subtask: { id, description, status },
  handleStatusChange,
}: {
  subtask: Subtask
  handleStatusChange: (
    subtaskId: string,
    description: string,
    status: SubtaskStatus,
  ) => void
}) {
  const checkboxRef = useRef<HTMLInputElement | null>(null)
  const [isChecked, setIsChecked] = useState(status === SubtaskStatus.completed)

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        checkboxRef.current!.checked = !checkboxRef.current!.checked
        setIsChecked(checkboxRef.current!.checked!)
        handleStatusChange(
          id,
          description,
          checkboxRef.current!.checked!
            ? SubtaskStatus.completed
            : SubtaskStatus.in_progress,
        )
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
