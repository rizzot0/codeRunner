package controllers

import (
	"net/http"

	"github.com/elfaldiajr/compiladorEnLineaCP/internal/request"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/response"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/services"
	"github.com/gin-gonic/gin"
)

type ExecutionController struct {
	executionService services.ExecutionService
}


func NewExecutionController( executionService services.ExecutionService) *ExecutionController {
	return &ExecutionController{
		executionService: executionService,
	}
}


func (e *ExecutionController) Execute(c *gin.Context) {
	var req request.ExecutionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{ "error" : err.Error() })
		return
	}

	output, err := e.executionService.Execute(req.ProgrammingLanguage, req.Entrypoint, req.Input, req.Files)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{ "error" : err.Error()})
		return
	}

	res := &response.ExecutionResponse{
		Stdout: output.Stdout,
		Stderr: output.Stderr,
	}

	c.JSON(http.StatusOK, res)
}