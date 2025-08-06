import { signOut } from 'firebase/auth'
import { auth } from '../chatting/firebase'

const handleLogout = async () => {
  try {
    await signOut(auth)
    console.log('로그아웃 성공')
  } catch (error) {
    console.error('로그아웃 오류:', error.message)
    alert('로그아웃 실패: ' + error.message)
  }
}