// RoutineList.jsx
import React from 'react'
import RoutineItem from '../RoutineItem/RoutineItem'

export default function RoutineList({ routines, onRemove, onToggleDone }) {
  return (
    <div>
      {routines.map(r => (
        <RoutineItem
          key={r.id}
          routine={r}
          onRemove={() => onRemove(r.id)}
          onToggle={() => onToggleDone(r.id)}
        />
      ))}
    </div>
  )
}