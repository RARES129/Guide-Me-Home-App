package com.guidemehome.controller;

import com.google.firebase.auth.FirebaseAuthException;
import com.guidemehome.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.guidemehome.configuration.PublicEndpoint;
import com.guidemehome.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {

	private final UserService userService;

	@PublicEndpoint
	@PostMapping
	public ResponseEntity<Void> createUser(@Valid @RequestBody final UserCreationRequestDto userCreationRequest) {
		userService.create(userCreationRequest);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@PublicEndpoint
	@PostMapping(value = "/login")
	public ResponseEntity<TokenSuccessResponseDto> login(
			@Valid @RequestBody final UserLoginRequestDto userLoginRequest) throws FirebaseAuthException {
		final var response = userService.login(userLoginRequest);
		return ResponseEntity.ok(response);
	}

	@PublicEndpoint
	@GetMapping(value="/getAllAssistants/{userId}")
	public ResponseEntity<List<String>> getAllAssistants(
			@PathVariable("userId") String userId) throws ExecutionException, InterruptedException {
		List<String> assistantEmails = userService.getAllAssistants(userId);
		return ResponseEntity.ok(assistantEmails);
	}

	@PublicEndpoint
	@PostMapping(value="/fcmToken")
	public ResponseEntity<Void> saveFcmToken(
			@RequestBody UpdateFcmTokenDto updateFcmTokenDto) {
		System.out.println("User ID: " + updateFcmTokenDto.getUserId());
		System.out.println("FCM Token: " + updateFcmTokenDto.getFcmToken());
		userService.saveFcmToken(updateFcmTokenDto.getUserId(), updateFcmTokenDto.getFcmToken());
		return ResponseEntity.ok().build();
	}

	@PublicEndpoint
	@DeleteMapping(value="/fcmToken")
	public ResponseEntity<Void> deleteFcmToken(
			@RequestBody UserDto userDto) {
		userService.deleteFcmToken(userDto.getUserId());
		return ResponseEntity.ok().build();
	}
}