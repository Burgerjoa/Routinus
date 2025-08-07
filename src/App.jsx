import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore'
import { auth, db } from './components/firebase/firebase'
import Header from './components/common/Header/Header'
import RoutineList from './components/routine/RoutineList/RoutineList'
import AddRoutineModal from './components/routine/AddroutineModal/AddRoutineModal'
import BottomNav from './components/common/BottomNav/BottomNav'
import styles from './App.module.css'
import ChatList from './components/chatting/chat'
import Login from './components/login/login'

export default function App() {
  const [currentTab, setCurrentTab] = useState('routine')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [routines, setRoutines] = useState([]) // 초기값을 빈 배열로 변경

  // useEffect 1: 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // useEffect 2: 사용자별 루틴 실시간 구독
  useEffect(() => {
    if (!user) {
      setRoutines([]) // 로그아웃 시 루틴 초기화
      return
    }

    // 현재 사용자의 루틴만 실시간으로 가져오기
    const q = query(
      collection(db, 'routines'),
      where('userId', '==', user.uid) // 사용자 ID로 필터링
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userRoutines = []
      snapshot.forEach(doc => {
        userRoutines.push({
          id: doc.id,
          ...doc.data()
        })
      })
      setRoutines(userRoutines)
      console.log(`${user.email}의 루틴 ${userRoutines.length}개 로드됨`)
    })

    return () => unsubscribe()
  }, [user]) // user가 변경될 때마다 실행

  // 루틴 추가 함수 (사용자 ID 포함)
  const handleAdd = async (formValues) => {
    if (!user) {
      alert('로그인이 필요합니다')
      return
    }

    try {
      // 1. Firestore에 저장 (사용자 ID 포함)
      const docRef = await addDoc(collection(db, 'routines'), {
        title: formValues.title,
        time: formValues.time,
        streak: 0,
        done: false,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date()
      })

      console.log(`${user.email}의 루틴 저장 완료:`, docRef.id)
      // 실시간 구독으로 자동 업데이트되므로 setRoutines 불필요

    } catch (error) {
      console.error('Firestore 저장 실패:', error)
      alert('루틴 저장에 실패했습니다')
    }
  }

  // 루틴 제거 함수
  const handleRemove = async (id) => {
    try {
      await deleteDoc(doc(db, 'routines', id))
      console.log('루틴 삭제 완료:', id)
    } catch (error) {
      console.error('루틴 삭제 실패:', error)
      alert('루틴 삭제에 실패했습니다')
    }
  }

  // 루틴 토글 함수
  const handleToggle = async (id) => {
    try {
      const routine = routines.find(r => r.id === id)
      if (routine) {
        await updateDoc(doc(db, 'routines', id), {
          done: !routine.done,
          updatedAt: new Date()
        })
        console.log('루틴 상태 변경 완료:', id)
      }
    } catch (error) {
      console.error('루틴 상태 변경 실패:', error)
      alert('루틴 상태 변경에 실패했습니다')
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
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            <RoutineList
              routines={routines}
              onRemove={handleRemove}
              onToggleDone={handleToggle}
            />
          </div>
          {modalOpen && (
            <AddRoutineModal
              onClose={() => setModalOpen(false)}
              onSave={(formValues) => {
                handleAdd(formValues);
                setModalOpen(false);
              }}
            />
          )}
        </>
      )}

      {/* ===== 채팅 탭 ===== */}
      {currentTab === 'chat' && (
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: 16 }}>
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