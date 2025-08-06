import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db, auth } from './firebase'
import './chat.css'

function Chat({user}) {

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [userName, setUserName] = useState('')

  const userLoginTime = new Date();
  const currentUser = auth.currentUser;

  // timestamp를 문자열로 변환하는 함수
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleTimeString()
    }
    if (typeof timestamp === 'object' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString()
    }
    return String(timestamp)
  }

  useEffect(() => {
    if (user) {
      setUserName(user.email)
    }
  }, [user])

  // Firebase에서 메시지 실시간 구독
  useEffect(() => {
    const q = query(
      collection(db, 'messages'), 
      orderBy('timestamp', 'asc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = []
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() })
      })
      setMessages(messageList)
    })

    return () => unsubscribe()
  }, [])

  // Firebase에 메시지 추가
  const addMessage = async () => {
    if (newMessage.trim() && userName.trim()) {
      try {
        await addDoc(collection(db, 'messages'), {
          text: newMessage,
          user: userName,
          timestamp: serverTimestamp(),
          id: currentUser.uid,
        })
        setNewMessage('')
      } catch (error) {
        console.error('메시지 추가 오류:', error)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addMessage()
    }
  }

  return (
    <div className="chat-container">
      <h1>Routinus 루틴 공유방</h1>
      <button onClick={() => setUserName(prompt('닉네임을 입력하세요:'))}>닉네임 설정</button>
      <div className='userinfo'>
        <p className='nickname-section'>현재 내 닉네임 : {userName}</p>
        <p className='login-time-info'>접속 시간 : {userLoginTime.toLocaleTimeString()}</p>
      </div>

      {/* 메시지 목록 */}
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.id === currentUser.uid ? 'my-message' : 'other-message'}`}>
            <div className="message-info">
              <span className="message-user">{message.user}</span>
              <span className="message-time">{formatTimestamp(message.timestamp)}</span>
            </div>
            <div className="message-bubble">
              <div className="message-text">{message.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 새 메시지 입력 */}
      <div className="message-input-container">
        <input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="message-input"
        />
        <button onClick={addMessage} className="send-button">
          전송
        </button>
      </div>
    </div>
  )
}

export default Chat
