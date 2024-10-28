import express from "express";
import os from "os";
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req,res)=>{
res.status(200).json({
    message: `local machine ${req.hostname} : ip address ${req.ip}`
})
})
app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT} \n url: http://localhost:${PORT}`);
})