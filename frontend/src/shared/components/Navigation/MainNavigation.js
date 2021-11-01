import React, { useState } from "react";
import { Link } from "react-router-dom";
import Backdrop from "../UIElements/Backdrop";

import MainHeader from "./MainHeader";
import "./MainNavigation.css";
import NaveLinks from "./NaveLinks";
import SideDrawer from "./SideDrawer";

const MainNavigation = () => {
  /* whatever we insert in between MainHeader tags will end up
    in MainHeader.js file coz of {props.childeren}
    */
  const [drawerIsOpen, setdrawerIsOpen] = useState(false);
  const openDrawer = () => {
    setdrawerIsOpen(true);
  };

  const closeDrawer = () => {
    setdrawerIsOpen(false);
  };
  return (
    <React.Fragment>
      {drawerIsOpen && <Backdrop onClick={closeDrawer} />}

      <SideDrawer show={drawerIsOpen} onClick={closeDrawer}>
        <nav className="main-navigation__drawer-nav">
          <NaveLinks />
        </nav>
      </SideDrawer>

      <MainHeader>
        <button className="main-navigation__menu-btn" onClick={openDrawer}>
          <span />
          <span />
          <span />
        </button>
        <h1 className="main-navigation__title">
          <Link to="/">YourPlaces</Link>
        </h1>
        <nav className="main-navigation__header-nav">
          <NaveLinks />
        </nav>
      </MainHeader>
    </React.Fragment>
  );
};

export default MainNavigation;
