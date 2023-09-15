import { Cancel, Room } from "@material-ui/icons";
import axios from "axios";
import { useRef, useState } from "react";
import "./login.css";

export default function Login({ setShowLogin, setCurrentUser, myStorage, setCurrentUserId }) {
  const [error, setError] = useState(false);
  const nameRef = useRef();
  const passwordRef = useRef();

const handleSubmit = async (e) => {
  e.preventDefault();
  const user = {
    username: nameRef.current.value,
    password: passwordRef.current.value,
  };
  try {
    const res = await axios.post("/users/login", user);
    myStorage.setItem('user', res.data.username);
    myStorage.setItem('userId', res.data._id);
    setCurrentUser(res.data.username);
    setCurrentUserId(res.data._id);
    setShowLogin(false)
    setError(false)
  } catch (err) {
    setError(true);
  }
};

return (
  <div className="loginContainer">
    <div className="logoLogin">
      <Room />
      <span>PinMe</span>
    </div>
    <form className="form" onSubmit={handleSubmit}>
      <input autoFocus placeholder="username" ref={nameRef}></input>
      <input type="password" placeholder="password" ref={passwordRef}></input>
      <button className="loginButton" type="submit">Login</button>
      {error && <span className="failure">Wrong username or password!</span>}
    </form>
    <Cancel className="loginCancel" onClick={() => setShowLogin(false)} />
  </div>
)};

