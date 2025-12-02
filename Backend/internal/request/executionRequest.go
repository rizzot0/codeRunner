package request

import "github.com/elfaldiajr/compiladorEnLineaCP/internal/models"

type ExecutionRequest struct {
	ProgrammingLanguage string        `json:"programming_language" binding:"required"`
	Input               string        `json:"input"`
	Entrypoint          string        `json:"entrypoint" binding:"required"`
	Files               []models.File `json:"files" binding:"required"`
}
