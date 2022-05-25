import "../App.css";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import queries from "../queries";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

function NewPost(props) {
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [posterName, setPosterName] = useState("");
  const [posted, setPosted] = useState(undefined);
  const [uploadImage, { data, loading, error }] = useMutation(
    queries.UPLOAD_IMAGE,
    {
      onCompleted: (data) => {
        setPosted(true);
        setDescription("");
        setUrl("");
        setPosterName("");
      },
    }
  );

  const addPost = (e) => {
    e.preventDefault();
    uploadImage({
      variables: {
        url,
        description,
        posterName,
      },
    });
  };
  if (loading) {
    console.log(data);
    return "Submitting...";
  } else if (posted) {
    return (
      <div>
        <h2>Upload Image Successful</h2>
        <Link underline="always" className="showlink" to="/my-posts">
          See Your Posts!
        </Link>
      </div>
    );
  }
  if (error) return `Submission error! ${error.message}`;
  else {
    return (
      <form onSubmit={addPost}>
        <label>
          Description:
          <input
            type="text"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <br />
        <br />
        <label>
          Image URL:
          <input
            type="text"
            name="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <br />
        <br />
        <label>
          Author Name:
          <input
            type="text"
            name="posterName"
            value={posterName}
            onChange={(e) => setPosterName(e.target.value)}
          />
        </label>
        <br />
        <br />
        {/* <input type="submit" value="Submit" /> */}
        <Button type="submit" color="primary" variant="contained">
          Submit
        </Button>
      </form>
    );
  }
}

export default NewPost;
