import '../css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Row, Col,Container} from 'reactstrap';





function Home() {
    return (

        <Container className="bg-white">
            <Row>
                <Col className="bg-white ">
                
                </Col>
                <Col className="bg-white ">
                    <h1><strong>&nbsp;Volcanoes of the World</strong></h1>
                    &nbsp;&nbsp;&nbsp;<img src='/img/volcanoes.png' style={{border: 'none'}} alt='11' width="500" height="500"/>
                </Col>
                <Col className="bg-white ">
            
                </Col>
            </Row>
            
        </Container>

        
    );
  }
  
  export default Home
  ;