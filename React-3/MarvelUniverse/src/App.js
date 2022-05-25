import React from "react";
import "./App.css";
import logo from "./imgs/logo.png";
import ListDetails from "./components/ListDetails";
import IndividualCharacter from "./components/IndividualCharacter";
import IndividualComic from "./components/IndividualComic";
import IndividualSeries from "./components/IndividualSeries";
import Navigation from "./components/Navigation";
import Fallback from "./components/Fallback";
import { Link, Switch, Route, BrowserRouter as Router } from "react-router-dom";
import ThemeProvider from "react-bootstrap/ThemeProvider";

function App() {
  return (
    <ThemeProvider
      breakpoints={["xxxl", "xxl", "xl", "lg", "md", "sm", "xs", "xxs"]}
    >
      <Router>
        <div className="App">
          <img src={logo} alt="logo" />
          <h1 className="App-title">Welcome to the Marvel Universe</h1>
          <Link className="showlink" to="/">
            Home
          </Link>
          <br />
          <br />
          <div className="App-body">
            <Switch>
              <Route exact path="/" component={Navigation} />
              <Route
                exact
                path="/characters/page/:page"
                component={() => <ListDetails type={"characters"} />}
              />
              <Route exact path="/comics/page/:page">
                <ListDetails type={"comics"} />
              </Route>
              <Route exact path="/series/page/:page">
                <ListDetails type={"series"} />
              </Route>
              <Route
                exact
                path="/characters/:id"
                component={() => <IndividualCharacter type={"characters"} />}
              />
              <Route exact path="/comics/:id">
                <IndividualComic type={"comics"} />
              </Route>
              <Route exact path="/series/:id">
                <IndividualSeries type={"series"} />
              </Route>
              <Route path="*">
                <Fallback errorCode={404} pageNotFound={true} />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
