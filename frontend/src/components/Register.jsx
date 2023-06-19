import React, {useState, useRef} from 'react'
import "./register.css"
import { Cancel, Room } from '@material-ui/icons'
import axios from 'axios';

function Register({setShowRegister}) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const nameRef = useRef()
  const emailRef = useRef()
  const passwordRef = useRef()

const handleSubmit = async (e) => {
  e.preventDefault();
  const newUser = {
    username: nameRef.current.value,
    email: emailRef.current.value,
    password: passwordRef.current.value,
  };
  try {
    await axios.post("/users/register", newUser);
    setError(false);
    setSuccess(true);
    setShowRegister(false);
  } catch (err) {
    setError(true);
  }
};

return (
  <div className='registerContainer'>
    <div className='logoRegister'>
      <Room/>
      <span>PinMe</span> 
    </div>
    <form className="formm" onSubmit={handleSubmit}>
        <input autoFocus type='text' placeholder='Please enter a name' ref={nameRef}></input>
        <input type='email' placeholder='Please enter an email' ref={emailRef}></input>
        <input type='password' placeholder='Please enter a password' ref={passwordRef}></input>
        <button type='submit' className='registerButton'>Register</button>
        {success && (<span className='success'>You are successfully registered!</span>)}
        {error && (<span className='failure'>User has already been registered !</span>)}
    </form>
    <Cancel className='registerCancel' onClick={()=>setShowRegister(false)}/>
  </div>
)}

export default Register