import axios from "axios";

export default {
  // Gets all saved articles
  getSavedArticles: function() {
    return axios.get("/api/articles/saved");
  },
  // Stores an article into the database
  saveArticle: function(articleData) {
    return axios.post("/api/articles/saved", articleData);
  },
  // Deletes the article with the given id
  deleteSavedArticle: function(id) {
    return axios.delete("/api/articles/saved/" + id);
  },
  // Grabs the News category articles matching the given search params
  searchNewsArticles: function(category, searchTerm, start, end) {
    return axios.get(`/api/articles/search/?category=${category}&searchTerm=${searchTerm}&start=${start}&end=${end}`);
  },
  // Grabs the other category articles matching the given search params
  searchOtherArticles: function(category, searchTerm) {
    return axios.get(`/api/articles/search/?category=${category}&searchTerm=${searchTerm}`);
  }
};
