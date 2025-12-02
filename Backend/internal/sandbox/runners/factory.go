package runners

import (
	"errors"

	"github.com/elfaldiajr/compiladorEnLineaCP/internal/sandbox"
)

func FactoryRunners(programmingLanguage string) (sandbox.Runner, error) {
	switch programmingLanguage {
	case "python":
		return NewPythonRunner(), nil
	case "c++":
		return NewCppRunner(), nil
	case "c":
		return NewCppRunner(), nil
	case "cpp":
		return NewCppRunner(), nil
	case "javascript":
		return NewJavascriptRunner(), nil
	default:
		return nil, errors.New("programming language not implemented")
	}
}
