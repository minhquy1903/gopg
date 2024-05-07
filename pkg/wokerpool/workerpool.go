package main

import (
	"fmt"
	"sync"
)

type Job struct {
	ID      int
	JobData interface{}
}

type Worker struct {
	ID         int
	JobChannel chan Job
	WorkerPool chan chan Job
	Quit       chan bool
}

func NewWorker(id int, workerPool chan chan Job) Worker {
	return Worker{
		ID:         id,
		JobChannel: make(chan Job),
		WorkerPool: workerPool,
		Quit:       make(chan bool),
	}
}

func (w Worker) Start() {
	go func() {
		for {
			// Register the current worker into the worker pool.
			w.WorkerPool <- w.JobChannel

			select {
			case job := <-w.JobChannel:
				fmt.Printf("Worker with ID %d started processing job %d\n", w.ID, job.ID)
				// Simulate some work
				// process(job)
				fmt.Printf("Worker with ID %d finished processing job %d\n", w.ID, job.ID)
			case <-w.Quit:
				fmt.Printf("Worker with ID %d is quitting\n", w.ID)
				return
			}
		}
	}()
}

func (w Worker) Stop() {
	go func() {
		w.Quit <- true
	}()
}

type WorkerPool struct {
	Workers    []Worker
	JobChannel chan Job
	WorkerPool chan chan Job
	MaxWorkers int
	WaitGroup  sync.WaitGroup
}

func NewWorkerPool(maxWorkers int) *WorkerPool {
	return &WorkerPool{
		Workers:    []Worker{},
		JobChannel: make(chan Job),
		WorkerPool: make(chan chan Job, maxWorkers),
		MaxWorkers: maxWorkers,
	}
}

func (wp *WorkerPool) Run() {
	for i := 0; i < wp.MaxWorkers; i++ {
		worker := NewWorker(i+1, wp.WorkerPool)
		worker.Start()
		wp.Workers = append(wp.Workers, worker)
	}

	wp.WaitGroup.Add(len(wp.Workers))

	go func() {
		for {
			select {
			case job := <-wp.JobChannel:
				// Dequeue a worker from the worker pool
				workerChannel := <-wp.WorkerPool
				// Assign the job to the worker
				workerChannel <- job
			}
		}
	}()
}

func (wp *WorkerPool) AddJob(job Job) {
	wp.JobChannel <- job
}

func (wp *WorkerPool) Wait() {
	wp.WaitGroup.Wait()
}

func main() {
	numWorkers := 3
	numJobs := 5

	// Create a new worker pool
	pool := NewWorkerPool(numWorkers)
	// Start the worker pool
	pool.Run()

	// Add jobs to the worker pool
	for i := 1; i <= numJobs; i++ {
		pool.AddJob(Job{ID: i, JobData: nil})
	}

	// Wait for all jobs to finish
	pool.Wait()
}
