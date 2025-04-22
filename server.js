const express = require('express');
const app =  express();
require('dotenv').config();
const PORT = process.env.PORT || 4001 ;
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// user route
app.use('/api/user', userRoutes);

// admin route
app.use('/api/admin', adminRoutes);


app.listen(PORT,()=>{
    console.log(`server is started on ${PORT}`)
})