package com.guidemehome.service;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.guidemehome.client.FirebaseAuthClient;
import com.guidemehome.dto.TokenSuccessResponseDto;
import com.guidemehome.dto.UserCreationRequestDto;
import com.guidemehome.dto.UserLoginRequestDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private Firestore firestore;

    @Mock
    private FirebaseAuth firebaseAuth;

    @Mock
    private FirebaseAuthClient firebaseAuthClient;

    @Mock
    private UserRecord userRecord;

    @Mock
    private CollectionReference collectionReference;

    @Mock
    private DocumentReference documentReference;

    @InjectMocks
    private UserService userService;

    @Test
    void testCreateUserSuccess() throws Exception {
        UserCreationRequestDto userCreationRequest = new UserCreationRequestDto();
        userCreationRequest.setEmail("user@example.com");
        userCreationRequest.setPassword("password123");
        userCreationRequest.setRole("user");

        when(firebaseAuth.createUser(any(UserRecord.CreateRequest.class))).thenReturn(userRecord);
        when(userRecord.getUid()).thenReturn("12345");

        when(firestore.collection("users")).thenReturn(collectionReference);
        when(collectionReference.document("12345")).thenReturn(documentReference);

        userService.create(userCreationRequest);

        verify(documentReference).set(any(Map.class));
    }

    @Test
    void testCreateUserFailure() throws FirebaseAuthException {
        UserCreationRequestDto userCreationRequest = new UserCreationRequestDto();
        userCreationRequest.setEmail("existing@example.com");
        userCreationRequest.setPassword("password123");
        userCreationRequest.setRole("user");

        // Mock the "EMAIL_EXISTS" case
        FirebaseAuthException emailExistsException = mock(FirebaseAuthException.class);
        when(emailExistsException.getMessage()).thenReturn("EMAIL_EXISTS");
        when(firebaseAuth.createUser(any(UserRecord.CreateRequest.class))).thenThrow(emailExistsException);

        // Assert that "EMAIL_EXISTS" results in a ResponseStatusException
        ResponseStatusException conflictException =
                assertThrows(ResponseStatusException.class, () -> userService.create(userCreationRequest));
        assertEquals(HttpStatus.CONFLICT, conflictException.getStatusCode());
        assertEquals("Account with provided email-id already exists", conflictException.getReason());

        // Mock an unhandled FirebaseAuthException case
        FirebaseAuthException otherException = mock(FirebaseAuthException.class);
        when(otherException.getMessage()).thenReturn("Some other error");
        when(firebaseAuth.createUser(any(UserRecord.CreateRequest.class))).thenThrow(otherException);

        // Assert that other exceptions are rethrown as FirebaseAuthException
        FirebaseAuthException thrownException =
                assertThrows(FirebaseAuthException.class, () -> userService.create(userCreationRequest));
        assertEquals("Some other error", thrownException.getMessage());
    }



    @Test
    void testLoginSuccess() throws FirebaseAuthException {
        UserLoginRequestDto userLoginRequest = new UserLoginRequestDto();
        userLoginRequest.setEmail("user@example.com");
        userLoginRequest.setPassword("password123");

        TokenSuccessResponseDto expectedResponse = TokenSuccessResponseDto.builder()
                .accessToken("token123")
                .role("user")
                .build();

        when(firebaseAuthClient.login(userLoginRequest)).thenReturn(expectedResponse);

        TokenSuccessResponseDto actualResponse = userService.login(userLoginRequest);

        assertEquals(expectedResponse.getAccessToken(), actualResponse.getAccessToken());
        assertEquals(expectedResponse.getRole(), actualResponse.getRole());
    }
}
