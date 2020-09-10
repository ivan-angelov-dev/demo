var express = require('express');
const multer = require('multer');
const path = require("path");
const fs = require("fs");
var randomstring = require("randomstring");
var mysql = require('mysql')

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
})

connection.connect()

var router = express.Router();

const handleError = (err, res) => {
  res
      .status(500)
      .contentType("text/plain")
      .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: 'public/images'
});


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/image/:imageUrl', function(req, res) {

    connection.query('SELECT extension from image where url like "' + req.params.imageUrl + '"', function (err, rows, fields) {
        if (err) throw err

        if (rows.length > 0) {
            console.log(rows[0].extension);
            res.sendFile(path.join(__dirname, '../public/images/' + req.params.imageUrl + rows[0].extension));
        } else {
            res
                .status(403)
                .contentType("text/plain")
                .end("Image not existing");
        }

    })


});


router.post(
    '/upload',
  upload.single('image'),
      (req, res) => {
        const tempPath = req.file.path;
        const timestamp = Date.now();
          let randomString = require("randomstring");
          const newFileName = randomString.generate(7) + timestamp;
          const extname =  path.extname(req.file.originalname).toLowerCase();
          const targetPath = path.join(__dirname, "../public/images/" + newFileName + extname);


        if (extname === '.png' || extname === '.jpg') {
          fs.rename(tempPath, targetPath, err => {
            if (err) return handleError(err, res);

              connection.query('INSERT INTO image (url, extension) values ("' + newFileName + '", "' + extname + '")', function (err, rows, fields) {
                  if (err) throw err
              })

              res
                .status(200)
                .contentType("text/plain")
                .end("http://localhost:3000/image/" + newFileName);
          });
        } else {
          fs.unlink(tempPath, err => {
            if (err) return handleError(err, res);

            res
                .status(403)
                .contentType("text/plain")
                .end("Only image files are allowed!");
          });
        }
      }
);

module.exports = router;
