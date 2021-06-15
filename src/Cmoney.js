import React, { useEffect, useState, useRef } from 'react'
import { init, dispose } from 'klinecharts'
import generatedKLineDataList from './generatedKLineDataList'
import { useParams } from "react-router-dom";
import { api_price } from "./api"
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

export default function TechnicalIndicatorKLineChart({ record }) {
   const params = useParams();
   const kLineChart = useRef()
   const paneId = "technical_indicator_pane_1"

   useEffect(() => {
      // console.log(params.sid);
      if (params.sid) {
         if (kLineChart.current) {
            api_price(params.sid)
               .then(res => {
                  // console.log(res.data);
                  kLineChart.current.applyNewData(res.data.price);
                  datalist.current = res.data.price;
                  buy_point.current = res.data.buy_point;
                  sell_point.current = res.data.sell_point;

                  if (record) {
                     mark()
                  }

               })
         } else {
            kLineChart.current = init('technical-indicator-k-line')
            api_price(params.sid)
               .then(res => {
                  console.log(res.data);
                  kLineChart.current.applyNewData(res.data.price);
                  datalist.current = res.data.price;
                  buy_point.current = res.data.buy_point;
                  sell_point.current = res.data.sell_point;

                  if (record) {
                     mark()
                  }

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

   useEffect(() => {
      if (record && kLineChart.current) {
         mark()
      }
   }, [record])

   const buy_point = useRef([]);
   const sell_point = useRef([]);
   const datalist = useRef([]);

   function mark() {
      kLineChart.current.removeAnnotation()
      let b_len = buy_point.current.length
      let s_len = sell_point.current.length
      let animation = []
      for (let i = 0; i < b_len; ++i) {
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

      if (record) {
         console.log(record[params.sid])
         let arrs = record[params.sid]
         for (let i = 0; i < arrs.length; ++i) {
            let arr = arrs[i]
            console.log(arr[0], arr[1], arr[2])
            console.log(parseFloat(arr[2]))
            console.log(new Date(arr[1] + " 8:00:00").getTime())
            // console.log(datalist.current[datalist.current.length - 20].timestamp)
            // console.log(datalist.current[datalist.current.length - 13].timestamp)
            let color = "#A5AAA3"
            if (arr[0] == "買進") color = "#FEA443"
            animation.push(
               {
                  point: {
                     timestamp: new Date(arr[1] + " 8:00:00").getTime(),
                     // timestamp: datalist.current[datalist.current.length - 13].timestamp,
                     price: parseFloat(arr[2])
                     // price: 1050
                  },
                  styles: {
                     symbol: {
                        position: 'point',
                        type: 'diamond',
                        // position: 'top',
                        size: 15,
                        color: color,
                        activeSize: 10,
                        // activeColor: '#FF9600',
                        offset: [0, 0]
                     }
                  }
               }
            )
            // console.log(animation)
         }
      }

      kLineChart.current.createAnnotation(animation)
   }


   return (
      <div className="k-line-chart-container" style={{ height: "440px" }}>
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
            {/* <button
               onClick={(_) => {
                  kLineChart.createTechnicalIndicator('EMOJI', true, {
                     id: 'candle_pane'
                  })
               }}
            >
               自定义
            </button> */}
            <span style={{ paddingRight: 10, paddingLeft: 12 }}>附圖指標</span>
            {subTechnicalIndicatorTypes.map((type) => {
               return (
                  <button
                     key={type}
                     onClick={(_) => {
                        kLineChart.current.createTechnicalIndicator(type, false, { id: paneId })
                     }}
                  >
                     {type}
                  </button>
               )
            })}
            {/* <button
               onClick={(_) => {
                  kLineChart.createTechnicalIndicator('EMOJI', false, { id: paneId })
               }}
            >
               自定义
            </button> */}
         </div>


      </div>
   )
}
