import React from 'react';
import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login';
import Signup from './pages/Signup'
import PersonalInfo from './pages/PersonalInfo';
import Summary from './pages/Summary';
import BudgetBot from './pages/Budgetbot'
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ScannerVision from './pages/ScannerVision';
import ReadWords from './pages/ReadWords'
import { ExpensesProvider } from "./context/ExpensesProvider";
import { UserProvider } from "./context/UserProvider";

function App() {

  return (
    <div>
      <UserProvider>
        <ExpensesProvider>
          <BrowserRouter>
            <Routes>
              <Route index element={<Home/>}/>
              <Route path = '/home' element = {<Home/>}/>
              <Route path = '/login' element = {<Login/>}/>
              <Route path = '/signup' element = {<Signup/>}/>
              <Route path = '/personal-info' element = {<PersonalInfo/>}/>
              <Route path = '/summary' element = {<Summary/>}/>
              <Route path = '/budgetbot' element = {<BudgetBot/>}/>
              <Route path= '/forgot' element={<ForgotPassword />} />
              <Route path='/reset/:email/:uniqueKey' element={<ResetPassword />} />
              <Route path = '/scanner'element ={<ScannerVision/>} />
              <Route path = '/scanner2' element= {<ReadWords/>}/>
            </Routes>
          </BrowserRouter>
        </ExpensesProvider>
      </UserProvider>
    </div>
  );
}

export default App;
