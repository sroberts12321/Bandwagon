const express = require('express')
require('dotenv').config()
const app = express()
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('index')
})


const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server started on port ${port}`))