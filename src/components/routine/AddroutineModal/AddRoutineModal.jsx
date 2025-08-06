import React, { useState } from 'react'
import styles from './AddRoutineModal.module.css'

export default function AddRoutineModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!title.trim()) newErrors.title = '루틴 이름을 입력해주세요'
    if (!time) newErrors.time = '시간을 선택해주세요'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSave({ title: title.trim(), time })
  }

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <h2>루틴 추가</h2>

        <label>
          제목
          <input
            value={title}
            onChange={e => {
              setTitle(e.target.value)
              if (errors.title) setErrors(prev => ({...prev, title: ''}))
            }}
            placeholder="루틴 이름"
            className={errors.title ? styles.error : ''}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </label>

        <label>
          시간
          <input
            type="time"
            value={time}
            onChange={e => {
              setTime(e.target.value)
              if (errors.time) setErrors(prev => ({...prev, time: ''}))
            }}
            className={errors.time ? styles.error : ''}
          />
          {errors.time && <span className={styles.errorText}>{errors.time}</span>}
        </label>

        <div className={styles.actions}>
          <button type="button" onClick={onClose}>취소</button>
          <button type="submit">저장</button>
        </div>
      </form>
    </div>
  )
}