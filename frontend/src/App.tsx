import React from "react";
import UserSignupPage from "./screen/UserSignupPage";
import * as apiCalls from "../src/api/apiCalls";

const actions = {
  postSignup: apiCalls.signup,
};

function App() {
  return (
    <div className="App">
      <UserSignupPage actions={actions} />
    </div>
  );
}

export default App;
