package models

type File struct {
	Path    string `json:"path" binding:"required"`
	Content string `json:"content" binding:"required"`
}
