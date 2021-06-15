import React, { useEffect } from 'react'
import { init, dispose } from 'klinecharts'
import generatedKLineDataList from './generatedKLineDataList'

export default function CustomCandleMarkKLineChart() {
   useEffect(() => {
      const kLineChart = init('custom-candle-mark-k-line')
      const kLineDataList = generatedKLineDataList()
      kLineChart.applyNewData(kLineDataList)
      kLineChart.createAnnotation([
         {
            point: {
               timestamp: kLineDataList[kLineDataList.length - 2].timestamp,
               price: 112
            },
            styles: {
               symbol: {
                  position: 'point',

                  type: 'circle',
                  // position: 'top',
                  size: 10,
                  color: 'yellow',
                  activeSize: 20,
                  // activeColor: '#FF9600',
                  offset: [0, 0]
               }
            }
         },
      ])
      return () => {
         dispose('custom-candle-mark-k-line')
      }
   }, [])
   return (
      <div className="k-line-chart-container" style={{ height: "440px", marginRight: 0 }}>
         <div id="custom-candle-mark-k-line" className="k-line-chart" />
      </div>
   )
}
