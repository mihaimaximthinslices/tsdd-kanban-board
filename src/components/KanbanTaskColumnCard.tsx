import { Draggable, Droppable } from 'react-beautiful-dnd'
import { KanbanTaskCard } from './KanbanTaskCard.tsx'
import { KanbanTask, KanbanTaskColumn } from './KanbanBoard.tsx'
export default function KanbanTaskColumnCard({
  column,
  columnId,
}: {
  columnId: string
  column: KanbanTaskColumn
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      key={columnId}
    >
      <h2>{column.name}</h2>
      <div style={{ margin: 8 }}>
        <Droppable droppableId={columnId} key={columnId}>
          {(provided, snapshot) => {
            return (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver
                    ? 'lightblue'
                    : 'lightgrey',
                  padding: 4,
                  width: 250,
                  minHeight: 500,
                }}
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
