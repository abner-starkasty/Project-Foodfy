const Recipe = require('../models/Recipe')

function checkAllFields(body) {
  const keys = Object.keys(body)

  for (key of keys) {
    if (body[key] == '' && key != 'removed_files' && key != 'information') {
      return {
        error: 'Por favor, com exceção do campo "informações", todos os demais devem ser preenchidos!',
        recipe: body,
      }
    }
  }
}

module.exports = {
  async post(req, res, next) {
    try {
      const fillAllFields = checkAllFields(req.body)
      if (fillAllFields) {
        const chefOptions = await Recipe.chefSelectOptions()
        return res.render('adminRecipes/recipe-create', {
          ...fillAllFields,
          chefOptions
        })
      }

      if (req.files.length == 0) {
        const error = 'Por favor, envie ao menos uma imagem!'
        return res.render('adminRecipes/recipe-create', {
          error,
          recipe: req.body,
        })
      }

      next()
    } catch (error) {
      console.error(error)
    }
  },
  async show(req, res, next) {
    try {
      const recipe = await Recipe.findRecipe(req.params.id)
      if (!recipe) {
        req.session.error = 'Receita não encontrada!'
        return res.redirect('/admin/recipes')
      }

      req.recipe = recipe

      next()
    } catch (error) {
      console.error(error)
    }
  },
  async edit(req, res, next) {
    try {
      const recipe = await Recipe.findRecipe(req.params.id)
      if (!recipe) {
        req.session.error = 'Receita não encontrada!'
        return res.redirect('/admin/recipes')
      }

      const { user: userInSession } = req.session
      if (recipe.user_id != userInSession.id) {
        if (!userInSession.isAdmin) {
          req.session.error = `ATENÇÃO: Só é possível editar uma receita caso seja admnistrador do sistema ou seja uma receita sua!`
          return res.redirect('/admin/recipes')
        }
      }

      req.recipe = recipe

      next()
    } catch (error) {
      console.error(error)
    }
  },
  async put(req, res, next) {
    try {
      const fillAllFields = checkAllFields(req.body)
      if (fillAllFields) {
        return res.render('adminRecipes/recipe-edit', fillAllFields)
      }

      const { user: userInSession } = req.session
      const recipe = await Recipe.findById(req.body.id)

      if (recipe.user_id != userInSession.id) {
        if (!userInSession.isAdmin) {
          req.session.error = `ATENÇÃO: Só é possível atualizar caso seja admnistrador do sistema ou seja uma receita sua!`
          return res.redirect('/admin/recipes')
        }
      }

      next()
    } catch (error) {
      console.error(error)
    }
  },
  async delete(req, res, next) {
    try {
      const { user: userInSession } = req.session
      const recipe = await Recipe.findById(req.body.id)

      if (recipe.user_id != userInSession.id) {
        if (!userInSession.isAdmin) {
          req.session.error = `ATENÇÃO: Só é possível deletar caso seja admnistrador do sistema ou seja uma receita sua!`
          return res.redirect('/admin/recipes')
        }
      }

      next()
    } catch (error) {
      console.error(error)
      req.session.error = `ATENÇÃO: ${error}`
      res.redirect('/admin/recipes')
    }
  },
}