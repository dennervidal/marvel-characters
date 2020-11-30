import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@material-ui/core";
import { ComicGrid, Typography, ComicImg } from "./styled";

const ComicPreview = ({ comics }) => {
  return (
    <Grid container>
      {(comics || []).map(({ thumbnail, id, title }, index) => (
        <ComicGrid item xs={6} md={4} key={`${title}--${id}`}>
          <ComicImg
            key={`${id}--image-${index}`}
            src={`${thumbnail?.path}.${thumbnail?.extension}`}
            alt="thumbnail"
            onClick={() =>
              window.open(`${thumbnail?.path}.${thumbnail?.extension}`)
            }
          />
          <Typography>{title}</Typography>
        </ComicGrid>
      ))}
    </Grid>
  );
};

ComicPreview.propTypes = {
  /** array containing comics */
  comics: PropTypes.array,
};

export { ComicPreview };
