import React, {  useMemo, useState } from "react";
import "../profilePage/ProfilePage.scss";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setSavedRecipes } from "../../state/index";
import Header from "../header/Header";
import User from "../user/User";
import RecipeList from "../recipeList/RecipeList";
import RecipeDetail from "../recipeDetail/RecipeDetail";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const dispatch = useDispatch();

  // Select user, token, and saved recipes from the Redux store
  const { user, token, savedRecipes } = useSelector((state) => state);

  // API Key for Spoonacular
  const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;

  // Fetch saved recipes and update state and Redux store
  const getSavedRecipes = async () => {
    try {
      console.log('Fetching Saved Recipes:', {
        userId: user?._id,
        token: token ? 'Token Present' : 'No Token',
        apiUrl: process.env.REACT_APP_API_URL
      });

      if (!user || !user._id) {
        console.error('No user ID available');
        return;
      }

      const savedRecipesResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/${user._id}/savedRecipe`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Saved Recipes Response:', savedRecipesResponse.data);

      const savedRecipesData = await savedRecipesResponse.data;
      
      if (savedRecipesData) {
        console.log('Saved Recipes Data:', savedRecipesData);
        dispatch(
          setSavedRecipes({
            savedRecipes: savedRecipesData,
          })
        );

        // Fetch full recipe details
        const response = await axios.get(`https://api.spoonacular.com/recipes/informationBulk?apiKey=${API_KEY}&ids=${savedRecipesData.join(',')}`);
        console.log('Detailed Saved Recipes:', response.data);
        setRecipes([...response.data]);
      }
    } catch (error) {
      console.error("Error fetching saved recipes:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
    }
  };
  // Call getSavedRecipes() only once on initial render
  useMemo(() => {
    getSavedRecipes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Callback function to handle click on a recipe in the recipe list
  function handleRecipeDetails(check , recipeDetail) {
    setRecipeDetail(recipeDetail);
  }
  
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
    <div>
      <Header isHome={false} handleNavigateHome = {handleNavigateHome} handleNavigateProfile = {handleNavigateProfile} />
      {recipeDetail ? (
          <RecipeDetail recipe={recipeDetail} />
        ) : (
      <div className="profile-container">
        <User user={user} />
        <h1 className="saved-recipes-text">Saved Recipes</h1>
        
          <div className="profile-recipe-catalogue-container">
            {recipes &&
              recipes.map((recipe, index) => {
                return (
                  <RecipeList
                    key={index}
                    recipe={recipe}
                    handleRecipeDetails={handleRecipeDetails}
                    isBookmarked={savedRecipes.includes(recipe.id)}
                    isHome = {false}
                  />
                );
              })}
          </div>
      </div>)}
    </div>
  );
};

export default ProfilePage;
