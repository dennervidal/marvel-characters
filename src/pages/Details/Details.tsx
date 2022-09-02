import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { useCharacterComicsById } from "hooks/useCharacterComicsById";
import { LoadingPlaceholder } from "components/LoadingPlaceholder";
import { routes } from "routes/routes";
import { ComicPreview } from "components/ComicPreview";
import { useCharacterById } from "hooks/useCharacterById";
import { DetailImg, GridPadding } from "./styled";
import { useNavigate } from "react-router";

const Details = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    result: comics,
    error,
    loading,
  } = useCharacterComicsById({
    id,
  });
  const { result: character, loading: charLoad } = useCharacterById({
    id,
  });

  useEffect(() => {
    if (error) {
      routes.NOT_FOUND.redirect(navigate);
    }
  }, [error, navigate]);

  return (
    <Grid spacing={0} container>
      <LoadingPlaceholder loading={loading && charLoad}>
        <Grid item xs={12} md={4}>
          <DetailImg
            src={`${character?.thumbnail?.path}.${character?.thumbnail?.extension}`}
            alt="thumbnail"
          />
        </Grid>
        <GridPadding item container xs={12} md={8} spacing={1}>
          {character?.name && (
            <Grid item xs={12} md={12}>
              <Typography variant="h4">{character?.name}</Typography>
            </Grid>
          )}
          {character?.description && (
            <Grid item xs={12} md={12}>
              <div>{character?.description}</div>
            </Grid>
          )}
          <Grid item xs={12} md={12}>
            <Typography variant="h6">Comics appearance</Typography>
            <ComicPreview comics={comics} />
          </Grid>
        </GridPadding>
      </LoadingPlaceholder>
    </Grid>
  );
};

export { Details };
