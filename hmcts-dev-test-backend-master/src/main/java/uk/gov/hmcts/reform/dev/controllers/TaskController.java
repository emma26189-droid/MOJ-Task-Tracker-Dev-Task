package uk.gov.hmcts.reform.dev.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import uk.gov.hmcts.reform.dev.models.Task;
import uk.gov.hmcts.reform.dev.models.TaskRequest;
import uk.gov.hmcts.reform.dev.services.TaskService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class TaskController {
    private static final Logger log = LoggerFactory.getLogger(TaskController.class);
    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest taskRequest) {
        log.info("Creating new task with title: {}", taskRequest.getTitle());
        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setStatus(taskRequest.getStatus());
        task.setDueDate(taskRequest.getDueDate());

        Task savedTask = taskService.createTask(task);
        log.info("Task created successfully with id: {}", savedTask.getId());
        return new ResponseEntity<>(savedTask, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable Long id) {
        log.info("Fetching task with id: {}", id);
        Task task = taskService.getTask(id);
        log.info("Task found: {}", task);
        return ResponseEntity.ok(task);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String order) {

        log.info("Fetching all tasks with filters - status: {}, sort: {}, order: {}", status, sort, order);
        List<Task> tasks = taskService.getAllTasks();

        if (status != null && !status.isEmpty()) {
            tasks = tasks.stream()
                    .filter(task -> status.equalsIgnoreCase(task.getStatus()))
                    .collect(Collectors.toList());
        }

        if (sort != null) {
            Comparator<Task> comparator = switch (sort) {
                case "dueDate" -> Comparator.comparing(Task::getDueDate);
                case "title" -> Comparator.comparing(Task::getTitle);
                default -> null;
            };

            if (comparator != null) {
                if ("desc".equalsIgnoreCase(order)) {
                    comparator = comparator.reversed();
                }
                tasks.sort(comparator);
            }
        }

        log.info("Returning {} tasks", tasks.size());
        return ResponseEntity.ok(tasks);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody @NotBlank(message = "Status cannot be blank") String status) {
        log.info("Updating status for task id: {} to: {}", id, status);
        Task updatedTask = taskService.updateTaskStatus(id, status);
        log.info("Task status updated successfully");
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        log.info("Deleting task with id: {}", id);
        taskService.deleteTask(id);
        log.info("Task deleted successfully");
        return ResponseEntity.noContent().build();
    }
}