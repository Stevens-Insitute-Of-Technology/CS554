import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Link from "@mui/material/Link";
import Home from "./components/Home";
import Header from "./components/Header";
import NewPost from "./components/NewPost";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "http://localhost:4000",
  }),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Header></Header>
      <Router>
        <div className="App">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1 className="App-title">Binterest</h1>
          <Link underline="always" className="showlink" href="/my-bin">
            My Bin
          </Link>
          <Link className="showlink" href="/">
            Images
          </Link>
          <Link className="showlink" href="/my-posts">
            My Posts
          </Link>
          <Link className="showlink" href="/popularity">
            Popularity
          </Link>
          <br />
          <br />
          <div className="App-body">
            <Switch>
              <Route
                exact
                path="/"
                component={() => <Home type={"images"} />}
              />
              <Route
                exact
                path="/my-posts"
                component={() => <Home type={"my-posts"} />}
              />
              <Route
                exact
                path="/my-bin"
                component={() => <Home type={"my-bin"} />}
              />
              <Route
                exact
                path="/new-post"
                component={() => <NewPost type={"new-post"} />}
              />
              <Route
                exact
                path="/popularity"
                component={() => <Home type={"popularity"} />}
              />
            </Switch>
          </div>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
