// Importing React and other required modules
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "../homePage/HomePage.scss";
import Header from "../header/Header";
import RecipeList from "../recipeList/RecipeList";
import RecipeDetail from "../recipeDetail/RecipeDetail";
import { setSavedRecipes } from "../../state";
import { useNavigate } from "react-router-dom";

// HomePage component
const HomePage = () => {
  const navigate = useNavigate();
  // Using useDispatch and useSelector hooks
  const dispatch = useDispatch();
  const { user, savedRecipes, token } = useSelector((state) => state);

  // State for recipe detail, random recipes and searched recipes
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [searchedRecipes, setSearchedRecipes] = useState();

  // Log all environment variables for debugging
  console.log('All Environment Variables:', process.env);

  // API Key and URLs for Spoonacular API
  const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;
  console.log('Raw API_KEY:', API_KEY);
  console.log('Typeof API_KEY:', typeof API_KEY);

  // Ensure API_KEY is a non-empty string
  const validApiKey = API_KEY && typeof API_KEY === 'string' ? API_KEY.trim() : null;
  console.log('Validated API_KEY:', validApiKey);

  const SEARCH_RECIPE_URL = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${validApiKey}&number=12`;
  const RANDOM_RECIPE_URL = `https://api.spoonacular.com/recipes/random?apiKey=${validApiKey}&number=12`;

  // Function to handle Bookmark click
  const handleBookmarkClick = async (recipeId) => {
    try {
      console.log('Bookmark Click Details:', {
        userId: user?._id,
        recipeId: recipeId,
        token: token ? 'Token Present' : 'No Token',
        apiUrl: process.env.REACT_APP_API_URL
      });

      if (!user || !user._id) {
        console.error('No user ID available');
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/${user._id}/savedRecipe`,
        { recipeId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Bookmark Response:', response.data);

      if (response.data) {
        dispatch(
          setSavedRecipes({
            savedRecipes: response.data,
          })
        );
      }
    } catch (error) {
      console.error("Error bookmarking recipe:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
    }
  };

  // Random Recipes
  
  // Function to get random recipes
  const getRandom = async () => {
    try {
      if (!validApiKey) {
        console.error('Spoonacular API Key is not defined');
        return;
      }
      const api = await axios.get(RANDOM_RECIPE_URL);
      setRandomRecipes(api.data.recipes);
    } catch (error) {
      console.error('Error fetching random recipes:', error);
    }
  };
  useEffect(() => {
    getRandom();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

   // Function to set recipe detail state
  const handleRecipeDetails = async (check, recipeDetail) => {
    try {
      if (!validApiKey) {
        console.error('Spoonacular API Key is not defined');
        return;
      }
      if(check){
        const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeDetail}/information?apiKey=${validApiKey}`);
        const data =  response.data;
        console.log(data)
        setRecipeDetail(data);
      }
      else{
        setRecipeDetail(recipeDetail);
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  }

  // Function to search recipes using Spoonacular API
  const searchRecipes = async (query) => {
    try {
      if (!validApiKey) {
        console.error('Spoonacular API Key is not defined');
        return;
      }
      const response = await axios.get(SEARCH_RECIPE_URL, {
        params: {
          query: query,
        },
      });
      setSearchedRecipes(response.data.results);
    } catch (error) {
      console.error('Error searching recipes:', error);
    }
  };

  // Function to navigate to Home Page 
  function handleNavigateHome(){
    setRecipeDetail(null);
    navigate('/home');
  }

  // Function to navigate to Profile Page 
  function handleNavigateProfile(userId){
    setRecipeDetail(null);
    navigate(`/profile/${userId}`)
  }

  return (
    <div className="home-page-container">
      {/* Renders the header component with the search bar and profile icon */}
      <Header searchRecipes={searchRecipes} isHome={true} handleNavigateHome = {handleNavigateHome} handleNavigateProfile = {handleNavigateProfile}/>

      {/* Renders the recipe list or the recipe detail component */}
      {recipeDetail ? <RecipeDetail recipe = {recipeDetail}/>
      :
      <div className="recipe-catalogue-container">
        {/* Renders the searched recipes if available, otherwise renders random recipes */}
        {searchedRecipes ? 
         searchedRecipes &&
         searchedRecipes.map((recipe, index) => {
           return (
             <RecipeList key={index} recipe={recipe} recipeType = "searchedRecipe" handleRecipeDetails = {handleRecipeDetails} onBookmarkClick={handleBookmarkClick} isBookmarked={savedRecipes.includes(recipe.id) } isHome = {true} />
           );
         }) 
         :
        randomRecipes &&
          randomRecipes.map((recipe, index) => {
            return (
              <RecipeList key={index}  recipe={recipe}  recipeType = "randomRecipe" handleRecipeDetails = {handleRecipeDetails} onBookmarkClick={handleBookmarkClick} isBookmarked={savedRecipes.includes(recipe.id)} isHome = {true} />
            );
          })  
          }
      </div>}
    </div>
  );
};

export default HomePage;
