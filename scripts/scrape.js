var axios = require("axios");
var cheerio = require("cheerio");
var scrapeArticles = function(){


return axios.get("https://www.nytimes.com/").then(function (response){
        var $ = cheerio.load(response.data);
        // console.log($);
        var articles = [];
    

        $("div.css-1100km").each(function(i, element) {
            var result = {};
            var baseURL = "https:/www.nytimes.com";
            // console.log(element);
            var image = $(this).find("img").attr("src");
            result.image = image;
            
            var title = $(this).find("h2").text();
            result.title = title;

            var description = $(this).find("p").text();
            result.description = description;

            var link = $(this).find("a").attr("href");
            link = baseURL + link;
            result.link = link;

            console.log(result.description.length);
            // result.title = $(this).children("h2").text();
            // result.summary = $(this).children(".summary").text();
            // result.link = $(this).children("h2").children("a").attr("href");
            if(result.description != ""){
                 articles.push(result);
            }
           
        });
        console.log(articles);
        return articles;
    });

};

module.exports=scrapeArticles;