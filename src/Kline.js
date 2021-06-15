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

export default function TechnicalIndicatorKLineChart() {
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
                  mark()

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
