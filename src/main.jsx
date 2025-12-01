import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Hide address bar on mobile by scrolling
window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo(0, 1)
  }, 0)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
