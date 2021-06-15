import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles({
  root: {
    background: '#2196F3',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 1px 3px 1px rgba(51, 51, 51, 0.5)',
    color: 'white',
    height: 48,
    width: 300,
    padding: '0 30px',
    transition: 'all 0.4s ease-out',
    margin: '10px',
    textDecoration: "none",
    '&:hover': {
      background: '#2196F3',
      transform: 'scale(1.05,1.05)',
      boxShadow: '0 3px 15px 3px rgba(51, 51, 51, 0.5)'
    }
  }
})

export default function MenuBtn({ text }) {
  const classes = useStyles()
  return <Button className={classes.root}>{text}</Button>
}
