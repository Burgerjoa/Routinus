import React from 'react'
import styles from './Header.module.css'

export default function Header({ date, doneCount, pendingCount, onAddClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
      <div className={styles.date}>{date}</div>
      <div className={styles.counts}>
        <button className={styles.done}>{doneCount}<br/> 완료</button>
        <button className={styles.pending}>{pendingCount}<br/> 미완료</button>
      </div>
      </div>
      <button className={styles.addButton} onClick={onAddClick}>+</button>
    </header>
  )
}