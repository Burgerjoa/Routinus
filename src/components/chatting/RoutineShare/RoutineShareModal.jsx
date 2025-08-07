import { db, auth } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp, doc, query, where, updateDoc } from "firebase/firestore";

function RoutineShareModal({ onClose, currentChatRoom }) {
  const [routines, setRoutines] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchRoutines = async () => {
      if (!user) return;
      
      const q = query(
        collection(db, "routines"), 
        where("ownerId", "==", user.uid), 
        where("isShared", "==", false)
      );

      const snapshot = await getDocs(q);
      setRoutines(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchRoutines();
  }, [user]);

  const handleShare = async (routine) => {
    try {
      // shared_routines에 루틴 저장
      const sharedRoutineRef = await addDoc(collection(db, "shared_routines"), {
        ...routine,
        originalId: routine.id,
        sharedBy: user.uid,
        sharedByName: user.email,
        sharedAt: serverTimestamp(),
        participants: [user.uid],
        isActive: true
      });

      // 전체 채팅에 공유 메시지 전송
      await addDoc(collection(db, 'messages'), {
        type: "routine_share",
        routineId: routine.id,
        sharedRoutineId: sharedRoutineRef.id,
        routineTitle: routine.title,
        routineDescription: routine.description,
        routineExercises: routine.exercises || [],
        text: `${user.displayName || user.email}님이 "${routine.title}" 루틴을 공유했습니다.`,
        timestamp: serverTimestamp(),
        user: user.email,
        userId: user.uid
      });

      // 4. 루틴 채팅방 생성 및 초기 메시지
      const chatRoomId = `routine-${sharedRoutineRef.id}`;
      await addDoc(collection(db, `chat_rooms/${chatRoomId}/messages`), {
        text: `"${routine.title}" 루틴 채팅방이 생성되었습니다.`,
        user: 'System',
        userId: 'system',
        timestamp: serverTimestamp(),
        type: 'system'
      });

      // 5. 원본 루틴 공유됨으로 표시
      await updateDoc(doc(db, "routines", routine.id), {
        isShared: true
      });

      alert('루틴이 성공적으로 공유되었습니다!');
      onClose();
    } catch (error) {
      console.error("루틴 공유 실패", error);
      alert('루틴 공유에 실패했습니다.');
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
          {routines.length === 0 ? (
            <div className="no-routines">
              <p>공유할 수 있는 루틴이 없습니다.</p>
              <small>새로운 루틴을 만들어 보세요!</small>
            </div>
          ) : (
            <div className="routines-list">
              {routines.map((routine) => (
                <div key={routine.id} className="routine-item">
                  <div className="routine-info">
                    <h3 className="routine-title">{routine.title || "제목 없음"}</h3>
                    <p className="routine-description">{routine.description || "설명 없음"}</p>
                    {routine.exercises && routine.exercises.length > 0 && (
                      <div className="exercises-preview">
                        <span className="exercise-count">운동 {routine.exercises.length}개</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleShare(routine)} 
                    className="modal-button modal-button-primary share-button"
                  >
                    공유하기
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