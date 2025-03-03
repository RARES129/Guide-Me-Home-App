package com.guidemehome.service;

import java.util.List;

import com.guidemehome.entity.TaskStatus;
import com.guidemehome.utility.AuthenticatedUserIdProvider;
import com.guidemehome.utility.DateUtility;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.guidemehome.dto.TaskCreationRequestDto;
import com.guidemehome.dto.TaskResponseDto;
import com.guidemehome.dto.TaskUpdationRequestDto;
import com.guidemehome.entity.Task;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TaskService {

	private final Firestore firestore;
	private final DateUtility dateUtility;
	private final AuthenticatedUserIdProvider authenticatedUserIdProvider;

	public TaskResponseDto retrieve(@NonNull final String taskId) {
		final var retrievedDocument = get(taskId);
		final var task = retrievedDocument.toObject(Task.class);
		verifyTaskOwnership(task);
		
		return creatResponse(retrievedDocument, task);
	}

	@SneakyThrows
	public List<TaskResponseDto> retrieve() {
		final var userId = authenticatedUserIdProvider.getUserId();
		return firestore.collection(Task.name()).whereEqualTo("createdBy", userId)
				.get().get().getDocuments()
				.stream()
				.map(document -> {
					final var task = document.toObject(Task.class);
					return creatResponse(document, task);
				}).toList();
	}

	public void create(@NonNull final TaskCreationRequestDto taskCreationRequest) {
		final var task = new Task();
		task.setStatus(TaskStatus.NEW);
		task.setTitle(taskCreationRequest.getTitle());
		task.setDescription(taskCreationRequest.getDescription());
		task.setDueDate(dateUtility.convert(taskCreationRequest.getDueDate()));
		task.setCreatedBy(authenticatedUserIdProvider.getUserId());

		firestore.collection(Task.name()).document().set(task);
	}

	public void update(@NonNull final String taskId, @NonNull final TaskUpdationRequestDto taskUpdationRequest) {
		final var retrievedDocument = get(taskId);
		final var task = retrievedDocument.toObject(Task.class);
		verifyTaskOwnership(task);
		
		task.setDescription(taskUpdationRequest.getDescription());
		task.setStatus(taskUpdationRequest.getStatus());
		task.setDueDate(dateUtility.convert(taskUpdationRequest.getDueDate()));
		
		firestore.collection(Task.name()).document(retrievedDocument.getId()).set(task);
	}

	public void delete(@NonNull final String taskId) {
		final var document = get(taskId);
		final var task = document.toObject(Task.class);
		verifyTaskOwnership(task);
		
		firestore.collection(Task.name()).document(document.getId()).delete();
	}

	private void verifyTaskOwnership(@NonNull final Task task) {
		final var userId = authenticatedUserIdProvider.getUserId();
		final var taskBelongsToUser = task.getCreatedBy().equals(userId);
		if (Boolean.FALSE.equals(taskBelongsToUser)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Insufficient privileges to perform this action.");
		}
	}

	@SneakyThrows
	private DocumentSnapshot get(@NonNull final String taskId) {
		final var retrievedDocument = firestore.collection(Task.name()).document(taskId).get().get();
		final var documentExists = retrievedDocument.exists();
		if (Boolean.FALSE.equals(documentExists)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No task exists in the system with provided-id");
		}
		return retrievedDocument;
	}

	private TaskResponseDto creatResponse(final DocumentSnapshot document, final Task task) {
		return TaskResponseDto.builder()
				.id(document.getId())
				.title(task.getTitle())
				.status(task.getStatus())
				.description(task.getDescription())
				.createdAt(dateUtility.convert(document.getCreateTime()))
				.updatedAt(dateUtility.convert(document.getUpdateTime()))
				.build();
	}

}
