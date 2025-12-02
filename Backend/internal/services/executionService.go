package services

import (
	"time"

	"github.com/elfaldiajr/compiladorEnLineaCP/internal/models"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/sandbox"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/sandbox/runners"
)

type ExecutionService struct{}

func NewExecutionService() *ExecutionService {
	return &ExecutionService{}
}

func (e *ExecutionService) Execute(programmingLanguage string, entrypoint string, input string, files []models.File) (*sandbox.ExecutionOutput, error) {

	runner, err := runners.FactoryRunners(programmingLanguage)
	if err != nil {
		return nil, err
	}

	sandbox, err := sandbox.NewSandbox(runner)
	if err != nil {
		return nil, err
	}

	defer sandbox.Cleanup()

	for _, file := range files {
		if err = sandbox.SaveFile(file.Path, []byte(file.Content)); err != nil {
			return nil, err
		}
	}

	// input as a file
	if err = sandbox.SaveFile("input.txt", []byte(input)); err != nil {
		return nil, err
	}

	output, err := sandbox.Execute(entrypoint, time.Minute)

	// propagate sandbox execution error so controller can handle it
	return output, err

}
