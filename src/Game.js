import React, { useEffect, useState, useRef } from 'react'
import { init, dispose } from 'klinecharts'
import generatedKLineDataList from './generatedKLineDataList'
import { useParams } from "react-router-dom";
import { api_game } from "./api"
import './app.less'


const fruits = [
   '🍏',
   '🍎',
   '🍐',
   '🍊',
   '🍋',
   '🍌',
   '🍉',
   '🍇',
   '🍓',
   '🍈',
   '🍒',
   '🍑',
   '🍍',
   '🥥',
   '🥝',
   '🥭',
   '🥑',
   '🍏'
]

// 自定义指标
const emojiTechnicalIndicator = {
   name: 'EMOJI',
   plots: [{ key: 'emoji' }],
   calcTechnicalIndicator: (kLineDataList) => {
      const result = []
      kLineDataList.forEach((kLineData) => {
         result.push({
            emoji: kLineData.close,
            text: fruits[Math.floor(Math.random() * 17)]
         })
      })
      return result
   },
   render: (
      ctx,
      { from, to, kLineDataList, technicalIndicatorDataList },
      { barSpace },
      options,
      xAxis,
      yAxis
   ) => {
      ctx.font = `${barSpace}px Helvetica Neue`
      ctx.textAlign = 'center'
      for (let i = from; i < to; i++) {
         const data = technicalIndicatorDataList[i]
         const x = xAxis.convertToPixel(i)
         const y = yAxis.convertToPixel(data.emoji)
         ctx.fillText(data.text, x, y)
      }
   }
}

const mainTechnicalIndicatorTypes = ['MA', 'EMA', 'SAR']
const subTechnicalIndicatorTypes = ['VOL', 'MACD', 'KDJ']

export default function TechnicalIndicatorKLineChart() {
   const params = useParams();
   // const [kLineChart, setKLineChart] = useState()
   const kLineChart = useRef()
   const paneId = "technical_indicator_pane_1"

   useEffect(() => {
      // console.log(params.sid);
      if (params.sid) {
         if (kLineChart.current) {
            api_game(params.sid)
               .then(res => {
                  // console.log(res.data);
                  // kLineChart.applyNewData(res.data.price);
                  datalist.current = res.data.price;
                  buy_point.current = res.data.buy_point;
                  sell_point.current = res.data.sell_point;
                  next(res.data.buy_point[0]);
                  mark()
               })
         } else {
            kLineChart.current = init('technical-indicator-k-line')
            api_game(params.sid)
               .then(res => {
                  console.log(res.data);
                  datalist.current = res.data.price;
                  buy_point.current = res.data.buy_point;
                  sell_point.current = res.data.sell_point;

                  next(res.data.buy_point[0]);
                  mark()



               })
            // 将自定义技术指标添加到图表
            kLineChart.current.addCustomTechnicalIndicator(emojiTechnicalIndicator)
            kLineChart.current.createTechnicalIndicator('VOL', false)

            kLineChart.current.setStyleOptions({
               candle: {
                  type: 'candle_down_stroke', // 蠟燭跌空心
                  bar: {
                     upColor: '#EF5350',
                     downColor: '#26A69A',
                     noChangeColor: '#888888'
                  },
                  tooltip: {
                     labels: ['時間: ', '開: ', '收: ', '高: ', '低: ', '成交量: ']
                  }
               },
               technicalIndicator: {
                  bar: {
                     upColor: '#EF5350',
                     downColor: '#26A69A',
                     noChangeColor: '#888888'
                  },
               }
            })
            // setKLineChart(kLineChart)
         }


      }
   }, [params.sid])
   // const datalist = generatedKLineDataList().slice(0, 85);
   const init_money = 1000000;
   const now_index = useRef(0);
   const buy_point = useRef([]);
   const sell_point = useRef([]);
   const datalist = useRef([]);

   // const [datalist, set_datalist] = useState();
   const [my_money, set_my_money] = useState(init_money);
   const [order_price, set_order_price] = useState(120);
   const [order_amount, set_order_amount] = useState(1);
   const [order_log, set_order_log] = useState([]);
   const [transaction_log, set_transaction_log] = useState([]);
   const [inventory, set_inventory] = useState({
      amount: 0,
      profit: 0,
      return_rate: 0,
      avg_cost: 0,
      now_price: 0,
      stock_asset: 0
   });


   function mark() {
      let b_len = buy_point.current.length
      let s_len = sell_point.current.length
      let animation = []
      for (let i = 0; i < b_len; ++i) {
         if (buy_point.current[i] + 1 < datalist.current.length) {
            animation.push(
               {
                  point: {
                     timestamp: datalist.current[buy_point.current[i] - 1].timestamp,
                     price: datalist.current[buy_point.current[i] - 1].close
                  },
                  styles: {
                     symbol: {
                        position: 'point',
                        type: 'circle',
                        // position: 'top',
                        size: 10,
                        color: 'yellow',
                        activeSize: 10,
                        // activeColor: '#FF9600',
                        offset: [0, 0]
                     }
                  }
               }
            )
         }
      }

      for (let i = 0; i < s_len; ++i) {
         if (sell_point.current[i] + 1 < datalist.current.length) {
            animation.push(
               {
                  point: {
                     timestamp: datalist.current[sell_point.current[i] - 1].timestamp,
                     price: datalist.current[sell_point.current[i] - 1].close
                  },
                  styles: {
                     symbol: {
                        position: 'point',
                        type: 'circle',
                        // position: 'top',
                        size: 10,
                        color: 'white',
                        activeSize: 10,
                        // activeColor: '#FF9600',
                        offset: [0, 0]
                     }
                  }
               }
            )
         }
      }
      kLineChart.current.createAnnotation(animation)
   }
   function backtest() {
      kLineChart.current.applyNewData(datalist.current)
   }

   function next(index) {
      if (index >= datalist.current.length) {
         alert("end");
      }
      for (var a = now_index.current; a < index; a++) {
         kLineChart.current.updateData(datalist.current[a]);
      }
      transaction();
      set_order_price(datalist.current[index - 1].close);
      now_index.current = index;
   }
   function next_buy() {
      for (let i = 0; i < buy_point.current.length; ++i) {
         if (buy_point.current[i] > now_index.current) {
            next(buy_point.current[i])
            return
         }
      }
   }
   function next_sell() {
      for (let i = 0; i < sell_point.current.length; ++i) {
         if (sell_point.current[i] > now_index.current) {
            next(sell_point.current[i])
            return
         }
      }
   }
   function next_day() {
      next(now_index.current + 1);
   }

   function transaction() {
      // console.log(DataList[now_index.current])
      let now_price = datalist.current[now_index.current].close
      set_inventory((prevState) => ({
         ...prevState,
         now_price: now_price
      }));
      let amount = 0
      let now_money = my_money
      for (let i = order_log.length - 1; i >= 0; i--) {
         let order = order_log[i]; // 注意要用let
         if (order.status !== "委託中") break;
         if (order.act === "buy") {
            if (order.price >= datalist.current[order.index].low) {
               order_log[i].status = "交易成功";
               // console.log(order);
               now_money -= order.total_price
               set_my_money((old_money) => old_money - order.total_price);
               let date = new Date(datalist.current[order.index].timestamp);
               date =
                  date.getFullYear() +
                  "/" +
                  (date.getMonth() + 1) +
                  "/" +
                  date.getDate();
               set_transaction_log((oldArray) => [
                  ...oldArray,
                  {
                     act: "buy",
                     amount: order.amount,
                     price: order.price,
                     fee: order.fee,
                     tax: order.tax,
                     total_price: "-" + order.total_price,
                     date: date
                  }
               ]);
               amount += parseInt(order.amount, 10)
            } else {
               order.status = "價格太低";
               let newArr = [...order_log]; // copying the old datas array
               newArr[i] = order; // replace e.target.value with whatever you want to change it to
               set_order_log(newArr);
            }

         }
         if (order.act === "sell") {
            if (order.price <= datalist.current[order.index].high) {
               order_log[i].status = "交易成功";
               // console.log(order);
               now_money += order.total_price
               set_my_money((old_money) => old_money + order.total_price);
               let date = new Date(datalist.current[order.index].timestamp);
               date =
                  date.getFullYear() +
                  "/" +
                  (date.getMonth() + 1) +
                  "/" +
                  date.getDate();
               set_transaction_log((oldArray) => [
                  ...oldArray,
                  {
                     act: "sell",
                     amount: order.amount,
                     price: order.price,
                     fee: order.fee,
                     tax: order.tax,
                     total_price: "+" + order.total_price,
                     date: date
                  }
               ]);
               amount -= parseInt(order.amount, 10)
            } else {
               order.status = "價格太高";
               let newArr = [...order_log]; // copying the old datas array
               newArr[i] = order; // replace e.target.value with whatever you want to change it to
               set_order_log(newArr);
            }
         }
         // console.log(transaction_log);
      }
      //庫存明細
      amount += parseInt(inventory.amount, 10);
      let profit = 0
      let avg_cost = 0
      let return_rate = 0
      let stock_asset = 0
      if (amount != 0) {
         stock_asset = datalist.current[now_index.current].close * amount * 1000;
         let fee = Math.ceil(stock_asset * 0.001425);
         let tax = Math.ceil(stock_asset * 0.003);
         stock_asset -= (fee + tax)
         profit = stock_asset - (init_money - now_money)
         avg_cost = Math.round((init_money - now_money) * 1.004425 / 1000 / amount * 100) / 100
      }
      if ((init_money - now_money) != 0)
         return_rate = Math.round(profit / (init_money - now_money) * 1000) / 10


      set_inventory((prevState) => ({
         ...prevState,
         profit: profit,
         amount: amount,
         avg_cost: avg_cost,
         return_rate: return_rate,
         stock_asset: stock_asset
      }));
   }


   function order_buy() {
      if (ValidateFloat(order_price)) {
         alert("價格請輸入正數");
         return;
      } else {
         set_order_price(parseFloat(order_price));
      }
      if (ValidateNumber(order_amount)) {
         alert("數量請輸入正整數");
         return;
      } else {
         set_order_amount(parseFloat(order_amount));
      }

      console.log(parseFloat(order_price));
      let m = 0;
      order_log.forEach((order) => {
         if (order.status === "委託中") m += order.total_price;
      });
      let total_price = order_price * order_amount * 1000;
      let fee = Math.ceil(total_price * 0.001425);
      total_price += fee;

      if (m + total_price > my_money) {
         alert("現有金錢不足，無法購買");
         return;
      }
      var date = new Date(
         datalist.current[now_index.current].timestamp - 24 * 3600 * 1000
      );
      date =
         date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
      set_order_log((oldArray) => [
         ...oldArray,
         {
            act: "buy",
            price: order_price,
            amount: order_amount,
            fee: fee,
            tax: 0,
            total_price: total_price,
            status: "委託中",
            index: now_index.current,
            date: date
         }
      ]);
   }

   function order_sell() {
      if (ValidateFloat(order_price)) {
         alert("價格請輸入正數");
         return;
      } else {
         set_order_price(parseFloat(order_price));
      }
      if (ValidateNumber(order_amount)) {
         alert("數量請輸入正整數");
         return;
      } else {
         set_order_amount(parseFloat(order_amount));
      }
      let m = 0
      order_log.forEach((order) => {
         if (order.status === "委託中") m += order.amount;
      });
      if (inventory.amount < order_amount + m) {
         alert("現有庫存不足，無法賣出");
         return;
      }

      let total_price = order_price * order_amount * 1000;
      let fee = Math.ceil(total_price * 0.001425);
      let tax = Math.ceil(total_price * 0.003);
      total_price -= fee;
      total_price -= tax;

      var date = new Date(
         datalist.current[now_index.current].timestamp - 24 * 3600 * 1000
      );
      date =
         date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
      set_order_log((oldArray) => [
         ...oldArray,
         {
            act: "sell",
            price: order_price,
            amount: order_amount,
            fee: fee,
            tax: tax,
            total_price: total_price,
            status: "委託中",
            index: now_index.current,
            date: date
         }
      ]);
   }



   function restart() {
      kLineChart.current.applyNewData([]);
      set_order_price(120);
      now_index.current = 0;
      set_order_log([]);
      set_transaction_log([]);
      set_my_money(init_money);
      next_buy()

      set_inventory({
         amount: 0,
         profit: 0,
         return: 0,
         avg_cost: 0,
         now_price: 0,
         stock_asset: 0
      });
   }

   function ValidateFloat(pnumber) {
      if (!/^\d+[.]?\d*$/.test(pnumber)) {
         return true;
      }
      return false;
   }

   function ValidateNumber(pnumber) {
      if (!/^[0-9]*[1-9][0-9]*$/.test(pnumber)) {
         return true;
      }
      return false;
   }

   function price_color(num) {
      if (num > 0) return "#FF665A"
      if (num < 0) return "#83F505"
   }

   function status_color(str) {
      if (str === "交易成功") {
         return "#FF665A"
      } else {
         return "#83F505"
      }
   }

   return (
      <div>
         <div style={{ display: "flex" }}>
            <div className="k-line-chart-container" style={{ height: "440px", width: "45%", marginRight: 0 }}>
               <a href={"https://www.cmoney.tw/finance/f00025.aspx?s=" + params.sid} target="_blank" className="k-line-chart-title">{params.sid}</a>
               <div
                  style={{ height: '300px' }}
                  id="technical-indicator-k-line"
                  className="k-line-chart"
               />
               <div className="k-line-chart-menu-container">
                  <span style={{ paddingRight: 10 }}>主圖指標</span>
                  {mainTechnicalIndicatorTypes.map((type) => {
                     return (
                        <button
                           key={type}
                           onClick={(_) => {
                              kLineChart.current.createTechnicalIndicator(type, false, {
                                 id: 'candle_pane'
                              })
                           }}
                        >
                           {type}
                        </button>
                     )
                  })}
                  <span style={{ paddingRight: 10, paddingLeft: 12 }}>附圖指標</span>
                  {subTechnicalIndicatorTypes.map((type) => {
                     return (
                        <button
                           key={type}
                           onClick={(_) => {
                              console.log(kLineChart.current._chartPane._technicalIndicatorPanes[0]._technicalIndicators[0].result)

                              kLineChart.current.createTechnicalIndicator(type, false, { id: paneId })
                           }}
                        >
                           {type}
                        </button>
                     )
                  })}
               </div>
            </div>
            <div>
               <div className="block k-line-chart-container" style={{ marginRight: 0, fontSize: 18, display: "block", color: "white" }}>
                  {/* <span style={{ fontSize: 24 }}>目前價格: </span><span style={{ fontSize: 24 }}>{inventory.now_price}</span> */}
                  {/* <br></br> */}
                  <span>價格: </span>
                  <input
                     value={order_price}
                     onChange={(e) => set_order_price(e.target.value)}
                  ></input>
                  <br></br>
                  <span>數量: </span>
                  <input
                     value={order_amount}
                     onChange={(e) => set_order_amount(e.target.value)}
                  ></input>
                  <div>
                     <div className="k-line-chart-menu-container">
                        <button
                           onClick={order_buy}
                        >買</button>
                        <button
                           onClick={order_sell}
                        >賣</button>
                     </div>

                     <div className="k-line-chart-menu-container">
                        <button
                           onClick={next_day}
                        >下一天</button>
                        <button
                           onClick={next_buy}
                        >下一個買點</button>
                        <button
                           onClick={next_sell}
                        >下一個賣點</button>
                     </div>
                     <div className="k-line-chart-menu-container">
                        <button
                           onClick={restart}
                        >重新開始</button>
                        <button
                           onClick={backtest}
                        >使用回測</button>
                     </div>
                  </div>

               </div>
               <div className="block" style={{ fontSize: 18, display: "block", color: "white" }}>
                  <span>庫存明細</span>
                  <table style={{ color: "white", fontSize: 12, width: "300px" }}>
                     <thead>
                        <tr>
                           <th>持有張數</th>
                           <th>預估損益</th>
                           <th>報酬率</th>
                           <th>平均成本</th>
                           <th>現價</th>
                        </tr>
                     </thead>
                     <tr >
                        <th>{inventory.amount}</th>
                        <th style={{ color: price_color(inventory.profit) }}>{inventory.profit}</th>
                        <th style={{ color: price_color(inventory.return_rate) }}>{inventory.return_rate}%</th>
                        <th>{inventory.avg_cost}</th>
                        <th style={{ width: "50px" }}>{inventory.now_price}</th>
                     </tr>
                  </table>
                  <span>資產</span>
                  <table style={{ color: "white", fontSize: 18 }}>
                     <tr>
                        <th scope="row">
                           {init_money}
                        </th>
                        <td>原始金額</td>

                     </tr>
                     <tr>
                        <th scope="row">{my_money - init_money < 0 ? "-" + Math.abs(init_money - my_money) : "+" + Math.abs(init_money - my_money)}</th>
                        <td>現金流</td>
                     </tr>
                     <tr>
                        <th scope="row">{"+" + inventory.stock_asset}</th>
                        <td>證券資產</td>
                     </tr>
                     <hr></hr>
                     <tr>
                        <th scope="row">{my_money + inventory.stock_asset}</th>
                     </tr>
                  </table>

               </div>
            </div>
            <div>
               <div className="block" style={{ fontSize: 18, height: "200px", display: "block", color: "white", overflow: "auto" }}>
                  <p style={{ margin: 0 }}>委託</p>
                  <table style={{ color: "white", fontSize: 12 }}>
                     <thead>
                        <tr>
                           <th>買\賣</th>
                           <th>委託量</th>
                           <th>委託價</th>
                           {/* <th>金額(含手續費)</th> */}
                           <th>狀態</th>
                           <th>時間</th>
                        </tr>
                     </thead>
                     {order_log.map((order, index) => {
                        // var date = new Date(DataList[order.index].timestamp);
                        return (
                           <tr key={order.toString() + index}>
                              <td>{order.act}</td>
                              <td>{order.amount}</td>
                              <td>{order.price}</td>
                              {/* <td>{order.total_price}</td> */}
                              <td style={{ color: status_color(order.status) }}>{order.status}</td>
                              <td>{order.date}</td>
                           </tr>
                        );
                     })}
                  </table>
               </div>
               <div className="block" style={{ fontSize: 18, height: "200px", display: "block", color: "white", overflow: "auto" }}>
                  <p style={{ margin: 0 }}>交易紀錄</p>
                  <table style={{ color: "white", fontSize: 12, overflow: "auto" }}>
                     <thead>
                        <tr>
                           <th>買\賣</th>
                           <th>張數</th>
                           <th>成交價</th>
                           <th>手續費</th>
                           <th>證交稅</th>
                           <th>收復金額</th>
                           <th>時間</th>
                        </tr>
                     </thead>
                     {transaction_log.map((order, index) => {
                        // var date = new Date(DataList[order.index].timestamp);
                        return (
                           <tr key={order.toString() + index}>
                              <td>{order.act}</td>
                              <td>{order.amount}</td>
                              <td>{order.price}</td>
                              <td>{order.fee}</td>
                              <td>{order.tax}</td>
                              <td style={{ color: price_color(order.total_price) }}>{order.total_price}</td>
                              <td>{order.date}</td>
                           </tr>
                        );
                     })}
                  </table>

               </div>
            </div>
         </div>
      </div >

   )
}
