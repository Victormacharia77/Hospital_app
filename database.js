
const express = require('express');
require('dotenv').config();

const mysql = require('mysql2/promise')


const pool = mysql.createPool({
    database: 'hospital_app',
    user: 'root' ,
    host: "localhost",
    port: 3306,
    connectTimeout:6000000,
});


module.exports = async function query(sql, values = []){
    const connection = await pool.getConnection();

    try{
        const [results] = await connection.query(sql, values);
        return results;
    } catch (err){
        throw err;
    } finally {
        connection.release();
    }
};
