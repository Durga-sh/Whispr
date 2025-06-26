
import { useEffect, useRef, useState } from 'react';
import './App.css'


function App() {
  const [messages, setmessages] = useState(["hiii there", "hello"]);
  const wsRef = useRef();
  useEffect(() => {
    const ws = new WebSocket("http://localhost:8080");
    ws.onmessage = (event) => {
      setmessages(m =>[...m , event.data])
    }
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        payload: {
          rommId:"red"
        }
      }))
    }
  }, [])
  

  return (
    <div className='h-screen bg-black flex-col'>
      <div className='h-[90vh]'>
        {messages.map(message => <div>
          <span className='bg-white text-black rounded p-4 m-8'>{message}
        </span>
        </div>)}
      </div>
      <div className='w-full bg-white flex p-4'>
      <input id='message' className='flex-1'></input>
        <button onClick={() => {
          const message = document.getElementById("message")?.value;
          wsRef.current.send(JSON.stringify({
            type: "chat",
            payload: {
              message:message
            }
          }))
      }} className='bg-purple-600 text-white p-4'>
        Send Message
      </button>
      </div>
    </div>
  )
}

export default App
