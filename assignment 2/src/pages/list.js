import React, { useState, useEffect } from 'react';
import { Map, Marker, ZoomControl } from "pigeon-maps"
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Col, Row } from 'reactstrap';
import { useSearchParams } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { Pie } from 'react-chartjs-2';
import chartjs from'react-chartjs-2';




function List() {
  
  const [list, setList]=useState([]);
  const [searchParams] = useSearchParams();
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const name = searchParams.get('a');
  const [fivekm,setFivekm] = useState(0); 
  const [tenkm,setTenkm] = useState(0); 
  const [thirtykm,setThirtykm] = useState(0); 
  const [hundredkm,setHundredkm] = useState(0); 
  const token = localStorage.getItem('token');
  const [errorMessage, setErrorMessage] = useState(null);
  const title=['population_5km', 'population_10km', 'population_30km','population_100km'];

  useEffect(()=>{

    if(token==null){
      fetch(`http://4.237.58.241:3000/volcano/
      ${name}
      `
      )
      .then(response => response.json())
      .then(data =>{
        if(data.error){
          setErrorMessage(data.message);
          return;
        }
          setErrorMessage(null);
          setList(data);
          setLatitude(Object.values(data)[7]);
          setLongitude(Object.values(data)[8]);
      }).catch((error)=>console.log(error.message));
    }else{
      fetch(`http://4.237.58.241:3000/volcano/${name}`,{
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
			  headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
      }
      )
      .then(response => response.json())
      .then(data =>{
        if(data.error){
          setErrorMessage(data.message);
          return;
        }
          setErrorMessage(null);
          setList(data);
          setLatitude(Object.values(data)[7]);
          setLongitude(Object.values(data)[8]);
          setFivekm(parseInt(Object.values(data)[9]));
          setTenkm(Object.values(data)[10]);
          setThirtykm(Object.values(data)[11]);
          setHundredkm(Object.values(data)[12]);
      }).catch((error)=>console.log(error.message));
    }

   
    },[])
  

  const nameKey = Object.keys(list).find(key => true);
  const key=Object.keys(list);
  const nameValue = list[nameKey];
  const listKeys = Object.keys(list).slice(1);
  const listKeyValue = listKeys.map(key => (
    <p key={key}>{key}: {list[key]}</p>
  ));

  return (

    <Container className="bg-white">
      <Row>
      <Col className="bg-white" xs="3">
        <h2>{nameValue}</h2>
        <p>{listKeyValue}</p>
        <p>{errorMessage}</p>
      </Col>
      <Col className="bg-white " xs="9">
        <Map  height={500} center={[parseFloat(latitude),parseFloat(longitude)]} zoom={5}>
            <ZoomControl  />
            <Marker color={`#ff0000`}  width={50} anchor={[parseFloat(latitude),parseFloat(longitude)]} />
        </Map>
      </Col>
      
      
      <Col className="bg-white " xs="12" style={{display: 'grid', placeItems: 'center',  justifyContent: 'center', alignItems: 'center', }}>
        {(token!=null)?(
          <div style={{display: 'grid', placeItems: 'center', width: '600px', height: '400px', justifyContent: 'center', alignItems: 'center', }}>
          
          <Pie datasetIdKey='id' 
              data={{labels:title, 
              datasets: 
                [
                  {
                    data: [`${fivekm}`, `${tenkm}`, `${thirtykm}`,`${hundredkm}`],
                    backgroundColor: [
                      'rgb(240,80,83)',
                      'rgb(115,3,192)',
                      'rgb(236,56,188)',
                      'rgb(41,255,198)'
                    ]},
              ],
              hoverOffset: 1,
              
            }}
        />
        </div>
        ):null}
      </Col>


  </Row>    
    </Container>
  )

}

export default List;
