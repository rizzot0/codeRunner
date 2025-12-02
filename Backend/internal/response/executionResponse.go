package response

type ExecutionResponse struct {
	Stdout string `json:"stdout"`
	Stderr string `json:"stderr"`
}
