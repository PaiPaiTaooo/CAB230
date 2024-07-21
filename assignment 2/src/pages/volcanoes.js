import "../css/App.css";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import { useState, useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button,Container} from 'reactstrap';


function Volcanoes() {
  const history = useNavigate();
  const [rowData, setRowData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [urlCountries, seturlCountries] =useState('Algeria');
  const [populatedWithin, setpopulatedWithin]=useState(30);


  const handleurlCountriesSubmit = (event) =>{
    seturlCountries(event.target.value);
  }

  const handlepopulatedWithin = (event) =>{
    setpopulatedWithin(event.target.value);
  }

  const columns = [
    { headerName: "Name", field: "name" },
    { headerName: "Region", field: "region" },
    { headerName: "Subregion", field: "subregion" },
  ];

  useEffect(()=>{
    fetch("http://4.237.58.241:3000/countries")
      .then(response => response.json())
      .then(data =>setCountries(data))
  },[])

  const generateUrl = () => {
    const baseUrl = 'http://4.237.58.241:3000/volcanoes';
    const queryParams = new URLSearchParams({
      country: urlCountries,
      populatedWithin: populatedWithin+'km'
    });
    const url = `${baseUrl}?${queryParams.toString()}`;
    return url;
  };

  const getData = async () => {
    const url=generateUrl();
    fetch(url)
    .then((response) => response.json())
    .then((data) => 
  
      data.map((x) => {
      return {
        id: x.id,
        name: x.name,
        region: x.region,
        subregion: x.subregion,};
      }
        ))
      .then((x) => setRowData(x)
      ).catch((error) => console.log(error.message));
  }

  const handleData = () => {
    getData();
  };

  const onCellClicked =(event)=>{
    const data = event.data;
    history(`/list?a=${data.id}`);
  };

  return (
    <Container className="bg-white" >
        <Row >
          <Col className="bg-white" xs="3">
            
          </Col>
          <Col className="bg-white" xs="6">
            <div>
            
              Country:
            
            <select name="country" value={urlCountries} onChange={handleurlCountriesSubmit}>
              {countries.map(country => (
                <option value={country}>{country}</option>
              ))}
            </select>
            &nbsp;&nbsp;
            Populated Within:
            
            <select name="populatedWithin" value={populatedWithin} onChange={handlepopulatedWithin}>
              <option value={5}>5km</option>
              <option value={10}>10km</option>
              <option value={30}>30km</option>
              <option value={100}>100km</option>
            </select>
            &nbsp;&nbsp;
            <Button size="sm" onClick={handleData}>search</Button>
          <div>
          <br/>
          </div>
            </div>
          </Col>
            <Col className="bg-white" xs="3">
          </Col>
          
        </Row>

        <Row>
          <Col className="bg-white" xs="3">
            
          </Col>
          <Col className="bg-white" xs="6">
            <div className="ag-theme-balham" style={{ height: "300px", width: "600px" }}>
              <AgGridReact columnDefs={columns} onCellClicked={onCellClicked} rowData={rowData} pagination />
            </div>
          </Col>
          <Col className="bg-white" xs="3">
            
          </Col>
        </Row>
     
    </Container>
    
  );
}

export default Volcanoes;
