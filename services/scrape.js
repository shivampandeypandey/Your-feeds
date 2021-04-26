const axios = require('axios');
const cheerio = require('cheerio');

module.exports =/*const test = */ async (req,res) => {

  const {category, searchTerm} = req.query;

  try {
    const articles = [];
    if (category == "News"){
      const { startDate, endDate } = req.query;
  
      const newsUrl = `https://www.nytimes.com/search?endDate=${endDate}&query=${searchTerm}&sort=best&startDate=${startDate}`
      const newsApi = await axios.get(newsUrl);

      articles.push(...getNews(newsApi));
    }
    if (category == "Movies"){
      // Movie name as SearchTerm
      const searchMovieUrl = 'https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=';
      const searchMovieApi = await axios.get(`${searchMovieUrl}${searchTerm}`);
      let movies = searchMovies(searchMovieApi);
            
      for (let movie of movies){
        const getMovieUrl = `https://www.imdb.com/title/${movie.imdbID}`;
        const getMovieApi = await axios.get(`${getMovieUrl}`);
        const {img, description} = getMovie(getMovieApi);
        articles.push({url: getMovieUrl+movie.imdbID, title: movie.title, img, description});
      }
    }
    if (category == "Games"){
      const searchGameUrl = `https://store.steampowered.com/search/suggest?term=${searchTerm}&f=games&cc=IN&realm=1&l=english&excluded_content_descriptors%5B%5D=3&excluded_content_descriptors%5B%5D=4&v=11321711`;
      const searchGameApi = await axios.get(`${searchGameUrl}`);
      let games = searchGame(searchGameApi);
      
      for (let game of games){
        const getGameUrl = `https://store.steampowered.com/app/${game.gameID}`;
        const getGameApi = await axios.get(`${getGameUrl}`, { credentials: 'include', headers: {Cookie: "lastagecheckage=1-0-1900; birthtime=2211667760;wants_mature_content=1"}});
        const {description, img} = getGame(getGameApi);
        articles.push({title: game.title, url: game.url, img , description});
      }
    }
    if (category == "Fitness"){
      const searchUrl = `https://search-api.swiftype.com/api/v1/public/engines/search.json?engine_key=BLAqzr47eZtVAmu7qrNv&per_page=8&highlight_fields%5Bpage%5D%5Btitle%5D%5Bsize%5D=250&highlight_fields%5Bpage%5D%5Btitle%5D%5Bfallback%5D=false&highlight_fields%5Bpage%5D%5Bdescription%5D%5Bsize%5D=250&highlight_fields%5Bpage%5D%5Bdescription%5D%5Bfallback%5D=false&highlight_fields%5Bpage%5D%5Bbody%5D%5Bsize%5D=250&highlight_fields%5Bpage%5D%5Bbody%5D%5Bfallback%5D=false&q=${searchTerm}`;
      const getFitnessApi = await axios.get(searchUrl);

      articles.push(...getFitnessAdvise(getFitnessApi.data));
    }
    res.json(articles);
  } catch(err) {
    console.log(err);
  }
}

// ============================
// start news scraping function
function getNews(newsApi) {
  const $ = cheerio.load(newsApi.data, {
    normalizeWhitespace: true,
    xmlMode: true,
    lowerCaseTags: true
  });

  const articles = [];
  const orderedArticles = $('li')

  for (let i = 0; ((articles.length <=5) && (i < 25)); i++) {

    let url = $(orderedArticles[i]).find('a').attr('href');
    const title = $(orderedArticles[i]).find('h4').text();
    const description = $(orderedArticles[i]).find('p').text();
    const img = $(orderedArticles[i]).find('img').attr('src');

    if ((url !== undefined) && (img !== undefined) && (title !== undefined) && (description !== undefined)) {
      if(url.indexOf(".com") === -1){
        url = "https://www.nytimes.com" + url;
      }
      articles.push({ url, title, description, img });
    }
  }
  return articles;
}
// end news scraping fucntion
// ============================

// ==============================
// Start Movie Scraping Functions
function searchMovies(searchMovieApi) {
  const $ = cheerio.load(searchMovieApi.data, {
    normalizeWhitespace: true,
    xmlMode: true,
    lowerCaseTags: true
  });
  
  const movies = [];
  
  $('tr.findResult').each(function(i, element) {
    const $element = $(element);
    const $title = $element.find('td.result_text a');
    const imdbID = $title.attr('href').match(/title\/(.*)\//)[1];
    
    const movie = {
      imdbID,
      title: $title.text()
    };
    console.log(movie);
    movies.push(movie);
  });
  return movies;
}

function getMovie(getMovieApi) {
  const $ = cheerio.load(getMovieApi.data, {
    normalizeWhitespace: true,
    xmlMode: true,
    lowerCaseTags: true
  });
      
  const dateReleased = $('#titleYear a').text();
  const img = $('div.poster a img').attr('src');
  const description = $('div.summary_text').text().trim().substr(0,200)+`. <br>Released On: ${dateReleased}`;

  return {
    description,
    img
  };
}
// End Movie Scraping Functions
// ============================

//===================== 
// Start Games Function
function searchGame(searchGameApi) {
  const $ = cheerio.load(searchGameApi.data, {
    normalizeWhitespace: true,
    xmlMode: true,
    lowerCaseTags: true
  });
  
  const games = [];
  
  $('a').each(function(i, element) {
    const $element = $(element);
    
    const gameID = $element.attr('data-ds-appid');
    const title = $element.find('div.match_name').text();
    const url = $element.attr('href');
    
    const game = {
      url,
      gameID,
      title
    };

    games.push(game);
  });
  return games;
}

function getGame(getGameApi) {
 const $ = cheerio.load(getGameApi.data, {
    normalizeWhitespace: true,
    xmlMode: true,
    lowerCaseTags: true
  });
      
  const description = $('div#game_area_description').text().substr(0, 400);
  const img = $('div.game_header_image_ctn img').attr('src');

  return {
    description,
    img
  };
}
// End Game Function
// =================

// =====================
// Start fitness function
function getFitnessAdvise(getFitnessApi) {
  const blogs = [];

  for (let article of getFitnessApi.records.page) {
    blogs.push({
      img: article.image,
      url: article.url,
      title: article.title,
      description: article.body.substr(0,200)
    });
  }
  return blogs;
}
// End fitness function
// =====================