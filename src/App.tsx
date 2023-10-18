import './App.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
function App() {
  const [message, setMessage] = useState<string>('')
  useEffect(() => {
    axios.get('/api/hello').then((res) => {
      setMessage(res.data.message)
    })
  }, [])

  return (
    <div className="bg-red-400">
      <p>Change</p>
      <h1>{message}</h1>
    </div>
  )
}

export default App
