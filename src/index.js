import React, {Component} from 'React';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { takeLatest, takeEvery, delay } from 'redux-saga'
import { Provider, connect } from 'react-redux';
import {render} from 'react-dom';
import { call, put } from 'redux-saga/effects'

var addTodo =function (text) {
  return {
      type: "ADD_TODO",
      text: text
  }
};
var addTodoAsync =function (text) {
  return {
      type: "ADD_TODO_ASYNC_SAGA",
      text: text
  }
};
const initialState = {
  visibilityFilter: "SHOW_ALL",
  todos: []
}

var todoAppReducer = function (state= initialState, action={}) {

  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return {
        ...state,
        visibilityFilter: action.filter
      }
    case "ADD_TODO":
      return {
        ...state,
        todos: [...state.todos, {
            text: action.text,
            completed: false
          }]
      }
    case "ADD_TODO_ASYNC":
      return {
        ...state,
        todos: [...state.todos, {
            text: action.text,
            completed: false
          }]
      }

    default:
      return state
  }
};

function* HelloSaga(){
  console.log("HelloSaga")
}

function* addAsync (...params) {
  // yield delay(2000);
  let x = yield call(fetch, "http://localhost:8065", { method: 'GET' })
  console.log(JSON.stringify(params), x)
  yield put( { ...params[0], type: "ADD_TODO_ASYNC" })
}
/*FOLLOWING IS A SAGA*/
function* watchAsync (){
  yield* takeLatest('ADD_TODO_ASYNC_SAGA', addAsync)
}

export default function* rootSaga() {
  yield [
    watchAsync()
  ]
}
/*
Creating saga middle ware
and Store react redux App
*/
var sagaMiddleWare = createSagaMiddleware();

var store = createStore(
  todoAppReducer,
  applyMiddleware(sagaMiddleWare)
  );

console.log(store.getState());
sagaMiddleWare.run(rootSaga)

class List2 extends Component {
  constructor(props, context){
    super(props, context);

  }
  
  render (){
    var list = this.props.list
    return (
      <ul>
        {list && list.map((k,index)=><li key={index}> {k.text} </li>)}
      </ul>


      )
  }

};


const List = connect((state)=>{
    return {list: state.todos};
  }, (dispatch)=>{
    return {}
  })(List2);



class Input2 extends Component {
  constructor(props, context){
    super(props, context);
  }
  
  render (){
    this.input;
    return (
      <form onSubmit={(e)=>{
        this.props.submit(e, this.input)
      }}>
        <input type="text" ref={node=>this.input=node}/>
        <button type="submit">ADD</button>
        <button onClick={ (e)=>{
          this.props.asyncAdd(e, this.input)
        } } >ASYNC ADD</button>
      </form>

      )
  }

};

const Input = connect((state)=>{
    return {todos: [...state.todos]}
  },
  (dispatch)=>{
  return {
    asyncAdd: (e, input)=>{
      e.stopPropagation();
      e.preventDefault();
      dispatch(addTodoAsync(input.value));
      input.value = "";
    },
    submit: (e, input)=>{
      e.stopPropagation();
      e.preventDefault();
      dispatch(addTodo(input.value));
      input.value = "";
    }
  }
})(Input2);


class App extends Component {
  constructor(props, context){
    super(props, context);

  }

  render(){

    return (
      <div>
        <Input/>
        <List></List>
      </div>
      )
  }

};

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)