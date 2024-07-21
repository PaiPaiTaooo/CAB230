import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Volcanoes from "./pages/volcanoes.js"
import List from './pages/list.js';
import Home from './pages/home.js';

import Register from './pages/register.js';
import { Row, Col, NavLink, Nav, NavItem,Container} from 'reactstrap';
import Login from './pages/login.js';



function App() {
  

  const deleteToken = ()=>{
    localStorage.removeItem("token");
  }

  return (
    
  
    
    <Container className="bg-white">
      <Row >
        <Col className="bg-white">
          
        </Col>
        <Col className="bg-white">
          <Nav>
          <NavItem>
            <NavLink active href="/home">Home</NavLink>
          </NavItem>
          <NavItem>
            <NavLink active href="/volcanoes">Volcano List</NavLink>
          </NavItem>
          <NavItem>
            <NavLink active href="/register">Register</NavLink>
          </NavItem>
          <NavItem>
            {
            (localStorage.getItem('token')!=null)?
            (<NavLink active onClick={deleteToken} href="#">Logout</NavLink>):
            (<NavLink active  href="/login">Login</NavLink>)
            }
          </NavItem>
          </Nav>
        </Col>
        <Col className="bg-white">
          
        </Col>
        
      </Row>
      <br/>
       
      

      
    <Router>
        <Routes>
          <Route path="/home" element={<Home/>}/>
        </Routes>
        <Routes>
          <Route path="/"  element={<Home />}></Route>
        </Routes>
        <Routes>
          <Route path='/volcanoes' element={<Volcanoes />}></Route>
        </Routes>
        <Routes>
          <Route path='/list' element={<List />}></Route>
        </Routes> 
        <Routes>
          <Route path='/register' element={<Register />}></Route>
        </Routes> 
        <Routes>
          <Route path='/login' element={<Login />}></Route>
        </Routes> 
    </Router>
    </Container>
    
          
  
  );
}
export default App;
