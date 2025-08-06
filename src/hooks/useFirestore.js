// src/hooks/useFirestore.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase'

export const useFirestore = () => {
  // 루틴 추가
  const addRoutine = async (routine) => {
    try {
      const docRef = await addDoc(collection(db, 'routines'), {
        ...routine,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { id: docRef.id, ...routine }
    } catch (error) {
      console.error('루틴 추가 실패:', error)
      throw error
    }
  }

  // 루틴 목록 가져오기 (일회성)
  const getRoutines = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'routines'))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('루틴 불러오기 실패:', error)
      return []
    }
  }

  // 루틴 수정
  const updateRoutine = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'routines', id), {
        ...updates,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('루틴 수정 실패:', error)
      throw error
    }
  }

  // 루틴 삭제
  const deleteRoutine = async (id) => {
    try {
      await deleteDoc(doc(db, 'routines', id))
    } catch (error) {
      console.error('루틴 삭제 실패:', error)
      throw error
    }
  }

  // 실시간 루틴 목록 구독
  const subscribeToRoutines = (callback) => {
    return onSnapshot(collection(db, 'routines'), (snapshot) => {
      const routines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(routines)
    })
  }

  return {
    addRoutine,
    getRoutines,
    updateRoutine,
    deleteRoutine,
    subscribeToRoutines
  }
}