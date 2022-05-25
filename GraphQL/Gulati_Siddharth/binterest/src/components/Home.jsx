import "../App.css";
import React, { useState } from "react";
import { Button } from "@material-ui/core";
import { useQuery, useMutation } from "@apollo/client";
import queries from "../queries";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

function Home(props) {
  // Default page number is 1 according to API spec
  const [pageNum, setPageNum] = useState(1);
  let totalCount = 0;
  const type = props.type;
  let card = null;
  const {
    loading: unsplashLoading,
    error: unsplashError,
    data: unsplashData,
  } = useQuery(queries.UNSPLASH, {
    fetchPolicy: "cache-and-network",
    variables: {
      pageNum: pageNum,
    },
  });
  const {
    loading: binnedLoading,
    error: binnedError,
    data: binnedData,
  } = useQuery(queries.BINNED, {
    fetchPolicy: "cache-and-network",
  });
  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(queries.USERPOSTED, {
    fetchPolicy: "cache-and-network",
  });
  const {
    loading: popularityLoading,
    error: popularityError,
    data: popularityData,
  } = useQuery(queries.POPULARITY, {
    fetchPolicy: "cache-and-network",
  });

  const [updateImage] = useMutation(queries.UPDATE_IMAGE);
  const updateData = (image) => {
    updateImage({
      variables: {
        id: image.id,
        url: image.url,
        posterName: image.posterName,
        description: image.description,
        userPosted: image.userPosted,
        binned: !image.binned,
        numBinned: image.numBinned,
      },
    });
  };

  const [removeImage] = useMutation(queries.DELETE_IMAGE, {
    update(cache) {
      const { userPostedImages } = cache.readQuery({
        query: queries.USERPOSTED,
      });
      cache.writeQuery({
        query: queries.USERPOSTED,
        data: {
          userPostedImages: userPostedImages.filter(
            (e) => e.id === userData.userPostedImages.id
          ),
        },
      });
    },
  });

  const BinButton = (props) => {
    if (props.image.binned === true) {
      return (
        <Button
          className="buttonSpace"
          color="primary"
          variant="contained"
          startIcon={<RestoreFromTrashIcon />}
          onClick={(e) => {
            e.preventDefault();
            updateData(props.image);
          }}
        >
          Remove from bin
        </Button>
      );
    } else {
      return (
        <Button
          className="buttonSpace"
          color="primary"
          variant="contained"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.preventDefault();
            updateData(props.image);
          }}
        >
          Add to Bin
        </Button>
      );
    }
  };

  const next = async () => {
    setPageNum(pageNum + 1);
  };

  const deletePost = async (image) => {
    try {
      removeImage({
        variables: {
          id: image.id,
        },
      });
    } catch (error) {
      throw Error(error.message);
    }
  };

  const buildCard = (image) => {
    return (
      <div className="uimagebg" key={image.id}>
        <li>
          <img src={image.url} alt="unsplash" className="uimage" />
          <p>
            Description:{" "}
            {image.description && image.description.trim() !== ""
              ? image.description
              : "The image is so good that is why no description is needed"}
          </p>
          <p>Author: {image.posterName}</p>
          <div>
            {(type === "images" ||
              type === "my-bin" ||
              type === "my-posts" ||
              type === "popularity") && <BinButton image={image} />}
            {type === "my-posts" && (
              <Button
                color="primary"
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();
                  deletePost(image);
                }}
              >
                Delete Post
              </Button>
            )}
          </div>
        </li>
      </div>
    );
  };

  const returnCard = (pageType) => {
    let customCard = pageType.map((image) => {
      if (type === "popularity") {
        totalCount += image?.numBinned;
      }
      console.log('binned'+image?.numBinned);
      return buildCard(image);
    });
    return customCard;
  };

  if (typeof unsplashData == "object" && type === "images") {
    card = returnCard(unsplashData.unsplashImages);
  } else if (typeof binnedData == "object" && type === "my-bin") {
    card = returnCard(binnedData.binnedImages);
  } else if (typeof userData == "object" && type === "my-posts") {
    card = returnCard(userData.userPostedImages);
  } else if (typeof popularityData == "object" && type === "popularity") {
    card = returnCard(popularityData.getTopTenBinnedPosts);
  }
  if (unsplashLoading || binnedLoading || userLoading || popularityLoading) {
    return <div>Loading...</div>;
  } else if (card) {
    return (
      <>
        {type === "my-posts" && (
          <div>
            <Button
              color="primary"
              variant="contained"
              component={Link}
              to="/new-post"
            >
              Upload a Post
            </Button>
          </div>
        )}
        <div>
          {type === "popularity" && card.length > 0 && (
            <h2>{totalCount >= 200 ? "Mainstream" : "Non-mainstream"}</h2>
          )}
          {card}
          <br />
          <div>
            {type === "images" && (
              <Button
                disabled={card.length === 0}
                color="primary"
                variant="contained"
                onClick={next}
              >
                Get More
              </Button>
            )}
          </div>
          <br />
          {card.length === 0 && <h2>No Images</h2>}
        </div>
      </>
    );
  } else {
    return (
      <>
        {type === "images" && unsplashError && (
          <div>
            <h2>{unsplashError.message}</h2>
          </div>
        )}
        {type === "my-bin" && binnedError && (
          <div>
            <h2>{binnedError.message}</h2>
          </div>
        )}
        {type === "my-posts" && userError && (
          <div>
            <h2>{userError.message}</h2>
          </div>
        )}
        {type === "popularity" && popularityError && (
          <div>
            <h2>{popularityError.message}</h2>
          </div>
        )}
      </>
    );
  }
}

export default Home;
