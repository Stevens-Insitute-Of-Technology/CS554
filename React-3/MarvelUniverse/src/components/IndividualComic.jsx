import React, { useState, useEffect } from "react";
import "../App.css";
import axios from "axios";
import { ts, publickey, hash, baseUrl } from "../middlewares/marvelApiUrl";
import { Figure, Container, Row } from "react-bootstrap";
import NOIMAGE from "../imgs/no-image.jpg";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Fallback from "./Fallback";

const IndividualComic = (props) => {
  const [showdata, setShowData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [errorCode, setErrorCode] = useState(undefined);

  let card = null;
  let { id } = useParams();

  useEffect(() => {
    console.log("on load useeffect");
    async function fetchIndividualData() {
      try {
        setLoading(true);
        const {
          data: { data },
        } = await axios.get(
          `${baseUrl}/comics/${id}?ts=${ts}&apikey=${publickey}&hash=${hash}`
        );
        setShowData(data.results);
        setLoading(false);
      } catch (error) {
        console.log(error.message);
        if (error.response.status === 404 || error.response.status === 500) {
          setFallback(true);
          setErrorCode(error.response.status);
        }
      }
    }
    fetchIndividualData();
  }, [props.type, id]);

  const buildCard = (data) => {
    let id = data.series.resourceURI.split("/");
    data.series.id = id[id.length - 1];
    return (
      <div>
        <Container>
          <Row>
            <Figure>
              <Figure.Image
                alt={`${data.name} image`}
                src={`${data.thumbnail.path}/portrait_xlarge.jpg`}
                onError={(e) => (
                  (e.target.onerror = null), (e.target.src = NOIMAGE)
                )}
              />
              <Figure.Caption>Name: {data.name}</Figure.Caption>
              <Figure.Caption>Description: {data.description}</Figure.Caption>
            </Figure>
          </Row>
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Series</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link to={`/series/${data.series.id}`}>
                    {data.series.name}
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </Container>
      </div>
    );
  };

  if (showdata) {
    card =
      showdata &&
      showdata.map((data) => {
        return buildCard(data);
      });
  }
  if (fallback) {
    return (
      <div>
        <Fallback errorCode={errorCode} />
      </div>
    );
  }
  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else {
    return <div>{card}</div>;
  }
};

export default IndividualComic;
