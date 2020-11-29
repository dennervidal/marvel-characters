import React from "react";
import Typography from "@material-ui/core/Typography";
import styled from "styled-components";

const Container = styled.div`
  text-align: left;
  margin: 10px;
`;

const SubContainer = styled.div`
  background-color: #f0131e;
  tex-align: left;
`;

const TextContainer = styled.div`
  text-align: left;
  margin: 16px 0px 16px 0px;
`;

const Link = styled.a`
  text-decoration: none;
`;

const NotFound = () => (
  <Container>
    <SubContainer>
      <Typography variant="h1" color="secondary">
        404
      </Typography>
    </SubContainer>
    <br />
    <TextContainer>
      <Typography variant="h3">Ainda nada aqui, :(</Typography>
      <Typography variant="h3">talvez em breve, mas não agora</Typography>
    </TextContainer>
    <TextContainer>
      <Link href="..">Volte aqui</Link>
    </TextContainer>
  </Container>
);

export { NotFound };
