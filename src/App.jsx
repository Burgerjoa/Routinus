// src/App.jsx
import React, { useState, useEffect } from 'react' // useEffect 추가
import Header          from './components/common/Header/Header'
import RoutineList     from './components/routine/RoutineList/RoutineList'
import AddRoutineModal from './components/routine/AddroutineModal/AddRoutineModal'
import BottomNav       from './components/common/BottomNav/BottomNav'
import styles          from './App.css'
import ChatList        from './components/chatting/chat' // 채팅 컴포넌트 임포트

const STORAGE_KEY = 'routinus-routines' // 로컬스토리지 키 상수

export default function App() {
  const [currentTab, setCurrentTab] = useState('routine')

  // 초기값 로드
  const [routines, setRoutines] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : [
        { id: 1, title: '기상', time: '9:00 오전', streak: 314, done: false },
        { id: 2, title: '운동', time: '5:00 오후', streak: 314, done: true  },
      ]
    } catch (error) {
      console.error('로컬스토리지 데이터 로드 실패:', error)
      return [
        { id: 1, title: '기상', time: '9:00 오전', streak: 314, done: false },
        { id: 2, title: '운동', time: '5:00 오후', streak: 314, done: true  },
      ]
    }
  })

  const [modalOpen, setModalOpen] = useState(false)

  // 로컬스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routines))
    } catch (error) {
      console.error('로컬스토리지 저장 실패:', error)
    }
  }, [routines]) // routines가 변경될 때마다 실행

  // 루틴 추가
  const handleAdd = formValues => {
    setRoutines(prev => [
      ...prev,
      { id: Date.now(), streak: 0, done: false, ...formValues }
    ])
  }

  // 루틴 제거
  const handleRemove = id => {
    setRoutines(prev => prev.filter(r => r.id !== id))
  }

  // 완료/미완료 카운트
  const doneCount    = routines.filter(r => r.done).length
  const pendingCount = routines.length - doneCount

  return (
    <div className={styles.appContainer}>
      {/* ===== 루틴 탭 ===== */}
      {currentTab === 'routine' && (
        <>
          <Header
            date={new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month:   '2-digit',
              day:     '2-digit',
              weekday: 'short'
            })}
            doneCount={doneCount}
            pendingCount={pendingCount}
            onAddClick={() => setModalOpen(true)}
          />

          <RoutineList
            routines={routines}
            onRemove={handleRemove}
            onToggleDone={id =>
              setRoutines(prev =>
                prev.map(r => (r.id === id ? { ...r, done: !r.done } : r))
              )
            }
          />

          {modalOpen && (
            <AddRoutineModal
              onClose={() => setModalOpen(false)}
              onSave={formValues => {
                handleAdd(formValues)
                setModalOpen(false)
              }}
            />
          )}
        </>
      )}

      {/* ===== 채팅 탭 ===== */}
      {currentTab === 'chat' && (
        <div style={{ padding: 16 }}>
          <ChatList />
        </div>
      )}

      {/* ===== 하단 내비게이션 ===== */}
      <BottomNav
        activeTab={currentTab}
        onTabChange={tab => setCurrentTab(tab)}
      />
    </div>
  )
}