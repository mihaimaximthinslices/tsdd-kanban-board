import { Draggable, Droppable } from 'react-beautiful-dnd'
import { KanbanTaskCard } from './KanbanTaskCard.tsx'
import { KanbanTask, KanbanTaskColumn } from './KanbanBoard.tsx'
import useWindowDimensions from '../hooks/useWindowDimensions.tsx'
import { clsx } from 'clsx'
export default function KanbanTaskColumnCard({
  column,
  columnId,
}: {
  columnId: string
  column: KanbanTaskColumn
}) {
  const { height } = useWindowDimensions()
  return (
    <div
      style={{
        minHeight: height! - 120,
      }}
      className="flex flex-col items-center gap-4"
      key={columnId}
    >
      <div className="flex justify-between w-full">
        <h2 className="font-plusJSans text-white4 tracking-headingS text-headingS w-full text-left cursor-default">
          {`${column.name} (${3})`}
        </h2>
      </div>
      <div className="w-[280px] grow pb-6">
        <Droppable droppableId={columnId} key={columnId}>
          {(provided, snapshot) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={clsx(
                  'w-full h-full flex flex-col grow',
                  snapshot.isDraggingOver && '',
                )}
              >
                {column.items.map((item: KanbanTask, index: number) => {
                  return (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => {
                        return (
                          <KanbanTaskCard
                            provided={provided}
                            snapshot={snapshot}
                            task={item}
                          ></KanbanTaskCard>
                        )
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </div>
    </div>
  )
}
