package runners

import (
	"bytes"
	"context"
	"io"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/pkg/stdcopy"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/docker"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/sandbox"
)

type CppRunner struct{}

func NewCppRunner() *CppRunner {
	return &CppRunner{}
}

func (c *CppRunner) Run(ctx context.Context, hostWorkDir string, containerWorkDir string, entrypoint string) (*sandbox.ExecutionOutput, error) {
	dockerCli, err := docker.GetDockerClient()
	if err != nil {
		return nil, err
	}

	resp, err := dockerCli.Client.ContainerCreate(ctx,
		&container.Config{
			Image:        "gcc:latest",
			Cmd:          []string{"sleep", "infinity"},
			WorkingDir:   containerWorkDir,
			AttachStdout: true,
			AttachStderr: true,
		},
		&container.HostConfig{
			Binds:       []string{hostWorkDir + ":" + containerWorkDir + ":z"},
			Resources:   container.Resources{Memory: 256 * 1024 * 1024, NanoCPUs: 500000000},
			NetworkMode: "none",
			AutoRemove:  false,
		},
		nil,
		nil,
		"",
	)
	if err != nil {
		return nil, err
	}

	containerID := resp.ID
	defer func() {
		stopCtx, stopCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer stopCancel()
		_ = dockerCli.Client.ContainerStop(stopCtx, containerID, container.StopOptions{})

		rmCtx, rmCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer rmCancel()
		_ = dockerCli.Client.ContainerRemove(rmCtx, containerID, container.RemoveOptions{Force: true})
	}()

	if err := dockerCli.Client.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		return nil, err
	}

	execResp, err := dockerCli.Client.ContainerExecCreate(ctx, resp.ID, container.ExecOptions{
		Cmd:          []string{"bash", "-c", "g++ -o output $(find . -name '*.cpp')"},
		AttachStdout: true,
		AttachStderr: true,
		WorkingDir:   containerWorkDir,
	})
	if err != nil {
		return nil, err
	}

	attachComResp, err := dockerCli.Client.ContainerExecAttach(ctx, execResp.ID, container.ExecStartOptions{})
	if err != nil {
		return nil, err
	}
	defer attachComResp.Close()

	var stdout, stderr bytes.Buffer
	_, err = stdcopy.StdCopy(&stdout, &stderr, attachComResp.Reader)
	if err != nil && err != io.EOF {
		return nil, err
	}

	inspect, err := dockerCli.Client.ContainerExecInspect(ctx, execResp.ID)
	if err != nil {
		return nil, err
	}

	if inspect.ExitCode != 0 {
		return &sandbox.ExecutionOutput{
			Stdout: stdout.String(),
			Stderr: stderr.String(),
		}, nil
	}

	execRunResp, err := dockerCli.Client.ContainerExecCreate(ctx, resp.ID, container.ExecOptions{
		Cmd:          []string{"bash", "-c", "./output < input.txt"},
		AttachStdout: true,
		AttachStderr: true,
		WorkingDir:   containerWorkDir,
	})
	if err != nil {
		return nil, err
	}

	attachRunResp, err := dockerCli.Client.ContainerExecAttach(ctx, execRunResp.ID, container.ExecStartOptions{})
	if err != nil {
		return nil, err
	}
	defer attachRunResp.Close()

	_, err = stdcopy.StdCopy(&stdout, &stderr, attachRunResp.Reader)
	if err != nil && err != io.EOF {
		return nil, err
	}

	output := &sandbox.ExecutionOutput{
		Stdout: stdout.String(),
		Stderr: stderr.String(),
	}

	// 4. Limpieza (Stop y Remove)
	err = dockerCli.Client.ContainerStop(ctx, resp.ID, container.StopOptions{})
	if err != nil {
		return output, err
	}

	err = dockerCli.Client.ContainerRemove(ctx, resp.ID, container.RemoveOptions{
		Force: true,
	})
	if err != nil {
		return output, err
	}

	return output, nil
}
