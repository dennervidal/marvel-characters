import React from "react";
import PropTypes from "prop-types";
import { Loading } from "components/Loading";

const LoadingPlaceholder = ({ children, loading }) => (
  <>
    {loading ? (
      <Loading id="loading-placeholder" />
    ) : (
      React.Children.map(children, (child, index) =>
        React.cloneElement(child, { id: index })
      )
    )}
  </>
);

LoadingPlaceholder.propTypes = {
  /* children component  */
  children: PropTypes.node.isRequired,
  /* boolean that represents if parent component is loading  */
  loading: PropTypes.bool.isRequired,
};

export { LoadingPlaceholder };
