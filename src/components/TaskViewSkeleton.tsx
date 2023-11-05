import 'react-loading-skeleton/dist/skeleton.css'

export function TaskViewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <div className="w-full">
          <div role="status" className="w-full animate-pulse">
            <div className=" bg-gray-200 rounded-md dark:bg-black1 w-full h-12"></div>
          </div>
        </div>
      </div>

      <div>
        <div className="font-plusJSans text-bodyL text-white4">
          <div className="w-full">
            <div
              role="status"
              className="w-full animate-pulse flex flex-col gap-2"
            >
              <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-4"></div>
              <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-4"></div>
              <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-4"></div>
              <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-4"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="font-plusJSans text-bodyM text-white4 dark:text-white">
          <div
            role="status"
            className="w-full animate-pulse flex flex-col gap-2"
          >
            <div className=" bg-gray-200 rounded-full dark:bg-black1 h-5 w-20"></div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-full">
            <div
              role="status"
              className="w-full animate-pulse flex flex-col gap-2"
            >
              <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-8"></div>
              <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-8"></div>
              <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-8"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="font-plusJSans text-white4 dark:text-white text-bodyM">
          <div
            role="status"
            className="w-full animate-pulse flex flex-col gap-2"
          >
            <div className=" bg-gray-200 rounded-full dark:bg-black1 h-5 w-28"></div>
          </div>
        </span>
        <div role="status" className="w-full animate-pulse flex flex-col gap-2">
          <div className=" bg-gray-200 rounded-md dark:bg-black1 w-full h-8"></div>
        </div>
      </div>
      <div></div>
    </div>
  )
}
