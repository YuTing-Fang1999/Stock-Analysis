import React from 'react'
import MenuBtn from './MenuBtn'
import { makeStyles } from '@material-ui/core/styles'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import Box from '@material-ui/core/Box'
import { BrowserRouter as Router, Route, Link, Redirect, HashRouter } from "react-router-dom";

const useStyles = makeStyles({
   gridList: {
      width: 350
   },
})

export default function Menu({ route_list, exact_path }) {
   const classes = useStyles()
   // const route_list = [
   //    ["/kline/0050", "策略"],
   //    ["/game/0050", "game"],
   //    ["/cmoney/0050", "cmoney"]
   // ]
   return (
      <Box
         display="flex"
         width="100%"
      // paddingTop={10}
      // bgcolor="lightblue"
      ><Box m="auto">
            <GridList align="center" cellHeight="auto" className={classes.gridList} cols={1}>
               <GridListTile key="aa" row={1}>
                  <Route exact path={exact_path}>
                     {route_list.map((route) => (
                        <Link key={route.toString()} to={route[0]} style={{ textDecoration: 'none' }}>
                           <MenuBtn text={route[1]} />
                        </Link>
                     ))}
                  </Route>
               </GridListTile>
            </GridList>
         </Box></Box>


   )
}

