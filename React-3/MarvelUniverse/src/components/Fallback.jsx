import "../App.css";

function Fallback(props) {
  return (
    <div>
      <h2>ERROR {props.errorCode}</h2>
      {!props.pageNotFound && (
        <h2>OOPS! You are out of Awesomeness</h2>
      )}
      {props.pageNotFound && (
        <h2>Page Not Found</h2>
      )}
    </div>
  );
}

export default Fallback;
