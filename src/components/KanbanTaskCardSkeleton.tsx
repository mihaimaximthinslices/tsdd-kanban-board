import { clsx } from 'clsx'

export function KanbanTaskCardSkeleton() {
  return (
    <div
      className={clsx(
        'p-4 min-h-[88px] bg-white black:bg-black2 rounded-md shadow-sm flex flex-col justify-start pt-6 mb-5 dark:bg-black2 dark:text-white',
      )}
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="w-full">
          <div
            role="status"
            className="w-full animate-pulse flex flex-col gap-2"
          >
            <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-4"></div>
          </div>
        </div>
        <span className="font-plusJSans text-bodyM text-white4">
          <div className="w-full">
            <div
              role="status"
              className="w-full animate-pulse flex flex-col gap-2"
            >
              <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-4"></div>
            </div>
          </div>
        </span>
      </div>
    </div>
  )
}
