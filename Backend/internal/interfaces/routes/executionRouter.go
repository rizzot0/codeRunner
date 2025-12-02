package routes

import (
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/interfaces/controllers"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/services"
	"github.com/gin-gonic/gin"
)

func SetupExecutionRouter(r *gin.Engine) {

	executionService := services.NewExecutionService()
	executionController := controllers.NewExecutionController(*executionService)

	r.POST("/execution", executionController.Execute)
}
