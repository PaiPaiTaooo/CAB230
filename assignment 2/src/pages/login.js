import '../css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Label, Input, Button,Alert} from 'reactstrap';
import { useState} from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
   
    
    
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    
    

      const login = (email, password) => {
        const url = `http://4.237.58.241:3000/user/login`;
    
        return fetch(url, {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify({ email: email, password: password }),
        })
          .then((res) => res.json())
          .then(
            (res) => 
            {
            if (res.error) {
              setErrorMessage(res.message);
              return;
            }
    
            setErrorMessage(null);
            localStorage.setItem('token', res.token);
            navigate(`/home`);
           
          }
          )
          .catch((error) => console.log(error.message));
      };
    
    
      const onSubmit = (e) => {
        
        e.preventDefault();
    
        const email = e.target.email.value;
        const password = e.target.password.value;
        console.log('email:', email);
        console.log('password:', password);
    
        if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
          setErrorMessage('Invalid email');
          return;
        }
        if (password.length > 16) {
          setErrorMessage('Password must be less than 16 characters');
          return;
        }
    
        setErrorMessage(null);
        login(email, password);
      };



    return (
        
      <form onSubmit={onSubmit} >
        <h2>Login</h2>
      <Label htmlFor='email'>Email:</Label>
      <Input type='email' id='email' placeholder='example@email.com' />
      <br />

      <Label htmlFor='password'>Password:</Label>
      <Input type='password' id='password' placeholder='******' />
      <br />

      <Alert color='warning' hidden={!errorMessage}>
        {errorMessage}
      </Alert>

      <Button type='submit'>Login</Button>
    </form>
        
    );
  }
  
  export default Login
  ;