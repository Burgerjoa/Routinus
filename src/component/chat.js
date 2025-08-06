import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import './chat.css'

function Chat() {

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [userName, setUserName] = useState('')

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

  // Firebase에서 메시지 실시간 구독
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'))
    
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
          timestamp: serverTimestamp()
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
      <h1>Firebase 채팅 데모</h1>
      
      {/* 사용자 이름 입력 */}
      <div className="user-input">
        <input
          type="text"
          placeholder="사용자 이름 입력"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="user-name-input"
        />
      </div>

      {/* 메시지 목록 */}
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className="message">
            <span className="message-user">{message.user}:</span>
            <span className="message-text">{message.text}</span>
            <span className="message-time">{formatTimestamp(message.timestamp)}</span>
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
