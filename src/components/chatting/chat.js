import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'
import './chat.css'

function Chat({user}) {

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [userName, setUserName] = useState('default')

  const userLoginTime = new Date(user.metadata.lastSignInTime); // 실제 로그인 시간
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

  useEffect(() => {
  // messages-container와 message-divider DOM 찾기
  const container = document.querySelector('.messages-container');
  const divider = document.querySelector('.message-divider');
  if (container && divider) {
    // divider가 container 내부에 있으면 스크롤 이동
    const dividerOffset = divider.offsetTop - container.offsetTop;
    container.scrollTop = dividerOffset;
  }
}, [messages]);

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
          userId: currentUser.uid,
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

  // 닉네임 변경 함수
  const handleNicknameChange = () => {
    const newNickname = prompt('닉네임을 입력하세요:', userName)

    // 사용자가 취소를 누르거나(null) 빈 문자열을 입력한 경우 변경하지 않음
    if (newNickname !== null && newNickname.trim() !== '') {
      setUserName(newNickname.trim())
    }
  }

  // 메시지 타임스탬프를 Date 객체로 변환하는 함수 추가
const getMessageDate = (message) => {
  if (!message.timestamp) return new Date(0);
  if (message.timestamp.toDate) {
    return message.timestamp.toDate();
  }
  if (typeof message.timestamp === 'object' && message.timestamp.seconds) {
    return new Date(message.timestamp.seconds * 1000);
  }
  return new Date(0);
};

  const { oldMessages, newMessages } = messages.reduce((acc, message) => {
    const messageDate = getMessageDate(message);

    if (messageDate > userLoginTime) {
      acc.newMessages.push(message)
    } else {
      acc.oldMessages.push(message)
    }
    return acc
  }, { oldMessages: [], newMessages: [] });

  const hasOldMessages = oldMessages.length > 0;

  return (
    <div className="chat-container">
      <h1 className='chat-title'>Routinus 루틴 공유방</h1>
      <div className="user-header-card">
        <button className="nickname-button" onClick={handleNicknameChange}>
          닉네임 설정
        </button>
        <div className="userinfo">
          <p className="nickname-section">
            <span>현재 내 닉네임 :</span> <strong>{userName}</strong>
          </p>
        </div>
      </div>
      <p className="login-time-info">
            접속 시간 : {userLoginTime.toLocaleTimeString()}
          </p>

      {/* 메시지 목록 */}
      <div className="messages-container">
        {/* 이전 메세지 */}
        {hasOldMessages && oldMessages.map(message => (
          <div key={message.userId + message.timestamp} className={`message ${message.userId === currentUser.uid ? 'my-message' : 'other-message'}`}>
            <div className="message-info">
              <span className="message-user">{message.user}</span>
              <span className="message-time">{formatTimestamp(message.timestamp)}</span>
            </div>
            <div className="message-bubble">
              <div className="message-text">{message.text}</div>
            </div>
          </div>
        ))}

        {/* 구분선 */}
        <div className="message-divider">
          <span>⬆️과거의 메세지⬆️</span>
        </div>

        {/* 새 메세지 */}
        {newMessages.map(message => (
          <div key={message.userId + message.timestamp} className={`message ${message.userId === currentUser.uid ? 'my-message' : 'other-message'}`}>
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
