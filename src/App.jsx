import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CreateEmail from './pages/auth/CreateEmail'
import Dashboard from './pages/Dashboard/Dashboard'
import CheckMail from './pages/auth/CheckMail'
import Inbox from './pages/Dashboard/components/Inbox'
import { EmailProvider } from "./context/EmailContext"
import EmailDetail from './pages/Dashboard/components/EmailDetail'
import PrivateRoute from './components/PrivateRoute'

const App = () => {
  return (
    <EmailProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protect create-email and dashboard */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route
              path="/inbox"
              element={
                <PrivateRoute>
                  <Inbox />
                </PrivateRoute>
              }
            />
            <Route
              path="/email-data"
              element={
                <PrivateRoute>
                  <EmailDetail />
                </PrivateRoute>
              }
            />
          </Route>


          <Route
            path="/create-mail"
            element={
              <PrivateRoute>
                <CreateEmail />
              </PrivateRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PrivateRoute>
                <CheckMail />
              </PrivateRoute>
            }
          />


        </Routes>
      </BrowserRouter>
    </EmailProvider>
  )
}

export default App


//UNIFORM VASE ZEPHYR KICK LIFE Ivy JULY XENOPHOBIA PARTY ENERGY TIGER SAND TOOTH KNOT VACCINE WAGON