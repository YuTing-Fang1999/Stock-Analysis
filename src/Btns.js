import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from "react-router-dom";
import makeStyles from '@material-ui/core/styles/makeStyles';
import { api_line_notify } from "./api"

const useStyles = makeStyles((theme) => ({
   root: {
      // high: "100px",
      // width: "100%",
      "& p": {
         boxSizing: "border-box",
         margin: 0,
         color: "white"
      },
      "& span": {
         boxSizing: "border-box",
         margin: 0,
         color: "white"
      }
   }
}));
export default function Btns({ api, title, route }) {
   const [sid, setSid] = useState([])
   const params = useParams();
   const history = useHistory();
   const classes = useStyles();

   useEffect(() => {
      api()
         .then(res => {
            console.log(res.data)
            if (res.data.sid[0]) {
               history.push(route + res.data.sid[0]);
               setSid(res.data.sid)
            }

         })
   }, []);
   function next() {
      let i = sid.findIndex(x => x === params.sid) + 1
      if (i == sid.length) {
         alert("結束")
         i = 0
      }
      history.push(route + sid[i]);
   }
   function pre() {
      let i = sid.findIndex(x => x === params.sid) - 1
      if (i < 0) i = sid.length - 1
      history.push(route + sid[i]);
   }

   function line_notify() {
      api_line_notify({ "method": title, "sid": sid })
         .then(res => {
            console.log(res);
         })
   }

   return (
      <div style={{ position: "relative" }} className={`k-line-chart-container ${classes.root}`}>
         <div>
            <p>{title}</p>
            <div style={{ flexWrap: "wrap" }} className="k-line-chart-menu-container">
               {
                  sid.map(s => {
                     return <button style={{ marginBottom: 10 }} key={title + s} onClick={() => history.push(route + s)}>{s}</button>
                  })
               }

            </div>
            <div className="k-line-chart-menu-container">
               <button onClick={pre}>上一個</button>
               <button onClick={next}>下一個</button>
            </div>
         </div>
         <div style={{ top: 0, right: 0, position: "absolute" }} className="k-line-chart-menu-container">
            <button onClick={line_notify}>Line Notify</button>
         </div>
      </div >
   )
}