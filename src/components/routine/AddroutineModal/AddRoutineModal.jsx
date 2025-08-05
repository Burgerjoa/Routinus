import React, { useState } from 'react'
import styles from './AddRoutineModal.module.css'

export default function AddRoutineModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [time, setTime]   = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !time) return
    onSave({ title, time })
  }

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <h2>루틴 추가</h2>
        <label>
          제목
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="루틴 이름"
          />
        </label>
        <label>
          시간
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </label>
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>취소</button>
          <button type="submit">저장</button>
        </div>
      </form>
    </div>
  )
}