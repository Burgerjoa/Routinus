import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../chatting/firebase'
import styles from './login.module.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  // 로그인
  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      await signInWithEmailAndPassword(auth, email, password)
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('로그인 오류:', error.message)
      alert('로그인 실패: ' + error.message)
    }
  }

  // 회원가입
  const handleSignup = async (e) => {
    e.preventDefault()

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('회원가입 오류:', error.message)
      alert('회원가입 실패: ' + error.message)
    } 
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginWrapper}>
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>Routinus</h1>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignup} className={styles.loginForm}>
          <h2 className={styles.formTitle}>
            {isLogin ? '로그인' : '회원가입'}
          </h2>
          
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
            
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
          >
            {isLogin ? '로그인' : '회원가입'}
          </button>
          
          <div className={styles.toggleSection}>
            <p>
              {isLogin ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
              <span 
                onClick={() => setIsLogin(!isLogin)}
                className={styles.toggleLink}
              >
                {isLogin ? '회원가입' : '로그인'}
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login