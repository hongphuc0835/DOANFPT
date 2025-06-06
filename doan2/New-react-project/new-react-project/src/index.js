import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Header from "./Headers/Header";
import DiagnoseComponent from "./AI/DiagnoseComponent";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        {/*<Header/>*/}
        {/*<DiagnoseComponent/>*/}
        <App/>
    </React.StrictMode>
);


reportWebVitals();
