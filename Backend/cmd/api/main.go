package main

import (
	"context"
	"net/http"
	"time"

	"github.com/elfaldiajr/compiladorEnLineaCP/internal/config"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/docker"
	"github.com/elfaldiajr/compiladorEnLineaCP/internal/interfaces/routes"
)

func main() {

	if err := config.LoadEnv(); err != nil {
		panic(err)
	}

	if err := docker.PullRequiredImages(context.Background()); err != nil {
		panic(err)
	}

	routes := routes.SetupRouter()

	server := &http.Server{
		Addr: ":" + config.GetEnv("PORT"),
		Handler: routes,
		ReadTimeout: 30 * time.Second,
		WriteTimeout: 30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	if err := server.ListenAndServe(); err != nil {
		panic(err)
	}
}
