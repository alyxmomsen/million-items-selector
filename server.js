const express = require("express");
const { router } = require("./routes/routes");
const cors = require("cors");
const app = express();

const port = 3000;
const host = "0.0.0.0";

app.use(cors({}));
app.use("/api", router);

app.listen(3000, host, () => {
    console.log(`server started on ${host}:${port}`);
});
