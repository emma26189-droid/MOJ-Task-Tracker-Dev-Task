package uk.gov.hmcts.reform.dev.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import uk.gov.hmcts.reform.dev.models.Task;
import uk.gov.hmcts.reform.dev.models.TaskRequest;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
@SpringBootTest(webEnvironment = RANDOM_PORT)
public class TaskIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldCreateAndRetrieveTask() {
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("Test Task");
        taskRequest.setDescription("Test Description");
        taskRequest.setStatus("TO_DO");
        taskRequest.setDueDate(LocalDateTime.now().plusDays(1));

        ResponseEntity<Task> createResponse = restTemplate.postForEntity("/api/tasks", taskRequest, Task.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResponse.getBody()).isNotNull();
        Long taskId = createResponse.getBody().getId();

        ResponseEntity<Task> getResponse = restTemplate.getForEntity("/api/tasks/" + taskId, Task.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody()).isNotNull();
        assertThat(getResponse.getBody().getId()).isEqualTo(taskId);
    }

    @Test
    void shouldUpdateTaskStatus() {
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("Update Test");
        taskRequest.setStatus("TO_DO");
        taskRequest.setDueDate(LocalDateTime.now().plusDays(1));

        ResponseEntity<Task> createResponse = restTemplate.postForEntity("/api/tasks", taskRequest, Task.class);
        Long taskId = createResponse.getBody().getId();

        restTemplate.patchForObject("/api/tasks/" + taskId + "/status", "IN_PROGRESS", Task.class);

        ResponseEntity<Task> getResponse = restTemplate.getForEntity("/api/tasks/" + taskId, Task.class);
        assertThat(getResponse.getBody()).isNotNull();
        assertThat(getResponse.getBody().getStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    void shouldDeleteTask() {
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("Delete Test");
        taskRequest.setStatus("TO_DO");
        taskRequest.setDueDate(LocalDateTime.now().plusDays(1));

        ResponseEntity<Task> createResponse = restTemplate.postForEntity("/api/tasks", taskRequest, Task.class);
        Long taskId = createResponse.getBody().getId();

        restTemplate.delete("/api/tasks/" + taskId);

        ResponseEntity<Task> getResponse = restTemplate.getForEntity("/api/tasks/" + taskId, Task.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldReturnValidationErrorForInvalidTask() {
        TaskRequest taskRequest = new TaskRequest();

        ResponseEntity<String> response = restTemplate.postForEntity("/api/tasks", taskRequest, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Validation Error");
    }
}