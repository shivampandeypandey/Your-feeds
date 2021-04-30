import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { Input, FormBtn } from "../../components/Form";
import Jumbotron from "../../components/Jumbotron";
import TabNav from "../../components/TabNav";
// use Tab component in further app versions
// import Tab from '../../components/Tab';
import API from "../../utils/API";
import ArticleCard from "../../components/ArticleCard"

class Search extends Component {

  // Initialize deafult states in constructor
  constructor(props) {
    super(props);
    this.state = {
      selectedNavTab: 'News',
      articles: [],
      savedArticles: [],
      searchTerm: "",
      startDate: "",
      endDate: "",
      emptySearch: false
    }
  }

  // For selected NavTabs (Movies, Sports, etc)
  setSelectedNavTab = (navTab) => {
    this.setState({ selectedNavTab: navTab });
  }

  // For API calls
  componentDidMount() {
    this.getSavedArticles();
  }

  checkSaved = article => {
    return this.state.savedArticles.filter(elem => elem.url === article.url).length > 0;
  }

  handleInputChange = event => {
  	const { name,value } = event.target;
  	this.setState({
  		[name]: value
  	});
  };

  handleFormSubmit = event => {
  	event.preventDefault();
    const category = this.state.selectedNavTab;
    const reqVar = {};
    const nonDateTabs = ["Movies", "Games", "Fitness"];
  	if ((category == "News" && this.state.searchTerm && this.state.startDate && this.state.endDate) || ( nonDateTabs.includes(category) && this.state.searchTerm )) {
      if(category == "News"){
        reqVar.startDate = this.state.startDate.replace(/-/g,"");
        reqVar.endDate = this.state.endDate.replace(/-/g,"");
      }
      
      reqVar.category = category;
      reqVar.searchTerm = this.state.searchTerm;
      let end_call= null;
      // Function for searching a article
      if(reqVar.category == "News"){
        end_call = API.searchNewsArticles(reqVar.category, reqVar.searchTerm, reqVar.startDate, reqVar.endDate);
      }
      else{
        end_call = API.searchOtherArticles(reqVar.category, reqVar.searchTerm);
      }
        
  		end_call.then(res => {
        let articles = res.data;
        let emptySearch = false;
        if (articles.length <= 0) {
          emptySearch = true;
        }
        this.setState({articles, emptySearch, searchTerm: "", startDate: "", endDate: ""})
      })
  		.catch(err => console.log(err));
  	}
  };

  // Function for saving a article
  saveArticle = index => {
    API.saveArticle(this.state.articles[index])
      .then(res => this.getSavedArticles())
      .catch(err => console.log(err))
  }

  // Function to get saved articles
  getSavedArticles = () => 
    API.getSavedArticles()
      .then(res => this.setState({savedArticles: res.data}))
      .catch(err => console.log("No Articles to Show"))

// render App UI
  render() {
    let renderDateInput = null;
    let legalInput = null;
    if (this.state.selectedNavTab == "News") {
      renderDateInput = <div><label>Start Date</label>
      <Input value={this.state.startDate} onChange={this.handleInputChange} name="startDate" type="date"/>
      
      <label>End Date</label> /
      <Input value={this.state.endDate} onChange={this.handleInputChange} name="endDate" type="date"/></div>
      if(this.state.searchTerm && this.state.startDate && this.state.endDate)
      {
        legalInput = true;
      }
    }
    else
    {
      if(this.state.searchTerm)
      {
        legalInput = true;
      }
    }
    return (
      <Container className="mb-5">

	      <Jumbotron title = "YourFeeds-Providing Customized News-Feed" lead = "Search and save interesting Feeds!" fontawesome = "fas fa-search"/>
	      
        <Row className="justify-content-center">
          <Col size="10">
            <TabNav tabs={['News', 'Movies', 'Games', 'Fitness']} selected={ this.state.selectedNavTab } setSelected={ this.setSelectedNavTab }>
            </TabNav>
          </Col>

          <Col size="10">
            <div className="card">
              <div className="card-header">
                <h4><i className="far fa-hand-point-right"></i> Search { this.state.selectedNavTab }</h4>
              </div>

              <div className="card-body">
                <form>
                  <label>Search</label>
                  <Input value={this.state.searchTerm} onChange={this.handleInputChange} name="searchTerm" placeholder={'Search in ' + this.state.selectedNavTab}/>
                  {renderDateInput}

                  <FormBtn disabled={!legalInput} onClick={this.handleFormSubmit}> Search </FormBtn>
                </form>
              </div>

            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col size="10">
            {this.state.emptySearch
            ?
            <h3 className="text-center mt-2">No results found. Please try another query.</h3>
            :
              this.state.articles.map((article, i) => (
              <ArticleCard 
                title = {article.title}
                description = {article.description}
                img = {article.img}
                url = {article.url}
                save = {() => this.saveArticle(i)}
                alreadySaved = {this.checkSaved(article)}
                key = {i}
              />))
            }
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Search;
