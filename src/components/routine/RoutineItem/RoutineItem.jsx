// RoutineItem.jsx
import React from 'react'
import styles from './RoutineItem.module.css'

export default function RoutineItem({ routine, onRemove, onToggle }) {
  const { title, time, streak, done } = routine

  return (
    <div className={styles.item}>
        <button
          className={`${styles.dot} ${done ? styles.dotActive : ''}`}
          onClick={onToggle}
        />
        <div className={styles.line} />
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.meta}>{time} • {streak}일 연속</div>
      </div>
      {/* 삭제 버튼 */}
      <button className={styles.deleteBtn} onClick={onRemove}>
        🗑️
      </button>
    </div>
  )
}