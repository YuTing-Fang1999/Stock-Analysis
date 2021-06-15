import React from 'react';
import ReactDOM from 'react-dom';
import Menu from "./Menu"
import MyRoute from "./MyRoute"
import { BrowserRouter as Router, Route, Link, Redirect, HashRouter } from "react-router-dom";
import SimpleBreadcrumbs from "./SimpleBreadcrumbs"

import './index.less'

function App() {

   return (
      <div className="app">
         <HashRouter >
            <div>
               <SimpleBreadcrumbs />
               <Menu route_list={[
                  ["/game", "策略研發"],
                  ["/strategies", "挑選股票"],
                  ["/cmoney", "實戰模擬"],
                  // ["/ai/0050", "AI"]
               ]}
                  exact_path="/" />
               <MyRoute />
            </div>
         </HashRouter>
      </div>

   )
}
ReactDOM.render(
   <App />
   ,
   document.getElementById('root')
)