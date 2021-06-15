/* eslint-disable no-nested-ternary */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Route } from 'react-router';
import { Link as RouterLink, HashRouter } from 'react-router-dom';

const breadcrumbNameMap = {
   '/strategies': '選股',
   '/strategies/macd': 'MACD',
   '/strategies/good': '績優股',
   '/game': "策略研發",
   '/game/macd': "MACD",
   '/cmoney': "CMONEY",
   '/cmoney/macd': "MACD",
   '/cmoney/bias_high': "乖離率高",
   '/cmoney/bias_low': "乖離率低",

};

const useStyles = makeStyles((theme) => ({
   root: {
      display: 'flex',
      flexDirection: 'column',
      // width: 360,
      // display: flex;
      // flexDirection: 'row',
      // justifyContent: 'center',
      // flexWrap: 'wrap',
      // padding: '15px'
   },
   lists: {
      backgroundColor: theme.palette.background.paper,
      marginTop: theme.spacing(1),
   },
   nested: {
      paddingLeft: theme.spacing(4),
   },
   link: {
      "& a": {
         color: "#FFF",
         "&:hover": {
            color: "#FAF67D"
         }
      },
      "& li": {
         color: "#FFF"
      },
   },
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
}));

const LinkRouter = (props) => <Link {...props} component={RouterLink} />;

export default function RouterBreadcrumbs() {
   const classes = useStyles();
   function isNumber(val) {
      // negative or positive
      return /^[-]?[\.\d]+$/.test(val);
   }


   return (
      // <HashRouter>
      <div className={classes.root}>
         <Route>
            {({ location }) => {
               const pathnames = location.pathname.split('/').filter((x) => x);

               return (
                  <Breadcrumbs className={classes.link} aria-label="breadcrumb">
                     <LinkRouter to="/">
                        Home
                     </LinkRouter>
                     {pathnames.map((value, index) => {
                        let last = index === pathnames.length - 1;
                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                        if (!last) {
                           if (isNumber(pathnames[index + 1])) last = true
                        }
                        return (breadcrumbNameMap[to]) && (last ? (
                           <Typography key={to}>
                              {breadcrumbNameMap[to]}
                           </Typography>
                        ) : (
                           <LinkRouter className={classes.link} to={to} key={to}>
                              {breadcrumbNameMap[to]}
                           </LinkRouter>
                        ));
                     })}
                  </Breadcrumbs>
               );
            }}
         </Route>
      </div>
      // </HashRouter>
   );
}
