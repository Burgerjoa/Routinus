// App.jsx 수정
import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './components/firebase/firebase'
import { useFirestore } from './hooks/useFirestore' // firebase 연동
import Header          from './components/common/Header/Header'
import RoutineList     from './components/routine/RoutineList/RoutineList'
import AddRoutineModal from './components/routine/AddroutineModal/AddRoutineModal'
import BottomNav       from './components/common/BottomNav/BottomNav'
import styles          from './App.module.css'
import ChatList        from './components/chatting/chat'
import Login           from './components/login/login'

export default function App() {
  const [currentTab, setCurrentTab] = useState('routine')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [routines, setRoutines] = useState([])
  const [modalOpen, setModalOpen] = useState(false)

  // Firebase 사용
  const { addRoutine, subscribeToRoutines, updateRoutine, deleteRoutine } = useFirestore()

  // 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Firebase에서 사용자 루틴 실시간 구독
  useEffect(() => {
    if (!user) {
      setRoutines([])
      return
    }

    const unsubscribe = subscribeToRoutines((allRoutines) => {
      // 사용자의 모든 루틴 (생성한 것 + 참여한 것)
      const userRoutines = allRoutines.filter(routine => 
        routine.userId === user.uid
      )
      setRoutines(userRoutines)
    })

    return unsubscribe
  }, [user, subscribeToRoutines])

  // 루틴 추가 - Firebase 연동
  const handleAdd = async (formValues) => {
    if (!user) return
    
    try {
      await addRoutine({
        ...formValues,
        userId: user.uid,
        userEmail: user.email
      })

    } catch (error) {
      console.error('루틴 추가 실패:', error)
      alert('루틴 추가에 실패했습니다.')
    }
  }

  // 루틴 제거 - Firebase 연동
  const handleRemove = async (id) => {
    try {
      await deleteRoutine(id)

    } catch (error) {
      console.error('루틴 삭제 실패:', error)
      alert('루틴 삭제에 실패했습니다.')
    }
  }

  // 루틴 완료/미완료 토글 - Firebase 연동
  const handleToggleDone = async (id) => {
    const routine = routines.find(r => r.id === id)
    if (!routine) return

    try {
      await updateRoutine(id, { done: !routine.done })

    } catch (error) {
      console.error('루틴 상태 업데이트 실패:', error)
      alert('루틴 상태 업데이트에 실패했습니다.')
    }
  }

  // 완료/미완료 카운트
  const doneCount = routines.filter(r => r.done).length
  const pendingCount = routines.length - doneCount

  // 인증 로딩 중일 때
  if (authLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  // 로그인되지 않은 경우 로그인 페이지 표시
  if (!user) {
    return <Login />
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
              onSave={async (formValues) => {
                await handleAdd(formValues)
                setModalOpen(false)
              }}
            />
          )}
        </>
      )}

      {/* ===== 채팅 탭 ===== */}
      {currentTab === 'chat' && (
        <div style={{ padding: 16 }}>
          <ChatList user={user} />
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