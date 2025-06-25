import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chatbot from './components/Chatbot'

function App() {

  return (
    <>
      <Chatbot isOpen={true} />
    </>
  )
}

export default App
