package sandbox

import (
	"context"

)

type Runner interface {
	Run(ctx context.Context, hostWorkDir, containerWorkDir, entrypoint string) (*ExecutionOutput, error)
}
