import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, where, updateDoc, arrayUnion, doc, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import RoutineShareModal from "./RoutineShare/RoutineShareModal";
import "./chat.css";

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("default");

  // 루틴 공유 기능을 위한 상태 추가
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [currentChatRoom, setCurrentChatRoom] = useState("general");

  // 루틴 별 채팅방 드롭다운을 위한 상태 추가
  const [showDropdown, setShowDropdown] = useState(false);
  const [joinedRoutines, setJoinedRoutines] = useState([]);

  const userLoginTime = new Date();
  const currentUser = auth.currentUser;

  // timestamp를 문자열로 변환하는 함수
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleTimeString();
    }
    if (typeof timestamp === "object" && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString();
    }
    return String(timestamp);
  };

  // props로 받은 user 정보로 userName 설정
  useEffect(() => {
    if (user) {
      setUserName(user.email);
    }
  }, [user]);

  // 참여하고 있는 루틴 목록 가져오기 추가
  useEffect(() => {
    const fetchJoinedRoutines = async () => {
      if (!user) {
        setJoinedRoutines([]);
        return;
      }

      //사용자가 참여한 루틴 조회
      try {
        const q = query(collection(db, "routines"), where("ownerId", "==", user.uid), where("isParticipant", "==", true));

        const snapshot = await getDocs(q);
        const routines = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: `routine-${data.originalRoutineId}`,
            title: data.title,
            originalRoutineId: data.originalRoutineId,
            joinedAt: data.joinedAt,
          };
        });

        setJoinedRoutines(routines);
      } catch (error) {
        console.error("참여 루틴 조회 실패:", error);
      }
    };
  });

  // Firebase에서 메시지 실시간 구독 (루틴별 채팅방 지원)
  useEffect(() => {
    let messagesCollection = "messages";

    // 루틴별 채팅방인 경우
    if (currentChatRoom !== "general") {
      messagesCollection = `chat_rooms/${currentChatRoom}/messages`;
    }

    const q = query(collection(db, messagesCollection), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [currentChatRoom]);

  // Firebase에 메시지 추가 (루틴별 채팅방 지원 추가)
  const addMessage = async () => {
    if (newMessage.trim() && userName.trim() && user) {
      try {
        let messagesCollection = "messages";

        // 루틴별 채팅방인 경우
        if (currentChatRoom !== "general") {
          messagesCollection = `chat_rooms/${currentChatRoom}/messages`;
        }

        await addDoc(collection(db, messagesCollection), {
          text: newMessage,
          user: userName,
          timestamp: serverTimestamp(),
          id: currentUser.uid,
          userId: currentUser.uid,
        });
        setNewMessage("");
      } catch (error) {
        console.error("메시지 추가 오류:", error);
      }
    }
  };

  // 루틴 참여 함수
  const joinRoutine = async (shareRoutineId, routineData) => {
    if (!user) {
      alert("로그인이 필요합니다");
      return;
    }

    try {
      // shared_routines의 participants에 사용자 추가
      await updateDoc(doc(db, "shared_routines", shareRoutineId), {
        participants: arrayUnion(user.uid),
      });

      // 사용자의 개인 루틴에 추가
      await addDoc(collection(db, "routines"), {
        title: routineData.title,
        description: routineData.description,
        ownerId: user.uid,
        isShared: false,
        isParticipant: true,
        originalRoutineId: shareRoutineId,
        joinedAt: serverTimestamp(),
      });

      // 루틴 채팅방으로 이동
      const chatRoomId = `routine-${shareRoutineId}`;
      setCurrentChatRoom(chatRoomId);

      // 참여 알림 메시지
      await addDoc(collection(db, `chat_rooms/${chatRoomId}/messages`), {
        text: `${userName}님이 루틴에 참여했습니다.`,
        user: "System",
        userId: "system",
        timestamp: serverTimestamp(),
        type: "system",
      });

      alert("루틴 참여가 완료되었습니다.");
    } catch (error) {
      console.error("루틴 참여 실패", error);
      alert("루틴 참여에 실패했습니다.");
    }
  };

  // 채팅방 변경 함수 추가
  const handleChatRoomChange = (roomId) => {
    setCurrentChatRoom(roomId);
    setShowDropdown(false);
  };

  // 현재 채팅방 이름 가져오기
  const getCurrentRoomName = () => {
    if (currentChatRoom === "general") {
      return "전체 채팅";
    }

    const routine = joinedRoutines.find((r) => r.id === currentChatRoom);
    return routine ? `${routine.title} 채팅방` : "루틴 채팅방";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addMessage();
    }
  };

  // 닉네임 변경 함수
  const handleNicknameChange = () => {
    const newNickname = prompt("닉네임을 입력하세요:", userName);

    if (newNickname !== null && newNickname.trim() !== "") {
      setUserName(newNickname.trim());
    }
  };

  // 드롭다운 외부 클릭 시 닫기 추가
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="chat-container">
      {/* 헤더 섹션 */}
      <div className="chat-header">
        <div>
          <h1>Routinus 루틴 공유방</h1>
          <div className="chat-header-button">
            <div className="chat-room-controls">
              <div className="room-buttons">
                {/* 드롭다운 버튼 */}
                <div className="chat-room-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`dropdown-trigger ${currentChatRoom === "general" ? "active-room" : "room-button"}`}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {getCurrentRoomName()}
                    <span className="dropdown-arrow">{showDropdown ? "▲" : "▼"}</span>
                  </button>

                  {showDropdown && (
                    <div className="dropdown-menu">
                      {/* 전체 채팅 옵션 */}
                      <div className={`dropdown-item ${currentChatRoom === "general" ? "active-item" : ""}`} onClick={() => handleChatRoomChange("general")}>
                        전체 채팅
                      </div>

                      {/* 참여 중인 루틴들 */}
                      {joinedRoutines.length > 0 && (
                        <>
                          {joinedRoutines.map((routine) => (
                            <div
                              key={routine.id}
                              className={`dropdown-item ${currentChatRoom === routine.id ? "active-item" : ""}`}
                              onClick={() => handleChatRoomChange(routine.id)}
                            >
                              {routine.title}
                            </div>
                          ))}
                        </>
                      )}

                      {joinedRoutines.length === 0 && <div className="dropdown-item disabled">참여 중인 루틴이 없습니다</div>}
                    </div>
                  )}
                </div>
              </div>
              <div className="user-controls">
                <button onClick={handleNicknameChange} className="nickname-button">
                  닉네임 설정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 정보 표시 */}
      <div className="userinfo">
        <p className="nickname-section">현재 내 닉네임: {userName}</p>
        <p className="login-time-info">접속 시간: {userLoginTime.toLocaleTimeString()}</p>
      </div>

      {/* 메시지 목록 */}
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.id === currentUser.uid ? "my-message" : "other-message"}`}>
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
        <div className="button-container">
          <button onClick={addMessage} className="send-button">
            전송
          </button>

          {/* 루틴 공유 버튼 */}
          {user && (
            <button onClick={() => setShowRoutineModal(true)} className="routine-share-button">
              루틴 공유
            </button>
          )}
        </div>
      </div>

      {/* 루틴 공유 모달 */}
      {showRoutineModal && <RoutineShareModal onClose={() => setShowRoutineModal(false)} user={user} userName={userName} />}
    </div>
  );
}

export default Chat;
