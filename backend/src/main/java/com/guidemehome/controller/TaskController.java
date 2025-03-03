package com.guidemehome.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.guidemehome.dto.ExceptionResponseDto;
import com.guidemehome.dto.TaskCreationRequestDto;
import com.guidemehome.dto.TaskResponseDto;
import com.guidemehome.dto.TaskUpdationRequestDto;
import com.guidemehome.service.TaskService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tasks")
public class TaskController {

	private final TaskService taskService;

	@PostMapping
	public ResponseEntity<HttpStatus> create(@Valid @RequestBody TaskCreationRequestDto taskCreationRequest) {
		taskService.create(taskCreationRequest);
		return ResponseEntity.ok().build();
	}

	@GetMapping(value = "/{taskId}")
	public ResponseEntity<TaskResponseDto> retrieve(
			@PathVariable(required = true, name = "taskId") final String taskId) {
		final var response = taskService.retrieve(taskId);
		return ResponseEntity.ok(response);
	}

	@GetMapping
	public ResponseEntity<List<TaskResponseDto>> retrieve() {
		final var response = taskService.retrieve();
		return ResponseEntity.ok(response);
	}

	@PutMapping(value = "/{taskId}")
	public ResponseEntity<HttpStatus> update(@PathVariable(required = true, name = "taskId") final String taskId,
			@Valid @RequestBody TaskUpdationRequestDto taskUpdationRequest) {
		taskService.update(taskId, taskUpdationRequest);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping(value = "/{taskId}")
	public ResponseEntity<HttpStatus> delete(@PathVariable(required = true, name = "taskId") final String taskId) {
		taskService.delete(taskId);
		return ResponseEntity.ok().build();
	}

}