import { useState } from 'react';

function RoutineShareMessage({ message, onJoinRoutine, currentUserId }) {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (isJoining) return;
    
    setIsJoining(true);
    try {
      await onJoinRoutine(message.sharedRoutineId, {
        title: message.routineTitle,
        description: message.routineDescription || "",
        exercises: message.routineExercises || []
      });
    } catch (error) {
      console.error('참여 실패:', error);
      alert('루틴 참여에 실패했습니다.');
    } finally {
      setIsJoining(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleTimeString();
    }
    if (typeof timestamp === 'object' && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString();
    }
    return String(timestamp);
  };

  return (
    <div className="routine-share-message">
      <div className="routine-share-header">
        <span className="share-user"> {message.user}</span>
        <span className="share-time">{formatTimestamp(message.timestamp)}</span>
      </div>
      
      <div className="routine-share-content">
        <h4>{message.routineTitle}</h4>
        
        {/* 자신이 공유한 루틴이 아닌 경우에만 참여 버튼 표시 */}
        {message.userId !== currentUserId ? (
          <button 
            onClick={handleJoin} 
            disabled={isJoining}
            className="join-routine-button"
          >
            {isJoining ? '참여 중...' : '루틴 참여하기'}
          </button>
        ) : (
          <span className="own-routine">내가 공유한 루틴</span>
        )}
      </div>
    </div>
  );
}

export default RoutineShareMessage;