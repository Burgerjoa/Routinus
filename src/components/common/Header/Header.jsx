import React from 'react'
import styles from './Header.module.css'

export default function Header({ date, doneCount, pendingCount, onAddClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.date}>{date}</div>
      <div className={styles.counts}>
        <button onClick={onAddClick}>루틴 추가</button>
        <button className={styles.done}>완료 {doneCount}</button>
        <button className={styles.pending}>미완료 {pendingCount}</button>
      </div>
    </header>
  )
}