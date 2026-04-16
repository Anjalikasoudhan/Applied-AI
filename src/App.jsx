import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'

function App() {
  return (
    <div className="min-h-screen relative flex flex-col bg-background font-sans">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-background pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40vw] h-[400px] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      {/* Our core navigation */}
      <Navbar />

      {/* Main content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative z-10">
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                  Applied.AI
                </span>
                <br />
                Career Intelligence
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Day 1 Setup Complete! The baseline Tailwind and routing architecture is ready. 
                Tomorrow, we'll build the intelligent Job Description input fields right here.
              </p>
            </div>
          } />
          <Route path="/history" element={
            <div className="p-8 bg-card border border-border rounded-xl">
              <h2 className="text-2xl font-bold">History Placeholder</h2>
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
