import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from "react-router-dom";
import makeStyles from '@material-ui/core/styles/makeStyles';

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
export default function Btns({ api, api_data, title, route, set_record }) {
   const [sid, setSid] = useState([])
   const params = useParams();
   const history = useHistory();
   const classes = useStyles();
   const data = useRef();
   const key = useRef("inventory")

   useEffect(() => {
      api(api_data)
         .then(res => {
            console.log(res.data)
            if (res.data.inventory_sid[0]) {
               history.push(route + res.data.inventory_sid[0]);
               setSid(res.data.inventory_sid)
               data.current = res.data
               set_record(res.data.record)
               // console.log(record)
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

   function inventory() {
      setSid(data.current.inventory_sid)
      history.push(route + data.current.inventory_sid[0]);
      key.current = "inventory"
   }

   function record() {
      setSid(data.current.record_sid)
      history.push(route + data.current.record_sid[0]);
      key.current = "record"
   }


   return (
      <div style={{ position: "relative" }} className={`k-line-chart-container ${classes.root}`}>
         <div>
            <p>{title}</p>
            <div style={{ flexWrap: "wrap" }} className="k-line-chart-menu-container">
               {
                  sid.map(s => {
                     return <button style={{ marginBottom: 10 }} key={key.current + s} onClick={() => history.push(route + s)}>{s}</button>
                  })
               }
            </div>
            <div className="k-line-chart-menu-container">
               <button onClick={pre}>上一個</button>
               <button onClick={next}>下一個</button>
            </div>
            <div style={{ top: 0, right: 0, position: "absolute" }} className="k-line-chart-menu-container">
               <button onClick={inventory}>庫存</button>
               <button onClick={record}>歷史紀錄</button>
            </div>
         </div>
      </div >
   )
}