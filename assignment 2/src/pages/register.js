import '../css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Label, Input,Button,Alert} from 'reactstrap';

function Register() {
  
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);
   
    const logina = (email, password) => {
		const url = `http://4.237.58.241:3000/user/register`;

		return fetch(url, {
			method: 'POST', 
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email: email, password: password }),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					setErrorMessage(res.message);
					return;
				}
				
				setErrorMessage(null);
                navigate(`/home`);
			})
			.catch((error) => console.log(error.message));
	};

    const onSubmitRegister = (e) => {
		e.preventDefault();

		const email = e.target.email.value;
		const password = e.target.password.value;
		if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
			setErrorMessage('Invalid email');
			return;
		}
		if (password.length > 16) {
			setErrorMessage('Password must be less than 16 characters');
			return;
		}

		setErrorMessage(null);
		logina(email, password);
	};

    return (
        
            <form onSubmit={onSubmitRegister}>
                <h2>Register</h2>
                  <Label htmlFor='email'>Email:</Label>
                  <Input type='email' id='email' placeholder='example@email.com' />
                  <br />

                  <Label htmlFor='password'>Password:</Label>
                  <Input type='password' id='password' placeholder='******' />
                  <br />

                  <Alert color='warning' hidden={!errorMessage}>
                    {errorMessage}
                  </Alert>

                  {/* This means: if error has a value, display this */}
                  <Button type='submit'>Login</Button>
            </form>
        
    );
  }
  
  export default Register
  ;