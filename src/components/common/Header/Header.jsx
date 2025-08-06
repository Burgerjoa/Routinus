import React from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../chatting/firebase' // 경로는 실제 firebase.js 위치에 맞게 수정
import styles from './Header.module.css'

export default function Header({ date, doneCount, pendingCount, onAddClick }) {
  // 로그아웃 함수
  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      try {
        await signOut(auth)
        console.log('로그아웃 성공')
      } catch (error) {
        console.error('로그아웃 오류:', error.message)
        alert('로그아웃 실패: ' + error.message)
      }
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.date}>{date}</div>
        <div className={styles.counts}>
          <button className={styles.done}>{doneCount}<br/> 완료</button>
          <button className={styles.pending}>{pendingCount}<br/> 미완료</button>
          <button className={styles.logout} onClick={handleLogout}>로그아웃</button>
        </div>
      </div>
      <button className={styles.addButton} onClick={onAddClick}>+</button>
    </header>
  )
}