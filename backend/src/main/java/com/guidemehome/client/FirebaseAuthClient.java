package com.guidemehome.client;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.guidemehome.dto.TokenSuccessResponseDto;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import com.guidemehome.configuration.FirebaseConfigurationProperties;
import com.guidemehome.dto.FirebaseSignInRequestDto;
import com.guidemehome.dto.FirebaseSignInResponseDto;
import com.guidemehome.dto.UserLoginRequestDto;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;


import lombok.NonNull;
import lombok.RequiredArgsConstructor;


@Component
@RequiredArgsConstructor
@EnableConfigurationProperties(FirebaseConfigurationProperties.class)
public class FirebaseAuthClient {

	private final Firestore firestore;
	private final FirebaseAuth firebaseAuth;
	private final FirebaseConfigurationProperties firebaseConfigurationProperties;

	private static final String BASE_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";
	private static final String API_KEY_PARAM = "key";
	private static final String INVALID_CREDENTIALS_ERROR = "INVALID_LOGIN_CREDENTIALS";

	public TokenSuccessResponseDto login(@NonNull final UserLoginRequestDto userLoginRequest) throws FirebaseAuthException {
		final var requestBody = prepareRequestBody(userLoginRequest);
		final var response = sendSignInRequest(requestBody);

		UserRecord userRecord = firebaseAuth.getUserByEmail(userLoginRequest.getEmail());
		String uuid = userRecord.getUid();

		String role = fetchUserRole(uuid);

		System.out.println("Token: " + response.getIdToken());
		return TokenSuccessResponseDto.builder()
				.accessToken(response.getIdToken())
				.role(role)
				.build();
	}



	private String fetchUserRole(String uuid) {
		try {
			DocumentSnapshot documentSnapshotUsers = firestore.collection("users").document(uuid).get().get();
			DocumentSnapshot documentSnapshotAssistants = firestore.collection("assistants").document(uuid).get().get();
			if (documentSnapshotUsers.exists()) {
				return "user";
			}
			else if (documentSnapshotAssistants.exists()) {
				return "assistant";
			}
			else {
				System.out.println("No valid document or role field found for uuid: " + uuid);
				throw new RuntimeException("No user found for the provided uuid.");
			}
		} catch (Exception e) {
			System.out.println("Exception while fetching user role: " + e.getMessage());
			throw new RuntimeException("Failed to fetch user role", e);
		}
	}




	private FirebaseSignInResponseDto sendSignInRequest(@NonNull final FirebaseSignInRequestDto request) {
		final var webApiKey = firebaseConfigurationProperties.getFirebase().getWebApiKey();
		final FirebaseSignInResponseDto response;
		try {
			response = RestClient.create(BASE_URL)
					.post()
					.uri(uriBuilder -> uriBuilder
							.queryParam(API_KEY_PARAM, webApiKey)
							.build())
					.body(request)
					.contentType(MediaType.APPLICATION_JSON)
					.retrieve()
					.body(FirebaseSignInResponseDto.class);
		} catch (HttpClientErrorException exception) {
			if (exception.getResponseBodyAsString().contains(INVALID_CREDENTIALS_ERROR)) {
				throw new RuntimeException("Invalid Login Credentials");
			}
			throw exception;
		}
		return response;
	}
	
	private FirebaseSignInRequestDto prepareRequestBody(@NonNull final UserLoginRequestDto userLoginRequest) {
		final var request = new FirebaseSignInRequestDto();
		request.setEmail(userLoginRequest.getEmail());
		request.setPassword(userLoginRequest.getPassword());
		request.setReturnSecureToken(Boolean.TRUE);
		return request;
	}

}
