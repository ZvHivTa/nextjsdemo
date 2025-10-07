
import ListGroup from './components/ListGroup';
import Message from './Message';
import Alert from './components/Alert';
import Button from './components/Button';
import { useState } from 'react';

function App() {
  
let items =[
        'New York',
        'San Francisco',
        'Tokyo',
        'London',
        'Paris'
    ];

let buttonClasses =[
  'btn btn-primary',
  'btn btn-secondary',
  'btn btn-success',
  'btn btn-danger',
  'btn btn-warning',
  'btn btn-info',
  'btn btn-light',
  'btn btn-dark'
];

const [alertVisible,setAlertVisibility] = useState(false);
const handleSelectItem = (item: string) => {
  console.log(item)
};

const handleSelectButton = (item: string) => {
  //console.log(item)
  setAlertVisibility(true);
};

  return (
    <div>
      {/* <ListGroup items = {items} heading='Cities' onSelectItem={handleSelectItem}/>

      <Alert>
        "Hello world!"
        <span>123</span>
      </Alert> */}
      {alertVisible && <Alert onClose={()=>setAlertVisibility(false)}>My alert!</Alert>}
      <Button name = {buttonClasses}  onClickButton = {handleSelectButton}/>
    </div>
  )
}

export default App
