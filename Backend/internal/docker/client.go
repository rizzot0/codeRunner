package docker

import (
	"context"
	"fmt"
	"io"
	"sync"

	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
)

var lock = &sync.Mutex{}

type DockerClient struct {
	Client *client.Client
}

var (
	dockerClient *DockerClient
)

func GetDockerClient() (*DockerClient, error) {
	if dockerClient == nil {
		lock.Lock()
		defer lock.Unlock()
		if dockerClient == nil {
			cli, err := client.NewClientWithOpts(
				client.FromEnv,
				client.WithAPIVersionNegotiation(),
			)
			if err != nil {
				return nil, err
			}
			dockerClient = &DockerClient{
				Client: cli,
			}
			return dockerClient, nil
		} else {
			return dockerClient, nil
		}
	} else {
		return dockerClient, nil
	}
}

func PullRequiredImages(ctx context.Context) error {
	dc, err := GetDockerClient()
	if err != nil {
		return err
	}
	// Despues cambiar, tuve problemas con .env
	images := []string{"python:3.9-slim", "gcc:latest", "node:22-slim"}

	for _, img := range images {
		fmt.Printf("Pulling image: %s\n", img)
		reader, err := dc.Client.ImagePull(ctx, img, image.PullOptions{})
		if err != nil {
			return err
		}
		_, err = io.Copy(io.Discard, reader)
		reader.Close()
		if err != nil {
			return err
		}
		fmt.Printf("Successfully pulled: %s\n", img)
	}

	return nil
}
