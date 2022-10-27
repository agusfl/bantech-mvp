import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import "./styles/dashboard.css";
import axios from "axios";

const Dashboard = () => {
  const [quotes, getQuotes] = useState([]);
  const [quotesList, set_list] = useState([]);
  const [transactions, getTransactions] = useState([]);
  const [total_balance, getTotalBalance] = useState([]);
  const [bank_balance, getBankBalance] = useState([]);
  const [auth, getAuth] = useState(false);
  const [name, getName] = useState([]);

  ChartJS.register(ArcElement, Tooltip, Legend);
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  //Si no esta auth redirije
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
        console.log(error);
      });
  }, []);

  useEffect(() => {
    fetch("/me")
      .then((res) => res.json())
      .then((response) => {
        getName(response["fullname"]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    fetch("https://cotizaciones-brou.herokuapp.com/api/currency/latest")
      .then((res) => res.json())
      .then((response) => {
        getQuotes(response);

        let obj1 = quotes.rates;
        const list = [];

        for (let [key, value] of Object.entries(obj1)) {
          list.push({ key, value });
        }

        set_list(list);
      });
  }, [quotes.rates]);

  useEffect(() => {
    fetch("/transactions")
      .then((res) => res.json())
      .then((response) => {
        getTransactions(response);
      });
  }, []);

  useEffect(() => {
    fetch("/total_balance")
      .then((res) => res.json())
      .then((response) => {
        getTotalBalance(response);
      });
  }, []);

  useEffect(() => {
    fetch("/balance_per_bank")
      .then((res) => res.json())
      .then((response) => {
        getBankBalance(response);
      });
  }, []);

  let bandes_balance = bank_balance["BANDES"];
  let bbva_balance = bank_balance["BBVA"];
  let brou_balance = bank_balance["BROU"];
  let heritage_balance = bank_balance["HERITAGE"];
  let itau_balance = bank_balance["ITAU"];
  let santander_balance = bank_balance["SANTANDER"];
  let scotia_balance = bank_balance["SCOTIABANK"];

  const data1 = {
    labels: [
      "Bandes",
      "BBVA",
      "BROU",
      "Heritage",
      "Itau",
      "Santander",
      "Scotiabank",
    ],
    datasets: [
      {
        data: [
          bandes_balance,
          bbva_balance,
          brou_balance,
          heritage_balance,
          itau_balance,
          santander_balance,
          scotia_balance,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(225, 225, 225, 0.5)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 206, 86)",
          "rgb(75, 192, 192)",
          "rgb(153, 102, 255)",
          "rgb(255, 159, 64)",
          "rgb(225, 225, 225)",
        ],
        borderWidth: 3,
      },
    ],
  };

  const options1 = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 10,
          color: "white",
          boxWidth: 36,
          boxHeight: 18,
          font: {
            size: 18,
          },
        },
      },
    },
  };

// LegendMarginRight plugin
// const LegendMarginRight = {
//   id: 'legendMarginRight',
//   afterInit(chart, args, options) {
//     console.log(chart.legend.fit)
//     const fitValue = chart.legend.fit;
//     chart.legend.fit = function fit() {
//       fitValue.bind(chart.legend)();
//       let width = this.width = 100;
//       return width;
//     }
//   }
// }

  const options = {
    // plugins: [LegendMarginRight],
    scales: {
      y: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.3)",
        },
      },
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0)",
        },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        align: 'start',
        position: "right",
        labels: {
          padding: 35,
          color: "white",
          boxWidth: 36,
          boxHeight: 18,
          font: {
            size: 18,
          },
        },
      },
    },
  };

  const labels = [];
  transactions.slice(0, 30).map((item, idx) => labels.push(item.date));

  let amounts = [];
  let bandes_amount = [];
  let bbva_amount = [];
  let brou_amount = [];
  let heritage_amount = [];
  let itau_amount = [];
  let santander_amount = [];
  let scotia_amount = [];
  //.slice(0, 30)
  transactions.map((item, idx) => {
    if (item["link"]["institution"] === "BANDES") {
      bandes_amount.push(item.balance);
    }
    if (item["link"]["institution"] === "BBVA") {
      bbva_amount.push(item.balance);
    }
    if (item["link"]["institution"] === "BROU") {
      brou_amount.push(item.balance);
    }
    if (item["link"]["institution"] === "HERITAGE") {
      heritage_amount.push(item.balance);
    }
    if (item["link"]["institution"] === "ITAU") {
      itau_amount.push(item.balance);
    }
    if (item["link"]["institution"] === "SANTANDER") {
      santander_amount.push(item.balance);
    }
    if (item["link"]["institution"] === "SCOTIABANK") {
      scotia_amount.push(item.balance);
    }
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Bandes Balance",
        data: bandes_amount,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "BBVA Balance",
        data: bbva_amount,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        hidden: true,
      },
      {
        label: "BROU Balance",
        data: brou_amount,
        borderColor: "rgb(255, 206, 86)",
        backgroundColor: "rgba(255, 206, 86, 0.5)",
        hidden: true,
      },
      {
        label: "Heritage Balance",
        data: heritage_amount,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        hidden: true,
      },
      {
        label: "Itau Balance",
        data: itau_amount,
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        hidden: true,
      },
      {
        label: "SantanderBalance",
        data: santander_amount,
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.5)",
        hidden: true,
      },
      {
        label: "Scotiabank Balance",
        data: scotia_amount,
        borderColor: "rgb(225, 225, 225)",
        backgroundColor: "rgba(225, 225, 225, 0.5)",
        hidden: true,
      },
    ],
  };

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
      <div className="page">
        <div class="grid-container">
          <div class="item1">
            <h3>Overview</h3>
            <div className="content">
              <div>
                <div className="peli-item">
                  <div className="card-content">
                    <h4>{name}</h4>
                    <p>Total Balance: </p>
                    <span>U$D {total_balance.toLocaleString()}</span> 
                  </div>
    
                </div>
              </div>
              <tbody className="quotes">
                  <tr>
                    <th>Currency</th>
                    <th>Buy</th>
                    <th>Sell</th>
                  </tr>
                  {quotesList.map((dato) => (
                    <tr key={dato.key}>
                      <td>{dato.key}</td>
                      <td>{dato.value.buy}</td>
                      <td>{dato.value.sell}</td>
                    </tr>
                  ))}
                </tbody>
            </div>
          </div>
          <div class="item2">
            <h3>Balance by Bank  (USD)</h3>
            <div className="donita">
              <Doughnut className="dona" options={options1} data={data1} />
            </div>
          </div>
          <div class="item3">
            <h3>Balance Evolution (USD)</h3>
            <Line className="line" options={options} data={data} />
          </div>
          <div class="item4">
            <h3>Last Transactions</h3>
            <div className="last_transactions">
              <tbody className="tabla">
                <tr>
                  <th>Bank</th>
                  <th>Amount</th>
                  <th>Currency</th>
                </tr>
                {transactions.slice(0, 17).map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.link.institution}</td>
                    <td>{item.amount.toLocaleString('en-US')}</td>
                    <td>{item.currency}</td>
                  </tr>
                ))}
              </tbody>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Dashboard;
