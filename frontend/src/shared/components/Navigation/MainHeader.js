import React from 'react'
import './MainHeader.css'

const MainHeader = props => {
    /*{props.children} is special props know by react
      refers to things you pass between opening and closing
      tags of your component
      ans this is main js file
    */
    return (
        <header className="main-header">
            {props.children}
        </header>
    )
}

export default MainHeader
