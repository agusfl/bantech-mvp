import React, { useState, useEffect } from "react";
import "./styles/transactions.css";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const Transactions = () => {
  const [transactions, getTransactions] = useState([]);
  const rows = [];
  const [auth, getAuth] = useState(false);

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
    fetch("/transactions")
      .then((res) => res.json())
      .then((response) => {
        getTransactions(response);
      });
  }, [transactions]);

  const columns = [
    { field: "date", headerName: "Date", width: 110 },
    { field: "description", headerName: "Description", width: 300 },
    { field: "id", headerName: "Reference", width: 150 },
    { field: "amount", headerName: "Amount", width: 120 },
    { field: "balance", headerName: "Balance", width: 150 },
    { field: "currency", headerName: "Currency", width: 130 },
    { field: "bank", headerName: "Bank", width: 150 },
    { field: "status", headerName: "Status", width: 140 },
  ];

  console.log(transactions);
  transactions.map((item, idx) =>
    rows.push({
      date: item.date,
      description: item.description,
      id: item.reference,
      amount: item.amount.toLocaleString("en-US"),
      balance: item.balance.toLocaleString("en-US"),
      currency: item.currency,
      bank: item.link.institution,
      status: item.status,
    })
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
      <div className="layout">
        <div className="transacciones">
          <div style={{ height: 640, width: 1790 }} className="Table">
          <h1 className="Tittle_transactions">Transactions</h1>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              stickyHeader
              getRowId={(row) => row?.id}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default Transactions;
