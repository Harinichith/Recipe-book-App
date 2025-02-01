import SavedRecipes from "../models/SavedRecipes.js";

/* READ */
/**
 * Retrieves the saved recipes of a user with the given user ID.
 * Returns an array of recipe IDs in the response.
 */
export const getSavedRecipe = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Fetching Saved Recipes:', { 
      userId, 
      authenticatedUser: req.user?.id 
    });

    const savedRecipes = await SavedRecipes.find({ userId });
    
    console.log('📋 Saved Recipes Found:', { 
      count: savedRecipes.length,
      recipeIds: savedRecipes.length > 0 ? savedRecipes[0].recipeId : [] 
    });

    if (savedRecipes.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(savedRecipes[0].recipeId);
  } catch (err) {
    console.error('❌ Error Fetching Saved Recipes:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
/**
 * Updates the saved recipes of a user with the given user ID.
 * If the recipe ID is already in the user's saved recipes, removes it.
 * If the recipe ID is not in the user's saved recipes, adds it.
 * Returns an array of recipe IDs in the response.
 */
export const updateSavedRecipe = async (req, res) => {
  try {
    const { userId } = req.params;
    const { recipeId } = req.body;

    console.log('🔖 Updating Saved Recipes:', { 
      userId, 
      recipeId,
      authenticatedUser: req.user?.id 
    });

    const userSavedRecipe = await SavedRecipes.find({ userId });

    if(userSavedRecipe.length === 0) {
      console.log('🆕 Creating New Saved Recipes Entry');
      const newSavedRecipes = new SavedRecipes({
        userId, 
        recipeId: [recipeId]
      });
      await newSavedRecipes.save();
      return res.status(200).json([recipeId]);
    }

    const currentSavedRecipes = userSavedRecipe[0].recipeId;
    let updatedRecipeIds;

    if (currentSavedRecipes.includes(recipeId)) {
      console.log('🗑️ Removing Recipe from Saved Recipes');
      updatedRecipeIds = currentSavedRecipes.filter(id => id !== recipeId);
    } else {
      console.log('💾 Adding Recipe to Saved Recipes');
      updatedRecipeIds = [...currentSavedRecipes, recipeId];
    }

    const updatedSavedRecipes = await SavedRecipes.findByIdAndUpdate(
      userSavedRecipe[0]._id,
      { 
        userId,
        recipeId: updatedRecipeIds
      },
      { new: true }
    );

    console.log('✅ Saved Recipes Updated:', { 
      updatedRecipeIds 
    });

    res.status(200).json(updatedRecipeIds);
  } catch (err) {
    console.error('❌ Error Updating Saved Recipes:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: err.message });
  }
};
