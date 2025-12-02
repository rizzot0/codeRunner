package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	gin.SetMode(gin.DebugMode)

	r := gin.Default()

	r.Use(cors.Default())

	SetupExecutionRouter(r)
	SetupSnippetRouter(r)
	
	return r
}