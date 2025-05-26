/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./Redux/Store";

const Demo = (props: any): JSX.Element => {
  return (
    <div className="main">
      <Provider store={store}>
        <App spfxContext={props.context} />
      </Provider>
    </div>
  );
};

export default Demo;
