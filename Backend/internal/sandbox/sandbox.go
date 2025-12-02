package sandbox

import (
	"context"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

type Sandbox struct {
	SessionID        string
	HostWorkDir      string
	ContainerWorkDir string
	runner           Runner
}

type ExecutionOutput struct {
	Stdout string
	Stderr string
}

func NewSandbox(runner Runner) (*Sandbox, error) {

	sessionID := uuid.NewString()
	hostWorkDir := filepath.Join(os.TempDir(), "sandboxes", sessionID)

	if err := os.MkdirAll(hostWorkDir, 0755); err != nil {
		return nil, err
	}

	return &Sandbox{
		SessionID:        sessionID,
		HostWorkDir:      hostWorkDir,
		ContainerWorkDir: "/workspace",
		runner:           runner,
	}, nil
}

func (s *Sandbox) SaveFile(filename string, content []byte) error {
	filePath := filepath.Join(s.HostWorkDir, filename)

	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	return os.WriteFile(filePath, content, 0644)
}

func (s *Sandbox) Execute(entrypoint string, timeout time.Duration) (*ExecutionOutput, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	return s.runner.Run(ctx, s.HostWorkDir, s.ContainerWorkDir, entrypoint)
}

// Esta funcion esta destinada a limpiar los archivos temporales del sandbox
// Mediante un endpoint
// /sandbox/{id}
func (s *Sandbox) Cleanup() error {
	if s == nil || s.HostWorkDir == "" {
		return nil
	}

	return os.RemoveAll(s.HostWorkDir)
}
