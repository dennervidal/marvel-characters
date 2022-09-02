/* eslint no-console: 0 */
import React, { CSSProperties, ErrorInfo, ReactNode } from "react";

const style: CSSProperties = { textAlign: "center" };
const sadFaceEmoji = `:'(`;

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

// Must be class
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log("Error Catch");
    console.log(error);
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  render() {
    const { state, props } = this;

    if (state.hasError) {
      console.log("hasError");

      return (
        <div style={style}>
          <h1>{sadFaceEmoji}</h1>
          <br />
          <h1>Algum Erro Aconteceu, estamos tristes</h1>
          <a href="/">Volte aqui</a>
        </div>
      );
    }

    return props.children;
  }
}

export { ErrorBoundary };
