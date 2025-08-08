import { db, auth } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp, doc, query, where, updateDoc, onSnapshot } from "firebase/firestore";

function RoutineShareModal({ onClose, currentChatRoom,onRoutineShared }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "routines"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const allUserRoutines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 본인이 만든 루틴만 필터링 (isParticipant가 없거나 false인 것)
        const ownRoutines = allUserRoutines.filter((routine) => {
          return !routine.isParticipant || routine.isParticipant === false;
        });

        // 모든 본인 루틴을 공유 가능하게 설정
        const shareableRoutines = ownRoutines;

        setRoutines(shareableRoutines);
        setLoading(false);
      } catch (error) {
        console.error("루틴 조회 실패:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleShare = async (routine) => {
    try {
      // 이미 공유된 루틴인지 확인
      const isAlreadyShared = routine.isShared === true;

      if (isAlreadyShared) {
        const confirmReShare = window.confirm(`"${routine.title}" 루틴은 이미 공유된 루틴입니다. 다시 공유하시겠습니까?`);
        if (!confirmReShare) return;
      }

      // shared_routines에 루틴 저장
      const sharedRoutineRef = await addDoc(collection(db, "shared_routines"), {
        ...routine,
        originalId: routine.id,
        sharedBy: user.uid,
        sharedByName: user.email,
        sharedAt: serverTimestamp(),
        participants: [user.uid],
        isActive: true,
      });


      await updateDoc(doc(db, "routines",routine.id),{
        isShared:true,
        sharedRoutineId: sharedRoutineRef.id, // 공유된 루틴과 연결
        updatedAt: new Date()
      })

      // 전체 채팅에 공유 메시지 전송
      const shareText = isAlreadyShared
        ? `${user.displayName || user.email}님이 "${routine.title}" 루틴을 다시 공유했습니다.`
        : `${user.displayName || user.email}님이 "${routine.title}" 루틴을 공유했습니다.`;

      await addDoc(collection(db, "messages"), {
        type: "routine_share",
        routineId: routine.id,
        sharedRoutineId: sharedRoutineRef.id,
        routineTitle: routine.title,
        routineDescription: routine.description || "",
        routineExercises: routine.exercises || [],
        text: shareText,
        timestamp: serverTimestamp(),
        user: user.email,
        userId: user.uid,
      });

      // 루틴 채팅방 생성 및 초기 메시지
      const chatRoomId = `routine-${sharedRoutineRef.id}`;
      await addDoc(collection(db, `chat_rooms/${chatRoomId}/messages`), {
        text: `"${routine.title}" 루틴 채팅방이 생성되었습니다.`,
        user: "System",
        userId: "system",
        timestamp: serverTimestamp(),
        type: "system",
      });

      // 원본 루틴 공유됨으로 표시
      await updateDoc(doc(db, "routines", routine.id), {
        isShared: true,
        sharedAt: serverTimestamp(),
      });

      alert(isAlreadyShared ? "루틴이 성공적으로 재공유되었습니다!" : "루틴이 성공적으로 공유되었습니다!");

      if(onRoutineShared) {
        const routineInfo = {
          id: chatRoomId,
          title: routine.title,
          originalRoutineId: sharedRoutineRef.id,
          joinedAt: new Date(),
          isOwner:true
        };
        onRoutineShared(chatRoomId, routineInfo);
      }
      onClose();
    } catch (error) {
      console.error("루틴 공유 실패", error);
      alert("루틴 공유에 실패했습니다.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">공유할 루틴 선택</h2>
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div>로딩 중...</div>
          ) : routines.length === 0 ? (
            <div className="no-routines">
              <p>공유할 수 있는 루틴이 없습니다.</p>
              <small>본인이 만든 루틴이 없습니다. 새로운 루틴을 생성해보세요!</small>
            </div>
          ) : (
            <div className="routines-list">
              {routines.map((routine) => (
                <div key={routine.id} className="routine-item">
                  <div className="routine-info">
                    <h3 className="routine-title">
                      {routine.title || "제목 없음"}
                      {routine.isShared && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            background: "#ffeaa7",
                            color: "#2d3436",
                            padding: "2px 6px",
                            borderRadius: "12px",
                          }}
                        >
                          이미 공유됨
                        </span>
                      )}
                    </h3>
                    <p className="routine-description">{routine.description || "설명 없음"}</p>
                    <small style={{ color: "#666" }}>생성일: {routine.createdAt?.toDate?.()?.toLocaleDateString() || "알 수 없음"}</small>
                  </div>
                  <button onClick={() => handleShare(routine)} className="modal-button modal-button-primary share-button">
                    {routine.isShared ? "다시 공유하기" : "공유하기"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-button modal-button-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoutineShareModal;
