import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Newgames from './pages/games/Newgames'
import Allgames from './pages/games/Allgames'
import Activegames from './pages/games/Activegames'
import Deactivegames from './pages/games/Deactivegames'
import Gamecategory from './pages/games/Gamecategory'
import Gameproviders from './pages/games/Gameproviders'
import Allbets from './pages/bets/Allbets'
import Stakebets from './pages/bets/Stakebets'
import Allusers from './pages/users/Allusers'
import Newuser from './pages/users/Newuser'
import Activeuser from './pages/users/Activeuser'
import Inactiveuser from './pages/users/Inactiveuser'
import Restricteduser from './pages/users/Restricteduser'
import Alldeposit from './pages/deposit/Alldeposit'
import Pendingdeposit from './pages/deposit/Pendingdeposit'
import Approveddeposit from './pages/deposit/Approveddeposit'
import Rejecteddeposit from './pages/deposit/Rejecteddeposit'
import Allwithdraw from './pages/withdraw/Allwithdraw'
import Pendingwithdraw from './pages/withdraw/Pendingwithdraw'
import Approvedwithdraw from './pages/withdraw/Approvedwithdraw'
import Rejectedwithdraw from './pages/withdraw/Rejectedwithdraw'
import Banner from './pages/content/Banner'
import Prmotional from './pages/content/Prmotional'
import FAQ from './pages/content/FAQ'
import Terms from './pages/content/Terms'
import Logouplaod from './pages/content/Logouplaod'
import Sendnotification from './pages/notification/Sendnotification'
import Allnotification from './pages/notification/Allnotification'
import AllLoginLogs from './pages/loginlogs/Allloginlogs'
import Failedloginlogs from './pages/loginlogs/Failedloginlogs'
import Ipwhitelist from './pages/loginlogs/Ipwhitelist'
import Securitysettings from './pages/loginlogs/Securitysettings'
import Devicemanagement from './pages/loginlogs/Devicemanagement'
import Event from './pages/event/Event'
import Allevent from './pages/event/Allevent'
import Allaffiliates from './pages/allaffiliates/Allaffiliates'
import Payout from './pages/payout/Payout'
import Affiliatepayout from './pages/affiliatepayout/Affiliatepayout'
import Affilaitedetails from './pages/allaffiliates/Affilaitedetails'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem('admin')
  return admin ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const admin = localStorage.getItem('admin')
  return !admin ? children : <Navigate to="/dashboard" replace />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route 
          exact 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        {/* Redirect root to login or dashboard based on auth status */}
        <Route 
          exact 
          path="/" 
          element={
            localStorage.getItem('admin') ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        
        {/* ------------------------ Protected routes ----------------------- */}
        <Route 
          exact 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/games-management/new-game" 
          element={
            <ProtectedRoute>
              <Newgames />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/games-management/all-games" 
          element={
            <ProtectedRoute>
              <Allgames />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/games-management/active-games" 
          element={
            <ProtectedRoute>
              <Activegames />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/games-management/deactive-games" 
          element={
            <ProtectedRoute>
              <Deactivegames />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/games-management/game-categories" 
          element={
            <ProtectedRoute>
              <Gamecategory />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/games-management/game-providers" 
          element={
            <ProtectedRoute>
              <Gameproviders />
            </ProtectedRoute>
          }
        />
        
        {/* -------------------------- bets menu ---------------------- */}
        <Route 
          exact 
          path="/bet-logs/bet-logs" 
          element={
            <ProtectedRoute>
              <Allbets />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/bet-logs/hight-stakes-bet-logs" 
          element={
            <ProtectedRoute>
              <Stakebets />
            </ProtectedRoute>
          }
        />
        
        {/* --------------- users --------------------------- */}
        <Route 
          exact 
          path="/users/all-users" 
          element={
            <ProtectedRoute>
              <Allusers />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/users/new-user" 
          element={
            <ProtectedRoute>
              <Newuser />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/users/active-users" 
          element={
            <ProtectedRoute>
              <Activeuser />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/users/inactive-users" 
          element={
            <ProtectedRoute>
              <Inactiveuser />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/users/restricted-users" 
          element={
            <ProtectedRoute>
              <Restricteduser />
            </ProtectedRoute>
          }
        />
        
        {/* ------------------ all-deposit-menu ------------------------ */}
        <Route 
          exact 
          path="/deposit/pending" 
          element={
            <ProtectedRoute>
              <Pendingdeposit />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/deposit/approved" 
          element={
            <ProtectedRoute>
              <Approveddeposit />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/deposit/rejected" 
          element={
            <ProtectedRoute>
              <Rejecteddeposit />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/deposit/history" 
          element={
            <ProtectedRoute>
              <Alldeposit />
            </ProtectedRoute>
          }
        />
        
        {/* ------------------------- all-withdraw-menu ----------------- */}
        <Route 
          exact 
          path="/withdraw/pending" 
          element={
            <ProtectedRoute>
              <Pendingwithdraw />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/withdraw/approved" 
          element={
            <ProtectedRoute>
              <Approvedwithdraw />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/withdraw/rejected" 
          element={
            <ProtectedRoute>
              <Rejectedwithdraw />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/withdraw/history" 
          element={
            <ProtectedRoute>
              <Allwithdraw />
            </ProtectedRoute>
          }
        />
        
        {/* -------------------------- content-menu --------------------- */}
        <Route 
          exact 
          path="/content/banner-and-sliders" 
          element={
            <ProtectedRoute>
              <Banner />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/content/promotional-content" 
          element={
            <ProtectedRoute>
              <Prmotional />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/content/faq" 
          element={
            <ProtectedRoute>
              <FAQ />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/content/terms-and-conditions" 
          element={
            <ProtectedRoute>
              <Terms />
            </ProtectedRoute>
          }
        />
        
        <Route 
          exact 
          path="/content/logo-and-favicon" 
          element={
            <ProtectedRoute>
              <Logouplaod />
            </ProtectedRoute>
          }
        />
 <Route 
          exact 
          path="/login-logs/all-logs" 
          element={
            <ProtectedRoute>
              <AllLoginLogs />
            </ProtectedRoute>
          }
        />

         <Route 
          exact 
          path="/login-logs/failed-logins" 
          element={
            <ProtectedRoute>
              <Failedloginlogs />
            </ProtectedRoute>
          }
        />

         <Route 
          exact 
          path="/login-logs/ip-whitelist" 
          element={
            <ProtectedRoute>
              <Ipwhitelist />
            </ProtectedRoute>
          }
        />

         <Route 
          exact 
          path="/login-logs/security-settings" 
          element={
            <ProtectedRoute>
              <Securitysettings />
            </ProtectedRoute>
          }
        />

         <Route 
          exact 
          path="/login-logs/device-management" 
          element={
            <ProtectedRoute>
              <Devicemanagement />
            </ProtectedRoute>
          }
        />
                <Route 
          exact 
          path="/notifications/send-notification" 
          element={
            <ProtectedRoute>
              <Sendnotification/>
            </ProtectedRoute>
          }
        />
                      <Route 
          exact 
          path="/notifications/all-notifications" 
          element={
            <ProtectedRoute>
              <Allnotification/>
            </ProtectedRoute>
          }
        />
               <Route 
          exact 
          path="/event-management/create-event" 
          element={
            <ProtectedRoute>
              <Event />
            </ProtectedRoute>
          }
        />
         <Route 
          exact 
          path="/event-management/all-events" 
          element={
            <ProtectedRoute>
              <Allevent />
            </ProtectedRoute>
          }
        />
        {/* ---------------------all-affiliate------------------------- */}
           <Route 
          exact 
          path="/affiliates/all-affiliates" 
          element={
            <ProtectedRoute>
              <Allaffiliates />
            </ProtectedRoute>
          }
        />
               <Route 
          exact 
          path="/affiliates/payout" 
          element={
            <ProtectedRoute>
              <Payout />
            </ProtectedRoute>
          }
        />
                 <Route 
          exact 
          path="/affiliates/set-affilaite-payout-amount" 
          element={
            <ProtectedRoute>
              <Affiliatepayout />
            </ProtectedRoute>
          }
        />
                   <Route 
          exact 
          path="/affiliates/affilaite-details/:id" 
          element={
            <ProtectedRoute>
              <Affilaitedetails />
            </ProtectedRoute>
          }
        />
        {/* Catch all route - redirect to dashboard if authenticated, otherwise to login */}
        <Route 
          path="*" 
          element={
            localStorage.getItem('admin') ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App