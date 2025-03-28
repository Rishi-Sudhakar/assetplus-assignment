var router = require("express").Router();

router.get('/', async (req, res) => {
    res.send('Server is online')
})

router.use("/post", require("./post"));

module.exports = router;