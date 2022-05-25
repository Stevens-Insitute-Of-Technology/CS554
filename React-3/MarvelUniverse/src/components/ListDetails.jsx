import React, { useState, useEffect } from "react";
import "../App.css";
import axios from "axios";
import {
  characterUrl,
  comicsUrl,
  seriesUrl,
} from "../middlewares/marvelApiUrl";
import { useHistory } from "react-router-dom";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import NOIMAGE from "../imgs/no-image.jpg";
import { useParams } from "react-router-dom";
import Fallback from "./Fallback";
import Search from "./Search";

const ListDetails = (props) => {
  const [listData, setListData] = useState(undefined);
  const [pagesDetails, setPagesDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [previousDisable, setPreviousDisable] = useState(false);
  const [nextDisable, setNextDisable] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [errorCode, setErrorCode] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(undefined);
  const [hideButton, setHideButton] = useState(false);
  const history = useHistory();
  let card = null;
  let { page } = useParams();
  page = parseInt(page);

  useEffect(() => {
    if (isNaN(page)) {
      setErrorCode(404);
      setFallback(true);
    }
    let offset = page * 20;
    if (page < 0) {
      setErrorCode(404);
      setFallback(true);
      return;
    }
    if (page === 0) {
      setPreviousDisable(true);
      setNextDisable(false);
      setFallback(false);
    }
    if (page + 1 === pagesDetails.totalPages) {
      setNextDisable(true);
    }
    async function fetchListData(url) {
      try {
        setLoading(true);
        const {
          data: { data },
        } = await axios.get(`${url}&offset=${offset}&limit=20`);
        if (data.results && data.results.length > 0) {
          setListData(data.results);
        }
        if (data.results && data.results.length === 0) {
          setErrorCode(404);
          setFallback(true);
        }
        let details = {
          totalCount: data.total,
          totalPages: Math.ceil(data.total / 20),
        };
        setPagesDetails((pagesDetails) => ({
          ...pagesDetails,
          ...details,
        }));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error.message);
        if (error.response.status === 404 || error.response.status === 500) {
          setFallback(true);
          setErrorCode(error.response.status);
        }
      }
    }
    async function setData() {
      if (props.type === "characters") {
        await fetchListData(characterUrl);
      } else if (props.type === "comics") {
        await fetchListData(comicsUrl);
      } else if (props.type === "series") {
        await fetchListData(seriesUrl);
      }
    }
    setData();
  }, [page, props.type, pagesDetails.totalPages]);

  useEffect(() => {
    console.log("search useEffect fired");
    setHideButton(false);
    async function fetchListData(url) {
      try {
        const {
          data: { data },
        } = await axios.get(`${url}`);
        if (data.results && data.results.length > 0) {
          setSearchData(data.results);
        }
        setLoading(false);
        setHideButton(true);
      } catch (error) {
        setLoading(false);
        console.log(error.message);
        setHideButton(false);
      }
    }
    async function setData() {
      if (props.type === "characters") {
        await fetchListData(`${characterUrl}&nameStartsWith=${searchTerm}`);
      } else if (props.type === "comics") {
        await fetchListData(`${comicsUrl}&titleStartsWith=${searchTerm}`);
      } else if (props.type === "series") {
        await fetchListData(`${seriesUrl}&titleStartsWith=${searchTerm}`);
      }
    }
    if (searchTerm) {
      console.log("searchTerm is set");
      setData();
    }
  }, [searchTerm, props.type]);

  const searchValue = async (value) => {
    setSearchTerm(value);
  };

  const openCharacter = (id) => {
    console.log("prop " + props.type);
    const path = `/${props.type}/${id}`;
    history.push(path);
  };

  const nextPage = () => {
    if (page + 1 === pagesDetails.totalPages) {
      setNextDisable(true);
      return;
    }
    let path = `/${props.type}/page/${page + 1}`;
    setPreviousDisable(false);
    history.push(path);
  };

  const prevPage = () => {
    if (page === 0) {
      setPreviousDisable(true);
      return;
    }
    let path = `/${props.type}/page/${page - 1}`;
    history.push(path);
  };

  const buildCard = (data) => {
    return (
      <Card style={{ width: "18rem" }} key={data.id}>
        <Card.Img
          variant="top"
          alt={`${data.name} image`}
          src={`${data.thumbnail.path}/portrait_xlarge.jpg`}
          onError={(e) => (e.target.onerror = null)((e.target.src = NOIMAGE))}
        />
        <Card.Body>
          <Card.Title>{data.name}</Card.Title>
          <Card.Text>
            {data.title !== "" || data.title === undefined
              ? data.title
              : data.description !== "" || data.description === undefined
              ? data.description
              : `This doesn't need any introduction `}
          </Card.Text>
          <Button onClick={() => openCharacter(data.id)} variant="primary">
            Show {props.type}
          </Button>
        </Card.Body>
      </Card>
    );
  };
  if (searchTerm) {
    console.log(searchData);
    card =
      searchData &&
      searchData.map((data) => {
        return buildCard(data);
      });
  } else if (listData && listData.length > 0) {
    console.log(listData);
    card =
      listData &&
      listData.map((data) => {
        return buildCard(data);
      });
  }
  if (listData && listData.length === 0) {
    setFallback(true);
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
    return (
      <>
        <div>
          <h2>{props.type.toUpperCase()}</h2>
        </div>
        <Container>
          <Row>
            <Search searchValue={searchValue} type={props.type} />
          </Row>
          <br></br>
          {!hideButton && (
            <Row className="row justify-content-center">
              <Col md="auto">
                <Button
                  variant="danger"
                  disabled={previousDisable}
                  onClick={() => prevPage()}
                >
                  Previous
                </Button>
              </Col>
              <Col md="auto">
                <Button
                  variant="danger"
                  disabled={nextDisable}
                  onClick={() => nextPage()}
                >
                  Next
                </Button>
              </Col>
            </Row>
          )}
          <br></br>
          <Row className="mx-auto">{card}</Row>
        </Container>
      </>
    );
  }
};

export default ListDetails;
