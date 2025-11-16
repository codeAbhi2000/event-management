"use strict";
const express = require("express");
const app = express();
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sever listening on PORT ${PORT}`);
});
