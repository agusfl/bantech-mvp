import React, { useState, useEffect } from "react";
import axios from "axios";

const Settings = () => {
  const [auth, getAuth] = useState(false);

  useEffect(() => {
    fetch("/me")
      .then((res) => res.json())
      .then((response) => {
        getAuth(true);
        var token = response["token"][0];
        axios.defaults.withCredentials = true;
        axios.defaults.headers.common["X-CSRFToken"] = token;
        console.log(response)
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  if (auth === false) {
    return (
      <div>
        <div className="login">
        <div className="cont">
        <h2>Your are not Authenticated</h2>
        <h2>Please Login</h2>
        <button className="button-log"
          onClick={() => {
            window.location.replace("http://localhost:5000/login");
          }}
        >
          Go to Login
        </button>
        </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Settings</h1>
      </div>
    );
  }
};

export default Settings;
