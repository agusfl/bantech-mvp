import React, { useState, useEffect } from "react";
import axios from "axios";
import Styles from "./styles/Styles";
import { Form, Field } from "react-final-form";
import { ThreeDots } from "react-loader-spinner";
import "./styles/accounts.css";

const Accounts = () => {
  const [links, getLinks] = useState([]);
  const [auth, getAuth] = useState(false);
  const [isActive, getIsActive] = useState(false);

  useEffect(() => {
    fetch("/me")
      .then((res) => res.json())
      .then((response) => {
        getAuth(true);
        var token = response["token"][0];
        axios.defaults.withCredentials = true;
        axios.defaults.headers.common["X-CSRFToken"] = token;
      })
      .catch((error) => {
        console.log("AAAAAAAA", error);
      });
  }, []);

  useEffect(() => {
    fetch("/links")
      .then((res) => res.json())
      .then((response) => {
        getLinks(response);
      });
  }, []);

  async function del_link(id) {
    const response = await axios.post("/del_link", {
      id: id[0],
    });

    if (response) {
      fetch("/links")
          .then((res) => res.json())
          .then((response) => {
            getLinks(response);
          });
    }
  }
  console.log(links);
  const link_click = async () => {
    let val = document.getElementsByName("bank")[0].value;
    if (val === "Bandes") {
      let username = document.getElementsByName("username")[0].value;
      let password = document.getElementsByName("password")[0].value;
      let description = document.getElementsByName("description")[1].value;

      getIsActive(true);

      const response = await axios.post("/link_bandes", {
        username: username,
        password: password,
        description: description,
      });
      if (response) {
        fetch("/links")
          .then((res) => res.json())
          .then((response) => {
            getLinks(response);
          });
        getIsActive(false);
      }
      console.log("Created a Bandes Link", response);
    }
    if (val === "BBVA") {
      let username = document.getElementsByName("username")[0].value;
      let password = document.getElementsByName("password")[0].value;
      let document_number = document.getElementsByName("document_number")[0]
        .value;

      getIsActive(true);

      const response = await axios.post("/link_bbva", {
        username: username,
        password: password,
        document_number: document_number,
      });
      if (response) {
        fetch("/links")
          .then((res) => res.json())
          .then((response) => {
            getLinks(response);
          });
        getIsActive(false);
      }
      console.log("Created a BBVA Link", response);
    }
    if (val === "BROU") {
      let username = document.getElementsByName("username")[0].value;
      let password = document.getElementsByName("password")[0].value;

      getIsActive(true);

      const response = await axios.post("/link_brou", {
        username: username,
        password: password,
      });
      if (response) {
        fetch("/links")
          .then((res) => res.json())
          .then((response) => {
            getLinks(response);
          });

        getIsActive(false);
      }
      console.log("Created a BROU Link", response);
    }
    if (val === "Heritage") {
      let username = document.getElementsByName("username")[0].value;
      let password = document.getElementsByName("password")[0].value;
      let security_question = document.getElementsByName("security_question")[0]
        .value;
      let security_answer = document.getElementsByName("security_answer")[0]
        .value;

      getIsActive(true);

      const response = await axios.post("/link_heritage", {
        username: username,
        password: password,
        security_question: security_question,
        security_answer: security_answer,
      });
      if (response) {
        fetch("/links")
          .then((res) => res.json())
          .then((response) => {
            getLinks(response);
          });
        getIsActive(false);
      }
      console.log("Created a Heritage Link", response);
    }
    if (val === "Itau") {
      let username = document.getElementsByName("username")[0].value;
      let password = document.getElementsByName("password")[0].value;
      let fiscal_number = document.getElementsByName("fiscal_number")[0].value;

      getIsActive(true)
  
      const response = await axios.post("/link_itau", {
        username: username,
        password: password,
        fiscal_number: fiscal_number,
      });
      if (response) {
        fetch("/links")
          .then((res) => res.json())
          .then((response) => {
            getLinks(response);
          });

        getIsActive(false);
      }
      console.log("Created a Itau Link", response);
    }
    if (val === "Santander") {
      let username = document.getElementsByName("username")[0].value;
      let password = document.getElementsByName("password")[0].value;

      getIsActive(true);

      const response = await axios.post(
        "/link_santander",
        { username: username, password: password }
      );
      if (response) {
        fetch("/links")
          .then((res) => res.json())
          .then((response) => {
            getLinks(response);
          });
        getIsActive(false);
      }
      console.log("Created a Santander Link", response);
    }
    if (val === "Scotiabank") {
      let username = document.getElementsByName("username")[0].value;
      let password = document.getElementsByName("password")[0].value;
      let digital_pin = document.getElementsByName("digital_pin")[0].value;
      let description = document.getElementsByName("description")[1].value;

      getIsActive(true)
    
      const response = await axios.post(
        "/link_scotiabank",
        {
          username: username,
          password: password,
          digital_pin: digital_pin,
          description: description,
        }
      );
      if (response) {
        fetch("/links")
          .then((res) => res.json())
          .then((response) => {
            getLinks(response);
          });
        getIsActive(false);
      }
      console.log("Created a Scotiabank Link", response);
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onSubmit = async (values) => {
    await sleep(300);
    window.alert(JSON.stringify(values, 0, 2));
  };

  const Error = ({ name }) => (
    <Field name={name} subscription={{ error: true, touched: true }}>
      {({ meta: { error, touched } }) =>
        error && touched ? <span>{error}</span> : null
      }
    </Field>
  );

  const Condition = ({ when, is, children }) => (
    <Field name={when} subscription={{ value: true }}>
      {({ input: { value } }) => (value === is ? children : null)}
    </Field>
  );
  if (auth === false) {
    return (
      <div>
        <div className="login">
        <div className="cont">
        <h2>Your are not Authenticated</h2>
        <h2>Please Login</h2>
        <button className="button-log"
          onClick={() => {
            window.location.replace("http://localhost:5000/login/login");
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
      <div className="all-content">
        <div className="formulario">
          <Styles>
            <h1>Link your Bank Account</h1>
            <Form
              name="bank_form"
              onSubmit={onSubmit}
              validate={(values) => {
                const errors = {};
                if (!values.bank) {
                  errors.bank = "Required";
                }
                if (!values.username) {
                  errors.username = "Required";
                }
                if (!values.password) {
                  errors.password = "Required";
                }
                if (!values.description) {
                  errors.description = "Required";
                }
                if (!values.document) {
                  errors.document = "Required";
                }
                if (!values.security_question) {
                  errors.security_question = "Required";
                }
                if (!values.security_answer) {
                  errors.security_answer = "Required";
                }
                if (!values.fiscal_number) {
                  errors.fiscal_number = "Required";
                }
                if (!values.digital_pin) {
                  errors.digital_pin = "Required";
                }
                return errors;
              }}
            >
              {({ handleSubmit, form, submitting, pristine, values }) => (
                <form onSubmit={handleSubmit}>
                  <div>
                    <label>Select your Bank</label>
                    <Field name="bank" component="select">
                      <option value="" disabled selected>
                        Select your Bank
                      </option>
                      <option id="bandes" value="Bandes">
                        Bandes
                      </option>
                      <option id="bbva" value="BBVA">
                        BBVA
                      </option>
                      <option id="bbva" value="BROU">
                        BROU
                      </option>
                      <option id="bbva" value="Heritage">
                        Heritage
                      </option>
                      <option id="bbva" value="Itau">
                        Itau
                      </option>
                      <option id="bbva" value="Santander">
                        Santander
                      </option>
                      <option id="bbva" value="Scotiabank">
                        Scotiabank
                      </option>
                    </Field>
                    <Error name="bank" />
                  </div>
                  <Condition when="bank" is="Bandes">
                    <div>
                      <label>Username</label>
                      <Field
                        name="username"
                        component="input"
                        type="text"
                        placeholder="Bank Username"
                      />
                      <Error name="username" />
                    </div>
                    <div>
                      <label>Password</label>
                      <Field
                        name="password"
                        component="input"
                        type="password"
                        placeholder="Bank Password"
                      />
                      <Error name="password" />
                    </div>
                    <div>
                      <label>Description</label>
                      <Field
                        name="description"
                        component="input"
                        type="text"
                        placeholder="Link Description"
                      />
                      <Error name="description" />
                    </div>
                  </Condition>

                  <Condition when="bank" is="BBVA">
                    <div>
                      <label>Username</label>
                      <Field
                        name="username"
                        component="input"
                        type="text"
                        placeholder="Bank Username"
                      />
                      <Error name="username" />
                    </div>
                    <div>
                      <label>Password</label>
                      <Field
                        name="password"
                        component="input"
                        type="password"
                        placeholder="Bank Password"
                      />
                      <Error name="password" />
                    </div>
                    <div>
                      <label>Document</label>
                      <Field
                        name="document_number"
                        component="input"
                        type="text"
                        placeholder="User Document"
                      />
                      <Error name="document" />
                    </div>
                  </Condition>

                  <Condition when="bank" is="BROU">
                    <div>
                      <label>Username</label>
                      <Field
                        name="username"
                        component="input"
                        type="text"
                        placeholder="Bank Username"
                      />
                      <Error name="username" />
                    </div>
                    <div>
                      <label>Password</label>
                      <Field
                        name="password"
                        component="input"
                        type="password"
                        placeholder="Bank Password"
                      />
                      <Error name="password" />
                    </div>
                  </Condition>

                  <Condition when="bank" is="Heritage">
                    <div>
                      <label>Username</label>
                      <Field
                        name="username"
                        component="input"
                        type="text"
                        placeholder="Bank Username"
                      />
                      <Error name="username" />
                    </div>
                    <div>
                      <label>Password</label>
                      <Field
                        name="password"
                        component="input"
                        type="password"
                        placeholder="Bank Password"
                      />
                      <Error name="password" />
                    </div>
                    <div>
                      <label>Security Question</label>
                      <Field
                        name="security_question"
                        component="input"
                        type="text"
                        placeholder="Bank Security Question"
                      />
                      <Error name="security_question" />
                    </div>
                    <div>
                      <label>Security Answer</label>
                      <Field
                        name="security_answer"
                        component="input"
                        type="text"
                        placeholder="Bank Security Answer"
                      />
                      <Error name="security_answer" />
                    </div>
                  </Condition>

                  <Condition when="bank" is="Itau">
                    <div>
                      <label>Username</label>
                      <Field
                        name="username"
                        component="input"
                        type="text"
                        placeholder="Bank Username"
                      />
                      <Error name="username" />
                    </div>
                    <div>
                      <label>Password</label>
                      <Field
                        name="password"
                        component="input"
                        type="password"
                        placeholder="Bank Password"
                      />
                      <Error name="password" />
                    </div>
                    <div>
                      <label>Fiscal Number</label>
                      <Field
                        name="fiscal_number"
                        component="input"
                        type="text"
                        placeholder="Fiscal Document"
                      />
                      <Error name="fiscal_number" />
                    </div>
                  </Condition>

                  <Condition when="bank" is="Santander">
                    <div>
                      <label>Username</label>
                      <Field
                        name="username"
                        component="input"
                        type="text"
                        placeholder="Bank Username"
                      />
                      <Error name="username" />
                    </div>
                    <div>
                      <label>Password</label>
                      <Field
                        name="password"
                        component="input"
                        type="password"
                        placeholder="Bank Password"
                      />
                      <Error name="password" />
                    </div>
                  </Condition>

                  <Condition when="bank" is="Scotiabank">
                    <div>
                      <label>Username</label>
                      <Field
                        name="username"
                        component="input"
                        type="text"
                        placeholder="Bank Username"
                      />
                      <Error name="username" />
                    </div>
                    <div>
                      <label>Password</label>
                      <Field
                        name="password"
                        component="input"
                        type="password"
                        placeholder="Bank Password"
                      />
                      <Error name="password" />
                    </div>
                    <div>
                      <label>Digital PIN</label>
                      <Field
                        name="digital_pin"
                        component="input"
                        type="text"
                        placeholder="Bank Digital PIN"
                      />
                      <Error name="digital_pin" />
                    </div>
                    <div>
                      <label>Description</label>
                      <Field
                        name="description"
                        component="input"
                        type="text"
                        placeholder="Link Description"
                      />
                      <Error name="description" />
                    </div>
                  </Condition>

                  <div className="form-buttons">
                    <button
                      className="button-sub"
                      type="submit"
                      onClick={link_click}
                    >
                      Link Account
                    </button>
                    <button
                      className="button-res"
                      type="button"
                      onClick={form.reset}
                      disabled={submitting}
                    >
                      Reset Form
                    </button>
                  </div>
                </form>
              )}
            </Form>
          </Styles>
          <div id="loader" className={isActive ? "loader-on" : "loader-off"}>
            <h4>Linking Account...</h4>
            <div className="three">
              <ThreeDots
                height="80"
                width="80"
                radius="9"
                color="#ffffff"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
              />
            </div>
          </div>
        </div>
        <div className="bank-container">
          <div className="banks">
            <h4>Linked Bank Accounts</h4>
            <tbody>
              {links.length > 0
                ? links.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item[1]}</td>
                      <td>
                        <button
                          className="button-del"
                          onClick={() => del_link(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                : console.log("a", links.length)}
            </tbody>
          </div>
        </div>
      </div>
    );
  }
};

export default Accounts;
