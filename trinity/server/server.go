package trinitarian

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

type Server struct {
	httpServer *http.Server
}

func NewServer() *Server {
	return &Server{
		httpServer: &http.Server{
			Addr: ":8080",
		},
	}
}

// StartServer starts the server
func StartServer() {
	// Create a new server
	server := NewServer()

	// Start the server
	go func() {
		err := server.Start()
		if err != nil {
			fmt.Println(err)
		}
	}()

	// Wait for a signal to shutdown
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig

	// Shutdown the server
	server.Shutdown()

	fmt.Println("Server shutdown")
}
