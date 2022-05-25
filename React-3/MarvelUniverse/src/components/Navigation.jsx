import React from "react";
import { Link } from "react-router-dom";

function Navigation() {
  return (
    <div>
      <Link className="showlink" to="/characters/page/0">
        Characters
      </Link>
      <Link className="showlink" to="/comics/page/0">
        Comics
      </Link>
      <Link className="showlink" to="/series/page/0">
        Series
      </Link>
    </div>
  );
}

export default Navigation;
