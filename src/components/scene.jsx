import {TaskList} from '../pages/TaskList';
import getScene, { API_URL } from '../services/APIHelper.js'
import React, { useEffect, useState } from 'react';

import {
  createSmartappDebugger,
  createAssistant,
} from "@sberdevices/assistant-client";

import { darkSber } from '@sberdevices/plasma-tokens/themes';
import { Button } from '@sberdevices/ui/components/Button/Button';
import { Container, Row, Col } from '@sberdevices/plasma-ui/components/Grid';
import { Image } from '@sberdevices/ui/components/Image/Image'

import './scene.css';

let currentId = 1;

let counter = 0;
let pictures = [];

const setBackground = {
  backgroundImage: ''
}

const initializeAssistant = (getState/*: any*/) => {
  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  }
  return createAssistant({ getState });
};


const fetchedData = async (id) => {
  return await getScene(id);
}

export class Scene extends React.Component {

  constructor(props) {
    super(props);
    console.log('constructor');

    //this.value = 0;

    this.state = {
      notes: [],
    //}
    //this.state = {
      scene:           null,
      backgroundImage: { background: '' }
    };

    this.assistant = initializeAssistant(() => this.getStateForAssistant() );
    this.assistant.on("data", (event/*: any*/) => {
      console.log(`assistant.on(data)`, event);
      const { action } = event
      this.dispatchAssistantAction(action);
    });
    this.assistant.on("start", (event) => {
      console.log(`assistant.on(start)`, event);
    });

  }

  async componentDidMount() {
    console.log('componentDidMount');
    const response = await getScene(currentId);
    console.log(response);
    const { data } = response;
    this.setState({ scene: data });
  }

  getStateForAssistant () {
    console.log('getStateForAssistant: this.state:', this.state)
    /*const state = {
      item_selector: {
        items: this.state.notes.map(
          ({ id, title }, index) => ({
            number: index + 1,
            id,
            title,
          })
        ),
      },
    };

    console.log('getStateForAssistant: state:', state)
    return state;*/
    return this.state;
  }

  dispatchAssistantAction (action) {
    console.log('dispatchAssistantAction', action);
    if (action) {
      switch (action.type) {
        case 'add_note':
          console.log('add_note', action, 'action.choice = ', action.choice);
          return this.add_note(action);

        /*
        case 'done_note':
          return this.done_note(action);

        case 'delete_note':
          return this.delete_note(action);

        default:
          throw new Error();
        */
      }
    }
  }

  add_note (action) {
    let choice = action.choice;

    if (choice == 'один' || choice == 'первый' || choice == 'первое') {
      choice = 1;
    }
    if (action.choice == 'два' || choice == 'второй'|| choice == 'второе') {
      choice = 2;
    }
    if (action.choice == 'три' || choice == 'третий'|| choice == 'третье') {
      choice = 3;
    }
    if (action.choice == 'четыре' || choice == 'четвертый'|| choice == 'четвертое') {
      choice = 4;
    }

    this.state.scene.options.forEach((item, index) => {
      console.log('index = ', index, 'choice = ', choice);
      if ((item.text === choice) || (index + 1 === choice)) {
        console.log('movedTo', item.id);
        this.moveTo(item.id);
      }
    })
    //return this.state;
  }

  /*add_note (action) {
    console.log('add_note', action);
    this.setState({
      notes: [
        ...this.state.notes,
        {
          id:        Math.random().toString(36).substring(7),
          title:     action.note,
          completed: false,
        },
      ],
    })
  }*/

  done_note (action) {
    console.log('done_note', action);
    this.setState({
      notes: this.state.notes.map((note) =>
        (note.id === action.id)
        ? { ...note, completed: !note.completed }
        : note
      ),
    })
  }

  delete_note (action) {
    console.log('delete_note', action);
    this.setState({
      notes: this.state.notes.filter(({ id }) => id !== action.id),
    })
  }

  setBackgrounds (curImg) {
    pictures.push(curImg);
    //debugger;
    let string = ``;
    pictures.reverse();
    pictures.forEach((pic, index) => {
      string = string + `url(${API_URL}/${pic}.png) center no-repeat`;
      if (index < pictures.length - 1){
        string = string + ',';
      }
    });
    //setBackgroundImage({background : string});
    this.setState({ backgroundImage: {background : string}})
    pictures.reverse();
  }
  
  moveTo(nextId) {
    //fetchedData(nextId)
    getScene(nextId)
      .then((response) => {
        const { data } = response;
        //setScene(data);
        this.setState({ scene: data });
      })
    counter++;
    if (counter > 2) {
      this.setBackgrounds(this.state.scene.img);
    }
  }

  render() {

    //const [scene, setScene] = useState(null);
    //const [scene, setScene] = useState(null);

    //const [backgroundImage, setBackgroundImage] = useState({background : ''});

    //const fetchedData = async (id) => {
    //    return await getScene(id);
    //}
    //
    //useEffect(() => {
    //    fetchedData(currentId).then((response) => {
    //        console.log(response);
    //        const { data } = response;
    //        setScene(data);
    //    })
    //}, []);

     const { scene, backgroundImage } = this.state;

    /*изначально было setBackgroundImage({background : `url(${API_URL}/${curImg}.png) center no-repeat`});*/



    if (scene) {
      if (scene.options) {
        return(
          <Container styles={darkSber} >

              <Row>
                <Col  type="calc" size={3}>
                  <div style={backgroundImage} className = 'img-Wrapper'> <img  src={API_URL + '/' + scene.img + '.png' } height={'450'} width={'450'} /> </div>
                </Col>
                 
                
                <Col  type="calc" offset={2} size={5}>
                  <h1> { scene.text   } </h1>
                  {
                    scene.options.map((item) => {
                      return (
                        <Row>
                          <Button style={{ marginBottom: '1rem', width: '100%' }} stretch={true} size="l" onClick={ () => this.moveTo(item.id) }>
                            {item.text}
                          </Button>
                        </Row>
                      
                      );
                    })
                  }
                </Col>

            </Row>
          </Container>
        );
      } else {
        return(
          <Container styles={darkSber} >
            <img src={API_URL + '/' + scene.img + '.png' } height={'450'} width={'450'} />
            <h1> { scene.text } </h1>
          </Container>
        )
      }

    } else {
      return <h1>Nothing...</h1>
    }

  }

}

export default Scene;
