package runners

import (
	"bytes"
	"context"
	"io"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/pkg/stdcopy"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/docker"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/sandbox"
)

type PythonRunner struct{}

func NewPythonRunner() *PythonRunner {
	return &PythonRunner{}
}

func (p *PythonRunner) Run(ctx context.Context, hostWorkDir, containerWorkDir, entrypoint string) (*sandbox.ExecutionOutput, error) {
	dockerCli, err := docker.GetDockerClient()
	if err != nil {
		return nil, err
	}

	resp, err := dockerCli.Client.ContainerCreate(ctx,
		&container.Config{
			Image:        "python:3.9-slim",
			Cmd:          []string{"bash", "-c", "python " + entrypoint + " < input.txt"},
			WorkingDir:   containerWorkDir,
			AttachStdout: true,
			AttachStderr: true,
		},
		&container.HostConfig{
			Binds:       []string{hostWorkDir + ":" + containerWorkDir + ":z"},
			Resources:   container.Resources{Memory: 128 * 1024 * 1024, NanoCPUs: 500000000},
			NetworkMode: "none",
			AutoRemove:  true,
		},
		nil,
		nil,
		"",
	)

	if err != nil {
		return nil, err
	}

	if err := dockerCli.Client.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		return nil, err
	}

	statusCh, errCh := dockerCli.Client.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			return nil, err
		}
	case <-statusCh:
	}

	out, err := dockerCli.Client.ContainerLogs(ctx, resp.ID, container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
	})

	if err != nil {
		return nil, err
	}
	defer out.Close()

	var stdout, stderr bytes.Buffer
	_, err = stdcopy.StdCopy(&stdout, &stderr, out)
	if err != nil && err != io.EOF {
		return nil, err
	}

	return &sandbox.ExecutionOutput{
		Stdout: stdout.String(),
		Stderr: stderr.String(),
	}, nil

}
