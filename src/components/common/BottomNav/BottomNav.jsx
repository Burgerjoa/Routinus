import React from 'react'
import styles from './BottomNav.module.css'

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className={styles.nav}>
      <button
        className={activeTab === 'routine' ? styles.active : ''}
        onClick={() => onTabChange('routine')}
      >
        내 루틴
      </button>
      <button
        className={activeTab === 'chat' ? styles.active : ''}
        onClick={() => onTabChange('chat')}
      >
        채팅방
      </button>
    </nav>
  )
}