// src/App.jsx
import React, { useState, useEffect } from 'react'
import Header          from './components/common/Header/Header'
import RoutineList     from './components/routine/RoutineList/RoutineList'
import AddRoutineModal from './components/routine/AddroutineModal/AddRoutineModal'
import BottomNav       from './components/common/BottomNav/BottomNav'
import styles          from './App.css'
import ChatList        from './components/chatting/chat'
import { useFirestore } from './hooks/useFirestore' // 추가

const TAB_STORAGE_KEY = 'routinus-current-tab'

export default function App() {
  const { addRoutine, updateRoutine, deleteRoutine, subscribeToRoutines } = useFirestore()

  // 저장된 탭 불러오기
  const [currentTab, setCurrentTab] = useState(() => {
    try {
      const savedTab = localStorage.getItem(TAB_STORAGE_KEY)
      return savedTab || 'routine'
    } catch (error) {
      console.error('탭 정보 로드 실패:', error)
      return 'routine'
    }
  })

  // Firestore에서 루틴 데이터 관리
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true) // 로딩 상태 추가
  const [modalOpen, setModalOpen] = useState(false)

  // 컴포넌트 마운트 시 Firestore 실시간 구독
  useEffect(() => {
    const unsubscribe = subscribeToRoutines((data) => {
      setRoutines(data)
      setLoading(false) // 첫 데이터 로드 완료
    })

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe()
  }, [])

  // currentTab 변경 시 로컬스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem(TAB_STORAGE_KEY, currentTab)
    } catch (error) {
      console.error('탭 정보 저장 실패:', error)
    }
  }, [currentTab])

  // 루틴 추가
  const handleAdd = async (formValues) => {
    try {
      await addRoutine({
        title: formValues.title,
        time: formValues.time,
        streak: 0,
        done: false
      })
      // 실시간 구독으로 자동 업데이트되므로 setRoutines 불필요
    } catch (error) {
      alert('루틴 추가에 실패했습니다.')
    }
  }

  // 루틴 삭제
  const handleRemove = async (id) => {
    try {
      await deleteRoutine(id)
      // 실시간 구독으로 자동 업데이트되므로 setRoutines 불필요
    } catch (error) {
      alert('루틴 삭제에 실패했습니다.')
    }
  }

  // 루틴 완료 상태 토글
  const handleToggleDone = async (id) => {
    try {
      const routine = routines.find(r => r.id === id)
      if (routine) {
        await updateRoutine(id, { done: !routine.done })
        // 실시간 구독으로 자동 업데이트되므로 setRoutines 불필요
      }
    } catch (error) {
      alert('루틴 상태 변경에 실패했습니다.')
    }
  }

  const doneCount    = routines.filter(r => r.done).length
  const pendingCount = routines.length - doneCount

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className={styles.appContainer}>
        <div style={{ padding: 16, textAlign: 'center' }}>
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.appContainer}>
      {/* ===== 루틴 탭 ===== */}
      {currentTab === 'routine' && (
        <>
          <Header
            date={new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              weekday: 'short'
            })}
            doneCount={doneCount}
            pendingCount={pendingCount}
            onAddClick={() => setModalOpen(true)}
          />

          <RoutineList
            routines={routines}
            onRemove={handleRemove}
            onToggleDone={handleToggleDone}
          />

          {modalOpen && (
            <AddRoutineModal
              onClose={() => setModalOpen(false)}
              onSave={(formValues) => {
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