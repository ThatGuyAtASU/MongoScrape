var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var scrapeArticles = require ("./scripts/scrape");

var app = express();
var PORT = process.env.PORT || 8080;



app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(logger("dev"));


app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

var MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost/mongoScrape"
mongoose.connect(MONGODB_URL, { useNewUrlParser: true});

app.get("/", function (req, res) {
    db.Article.find({ saved: false}).then(function (articles)
    {
        res.render("index", {
            articles: articles
        });
    }).catch(err => res.json(err));
})

app.get("/saved", function (req,res){
    db.Article.find({saved: true}).then(function (articles) {
        res.render("saved", {
            articles: articles
        });
    }).catch(err => res.json(err));
});

app.get("/articles/:id", function (req, res) {
    db.Article.findOne({_id: req.params.id}).then(data =>
        res.json(data)).catch(err => res.json(err));
});

app.post("/articlenote/:id", function (req, res){

    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id:req.params.id }, {
                $push: {
                    note: dbNote._id
                }
            }, { new: true});
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.delete("/deletenote/:id", function(req, res){
    db.Note.deleteOne({_id: req.params.id}).then(data =>
        res.json(data)).catch(err => res.json(err));
})

app.get("/notes/:id", function (req,res) {
    db.Article.findOne({ _id: req.params.id }).populate("note")
    .then(function (art) {
        res.json(art);
    }).catch(err => res.json(err));
});

app.delete("/savedarticle/:id", function(req,res) {
    db.Article.deleteOne({ _id: req.params.id }).then(data =>
        res.json(data)).catch(err => res.json(err));
})

app.get("/scrape", function (req,res) {
    return scrapeArticles()
    .then(function(articles){

        db.Article.create(articles)
    })
    // db.Article.deleteMany({}).then(function (data) {
    //     res.json(data);
    // }).catch(err => res.json(err));

    // db.Note.deleteMany({}).then(function (data) {
    //     res.json(data);
    // }).catch(err => res.json(err));

    // axios.get("https://www.nytimes.com/").then(function (response){
    //     var $ = cheerio.load(response.data);
    //     console.log($);

        // $("article").each(function(i, element) {
        //     var result = {};

        //     result.title = $(this).children("h2").text();
        //     result.summary = $(this).children(".summary").text();
        //     result.link = $(this).children("h2").children("a").attr("href");

        //     var entry = new db.iArticle(result);

        //     entry.save(function(err, doc) {

        //         if(err) {
        //             console.log(err);
        //         }
        //         else{
        //             console.log(doc);
        //         }
        //     });
        // });

            // res.send("Scrape Complete");
    });
// });

app.delete("/articles", function(req, res) {
    db.Article.deleteMany({}).then(function (data) {
        res.json(data);
    }).catch(err => res.json(err));
});

app.put("/articles/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: req.body}).then(data => res.json(data)).catch(err => res.json(err));
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
})