import React, { useRef, useState } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect, HashRouter } from "react-router-dom";
import { api_cmoney } from "./api"
import Kline from "./Kline"
import Game from "./Game"
import Btns from "./Btns"
import BtnsCmoney from "./BtnsCmoney"
import Menu from "./Menu"
import Test from "./Test"
import Cmoney from "./Cmoney"

import { api_bias_low, api_macd, api_good } from "./api"
function RouteStrategies() {
   return (
      <div>
         <Route path="/strategies/macd/:sid?">
            <Btns
               api={api_macd}
               title="MACD"
               route="/strategies/macd/"
            />
            <Kline />
         </Route>
         <Route path="/strategies/good/:sid?">
            <Btns
               api={api_good}
               title="績優股"
               route="/strategies/good/"
            />
            <Kline />
         </Route>
      </div>

   )
}

function RouteGames() {
   return (
      <div>
         <Route path="/game/macd/:sid?">
            <Game />
         </Route>
         {/* <Route path="/game/good/:sid?">
            <Btns
               api={api_good}
               title="績優股"
               route="/strategies/good/"
            />
            <Kline />
         </Route> */}
      </div >

   )
}

function RouteCmoney() {
   // const kLineChart = useRef()
   // const record = useRef()
   const [record, set_record] = useState()
   return (
      <div>
         <Route path="/cmoney/macd/:sid?">
            <BtnsCmoney api={api_cmoney}
               set_record={set_record}
               api_data="Macd"
               title="MACD"
               route="/cmoney/macd/" />
            <Cmoney record={record} />
         </Route>
         <Route path="/cmoney/bias_high/:sid?">
            <BtnsCmoney api={api_cmoney}
               api_data="乖離率(高，前天漲，v>0.8M)"
               title="乖離率(高，前天漲，v>0.8M)"
               route="/cmoney/bias_high/" />
            <Cmoney />
         </Route>
         <Route path="/cmoney/bias_low/:sid?">
            <BtnsCmoney api={api_cmoney}
               api_data="乖離率(低)"
               title="乖離率(低)"
               route="/cmoney/bias_low/" />
            <Cmoney />
         </Route>
      </div>

   )
}

export default function MyRoute() {

   return (
      <div>
         <Route path="/strategies">
            <Menu
               exact_path="/strategies"
               route_list={[
                  ["/strategies/macd", "macd"],
                  ["/strategies/good", "績優股"],
               ]} />
         </Route>
         <Route path="/game">
            <Menu
               exact_path="/game"
               route_list={[
                  ["/game/macd/0050", "macd"],
                  // ["/game/good", "績優股"],
               ]} />
         </Route>

         <Route path="/cmoney">
            <Menu
               exact_path="/cmoney"
               route_list={[
                  ["/cmoney/macd", "MACD"],
                  ["/cmoney/bias_high", "乖離率高"],
                  ["/cmoney/bias_low", "乖離率低"],
               ]} />
         </Route>

         <Route path="/ai/:sid">
            <Kline />
         </Route>

         <RouteStrategies />
         <RouteGames />
         <RouteCmoney />

      </div>
   )

}