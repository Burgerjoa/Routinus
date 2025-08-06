import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import { auth } from "../firebase";
import './signupPage.css';

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [displayName, setDisplayname] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    //firebase는 6자리 미만으로 입력하면 회원가입 제공 X 비밀번호 길이 확인
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (!displayName.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    try {
      setError("");

      //회원가입 실행
      const userSignup = await createUserWithEmailAndPassword(auth, email, password);

      //displayname 설정
      await updateProfile(userSignup.user, {
        displayName: displayName.trim(),
      });

      console.log("회원가입 성공", userSignup.user);

      alert("회원가입이 완료되었습니다");
      navigate("/login");

      //에러 처리
    } catch (error) {
      console.error("회원가입 에러", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("이미 사용 중인 이메일입니다.");
          break;
        case "auth/invalid-email":
          setError("유효하지 않은 이메일 형식입니다.");
          break;
        default:
          setError("회원가입 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h1>회원가입</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
            type="text" 
            placeholder="이름" 
            value={displayName} 
            onChange={(e) => setDisplayname(e.target.value)} 
            required />
          </div>

          <div className="input-group">
            <input 
            type="email" 
            placeholder="이메일" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required />
          </div>

          <div className="input-group">
            <input 
            type="password" 
            placeholder="비밀번호" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required />
          </div>

          <div className="input-group">
            <input 
            type="password" 
            placeholder="비밀번호 확인" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button">
            회원가입 하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
